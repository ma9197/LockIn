// Read-only data API: the field guides and the plain-text renderer.
//
// These guides are the whole point of the endpoint. A model handed raw lc_solves rows will
// count rows and report 24 problems solved when the real answer is 20, because reruns are
// normal here. Every counting rule the site enforces is spelled out below so the answer the
// model gives matches the answer the Progress tab gives.
//
// This file is a normal module, NOT a page script, so ordinary template literals are safe here.

const SHARED_PARAMS = {
  limit: 'Max rows to return. 1..5000. Omit it and you get every row. Filters rows only, never the stats or the total.',
  offset: 'Rows to skip before returning, for paging through a big result. Default 0.',
  since: 'YYYY-MM-DD. Keeps only rows on or after that date. Unlike limit, this DOES narrow the total and the returned rows together. A malformed value is a 400, never a silent full dump.',
  format: 'json (default) or md. md returns the same content as plain text if raw JSON is awkward to read.',
  key: 'Your read key. Send it as ?key=... in the URL, or as an Authorization: Bearer header. It is read-only: there is no write endpoint it can reach.',
};

const SHARED_ENVELOPE = {
  guide: 'This object. Static, it never changes between requests.',
  meta: 'Which endpoint answered, today\'s date in the user\'s zone, the plan window, and the params that were applied.',
  total: 'Row count computed in SQL with the same since filter, ignoring limit and offset. This is the true size of the dataset.',
  returned: 'How many rows are actually in the rows array. If returned is less than total you are looking at a slice, so say so rather than reporting the slice as the whole picture.',
  stats: 'Pre-computed numbers, produced by the exact same code that renders the site. Prefer these over recomputing from rows.',
  rows: 'The raw records.',
};

// Built per request from the user's config, so the prose never contradicts the data.
export const guides = cfg => {
  const tz = (cfg && cfg.tz) || 'UTC';
  const TZ = tz + '. Every date is local wall time in that zone, YYYY-MM-DD form. Do not convert to UTC, and do not assume the reader is in another zone.';
  const plan = cfg && cfg.plan;
  const START = plan ? plan.start : 'the start';
  const END = plan ? plan.end : 'the end of the plan';
  const PLAN = plan ? ('The grind plan runs ' + plan.start + ' to ' + plan.end + '. Days before the start are outside the plan.')
    : 'No plan window is set. pace, plan and consistency fields are null and "since the plan started" filters cover all history.';
  const CATS = ((cfg && cfg.categories) || []).map(c => c.key + ' = ' + c.name).join(', ') || 'none configured';
  return {
  leetcode: {
    about: 'Read-only snapshot of this user\'s LeetCode practice log: every timed attempt, one rollup per problem, and the same headline numbers the LockIn Progress tab shows. Nothing here can be written to.',
    timezone: TZ,
    planWindow: PLAN,
    envelope: SHARED_ENVELOPE,
    params: SHARED_PARAMS,
    enums: {
      finished: { 0: 'did not finish, gave up on this attempt', 1: 'solved cleanly', 2: 'solved but with a bad runtime' },
      outcome: 'A plain-English mirror of finished: unfinished / solved / slow.',
      difficulty: 'easy, medium or hard, as LeetCode labels the problem.',
      source: 'timer = recorded live by the focus timer. manual = typed in afterwards.',
    },
    countingRules: [
      'A problem\'s state is its NEWEST attempt, not its best one. Re-running a slow problem cleanly makes it clean; a rerun that fails makes it open again. Never take the max of finished across a problem\'s attempts.',
      'Reruns are normal and expected. NEVER count attempt rows when the question is how many problems were solved. 24 attempt rows over 20 distinct problems is a typical ratio. Use stats.problemCount and stats.totals.solvedTotal, not rows.length.',
      'Three counters answer three different questions, on purpose. (1) The daily counter, stats.daily[].v, counts EVERY attempt including failures, because a 45 minute failure is still work. (2) Solve-time numbers (stats.totals.avg, the per-difficulty averages) count solved and slow rows only, because an abandoned attempt has no solve time and would poison the average. (3) Anything labelled solved (stats.totals.solvedTotal, stats.pace.done) counts DISTINCT PROBLEMS whose latest attempt was a CLEAN solve.',
      'A slow solve (finished = 2) does NOT count as solved anywhere. It is a working answer, but it still owes a clean rerun, so it is reported separately in stats.totals.slowTotal and it stays in the come-back queue. The revisit set is latest in (0, 2).',
      'Every problem ever opened is solvedTotal + openTotal + slowTotal. Those three sets do not overlap, so add them to get the true problem count.',
      'Off days zero that day\'s goal, which makes them neutral for the streak, because the streak only walks rows where goal > 0.',
      'The streak skips today when today\'s goal is not met yet, so it never reads as broken in the middle of a day.',
      'stats.consistency stops at yesterday. A day still in progress is not a miss.',
      'stats.plan is a FORECAST for ' + END + ', not a debt owed today. It carries the rate so far forward. stats.pace is the card that answers where things stand today.',
    ],
    fields: {
      'total': 'Number of attempt ROWS, not problems.',
      'rows[]': 'One row per attempt. The same problem appears once per try.',
      'rows[].minutes': 'Minutes spent on that single attempt. Not cumulative.',
      'stats.problemCount': 'Distinct named problems ever attempted. Compare against total to see the rerun ratio.',
      'stats.problems[]': 'One entry per distinct problem, grouped case-insensitively on the trimmed name. tries = attempts, totalMin = minutes summed across them, latest = the newest attempt\'s finished value, solved = true only when that latest attempt was a CLEAN solve, daysSince = days since the last attempt.',
      'stats.totals.solvedTotal': 'Distinct problems whose latest attempt is a CLEAN solve (1), plus any unnamed clean rows. This is the number the site calls "LeetCode solved". Slow solves are NOT in it.',
      'stats.totals.openTotal': 'Distinct problems whose latest attempt is 0, never solved. Does not include slow solves.',
      'stats.totals.slowTotal': 'Distinct problems whose latest attempt is 2: solved, but too slow to count as done. Outstanding work, counted separately from both of the above.',
      'stats.totals.total': 'Attempt rows that reached an answer (solved or slow). This is the sample size behind the averages, NOT a problem count.',
      'stats.totals.attempts': 'Attempt rows that were abandoned.',
      'stats.totals.avgNow / avgPrev': 'Average solve minutes over the last 7 days versus the 7 before that. Lower is better.',
      'stats.pace': 'done vs target since ' + START + '. diff negative means behind.',
      'stats.plan': 'elapsed and left are days. lc is the total problems the whole plan asks for by ' + END + '.',
      'stats.consistency': 'days = days that had a goal, hit = days the goal was met.',
      'stats.daily[]': 'The day counter per date: g = goal, v = attempts logged that day.',
      'stats.last30[]': 'Last 30 days: v = attempts logged, g = that day\'s goal, hit = whether the goal was met.',
    },
    windows: [
      'stats.totals.trend is a fixed 30 day window and stats.last30 is a fixed 30 entries. A short array means no data on those days, not missing data.',
      'The averages, trends and per-difficulty numbers in stats.totals derive from the newest 5000 attempt rows, which is the same window the Progress tab uses. For most users that is the entire table.',
    ],
    notIncluded: [
      'Per-problem notes (the lc_notes table) are NEVER returned by this API, in any format. Do not claim to have read their written solutions.',
      'There is no write endpoint on this key. Do not offer to log, edit or delete anything through it.',
    ],
  },

  jobs: {
    about: 'Read-only snapshot of this user\'s job application tracker: every application row plus the same funnel and pace numbers the LockIn Jobs tab shows. Nothing here can be written to.',
    timezone: TZ,
    planWindow: PLAN,
    envelope: SHARED_ENVELOPE,
    params: { ...SHARED_PARAMS, status: 'Filter to one status.', company: 'Exact company match, case-insensitive.', q: 'Substring search over title and company.', date: 'Exact date match.' },
    enums: {
      status: { applied: 'sent, no response yet', oa: 'online assessment received', interview: 'interviewing', offer: 'offer received', rejected: 'rejected' },
      source: 'agent = logged by the user\'s CV agent through the API. manual = added in the UI.',
    },
    countingRules: [
      'funnel.applied is the count of ALL job rows, not rows whose status is "applied". It is the top of the funnel.',
      'The funnel stages are CUMULATIVE and nested: offer is inside interview, which is inside oa. Do not add them together, that double counts.',
      'funnel.heardBack is the total minus the rows still sitting at status "applied". The response rate is heardBack / applied.',
      'There are three job counts and they can disagree. total is SQL COUNT of the jobs table. jobsMeta.total is the same number. stats.pace.done comes from the daily counter and can be HIGHER, because deleting a job on a day whose counter is already 0 cannot go negative. Trust total for "how many applications exist".',
      'stats.consistency stops at yesterday. A day still in progress is not a miss.',
      'stats.plan is a FORECAST for ' + END + ' at the current rate, not a debt owed today.',
    ],
    fields: {
      'total': 'Number of job rows matching the filters.',
      'rows[].date': 'The day the application was sent, which is the day it counted toward the goal.',
      'rows[].platform': 'Where it was found. Anything unrecognised is filed as "Other · name".',
      'rows[].url': 'The posting link. Often dead for older rows, postings expire.',
      'stats.funnel': 'applied / oa / interview / offer / rejected / heardBack. See the counting rules, the stages are cumulative.',
      'stats.byPlatform[]': 'p = platform name, n = applications sent there.',
      'stats.pace': 'done vs target since ' + START + '. diff positive means ahead of plan.',
      'stats.plan': 'apps is the total applications the whole plan asks for by ' + END + '.',
      'stats.jobsMeta.lastDate': 'Date of the most recent application. Use it against meta.today to say how many days it has been.',
      'stats.history[]': 'Applications per day: g = goal, v = sent.',
      'stats.last30[]': 'Last 30 days, same shape.',
      'stats.week': '[this rolling 7 days, the 7 before that].',
    },
    windows: ['stats.last30 is a fixed 30 entries. A short array means no applications on those days, not missing data.'],
    notIncluded: ['There is no write endpoint on this key. Do not offer to log, edit or delete an application through it.'],
  },

  progress: {
    about: 'Read-only snapshot of the whole LockIn progress dataset: grind hours, streak, pace against the plan, the ' + END + ' forecast, weekday patterns, records and off days. This is byte-for-byte what the Progress tab renders, so any number here can be quoted back with confidence. Nothing here can be written to.',
    timezone: TZ,
    planWindow: PLAN,
    envelope: { ...SHARED_ENVELOPE, rows: 'Not used by this endpoint. The data is entirely in stats.' },
    params: SHARED_PARAMS,
    enums: {
      'grind task': 'A category key. This user\'s categories: ' + CATS + '. These are what a grind block gets split across.',
      'grind.dow[].w': '0 = Sunday through 6 = Saturday.',
    },
    countingRules: [
      'Grind hours are wall clock minus paused minutes. A session that ran 4 hours with 40 minutes paused counts as 3h20m, everywhere.',
      'Overtime is time worked BEYOND the block that was planned, with pause already excluded. It is not the same as total hours.',
      'The streak walks leetcode goal rows newest first, skipping today when today\'s goal is not met yet, and stops at the first miss. Off days have their goal zeroed so they are skipped, not counted as misses.',
      'pace.leetcode.done counts DISTINCT PROBLEMS whose latest attempt was a clean solve. It is not a count of attempt rows. totalLC uses the same rule, so the two agree.',
      'plan is a FORECAST for ' + END + ' carrying the current rate forward. plan.lc and plan.apps are what the whole plan asks for by then, not what is owed today. pace is the card that answers today.',
      'consistency stops at yesterday. A day still in progress is not a miss.',
      'grind.targetDays counts days that reached the 6 hour target, out of grind.days checked in.',
    ],
    fields: {
      'streak': 'Consecutive days meeting the LeetCode goal.',
      'totalLC': 'Distinct problems CLEANLY solved, latest attempt wins. A problem solved slowly is in lc.slowTotal instead, not here.',
      'totalApps': 'Applications sent, from the daily counter.',
      'grind.total': 'Total effective grind hours, pause excluded.',
      'grind.avg': 'Hours per day checked in, not per calendar day.',
      'grind.dow[]': 'Average hours by weekday. avg = mean hours, n = how many of that weekday were worked. n = 0 means never worked that weekday.',
      'grind.moduleTotals': 'Minutes per task type across all sessions.',
      'grind.moduleDays': 'The same split broken down by date.',
      'grind.last14[]': 'Last 14 days: v = hours, g = 6 hour target, hit = whether it was reached.',
      'heat[]': 'Last 56 days of grind hours, for the heatmap.',
      'lc': 'The LeetCode block. Identical to the stats on the leetcode endpoint, minus the raw rows.',
      'offdays': 'Deliberate rest days. They zero that day\'s goals, so they never break the streak.',
      'records': 'Best single days and the longest streak ever reached.',
      'week': 'Each entry is [this rolling 7 days, the 7 before that].',
    },
    windows: [
      'Fixed windows, a short array is not missing data: lc.trend and lc30 and apps30 are 30 entries, heat is 56, grind.last14 is 14, grind.dow is always 7.',
    ],
    notIncluded: [
      'Per-problem notes are never returned by this API.',
      'There is no write endpoint on this key.',
    ],
  },
  };
};

// ---------- plain-text renderer ----------

const scalar = v => {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'boolean') return v ? 'yes' : 'no';
  return String(v);
};

const isPlainObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const isRowArray = v => Array.isArray(v) && v.length > 0 && v.every(isPlainObj);

function mdTable(rows, out, indent) {
  const cols = [];
  for (const r of rows) for (const k of Object.keys(r)) if (!cols.includes(k)) cols.push(k);
  const cell = v => (isPlainObj(v) || Array.isArray(v)) ? JSON.stringify(v) : scalar(v);
  out.push(indent + '| ' + cols.join(' | ') + ' |');
  out.push(indent + '|' + cols.map(() => '---').join('|') + '|');
  for (const r of rows) out.push(indent + '| ' + cols.map(k => cell(r[k])).join(' | ') + ' |');
}

function mdValue(key, val, out, depth) {
  const pad = '  '.repeat(depth);
  if (isRowArray(val)) {
    out.push('', pad + key + ' (' + val.length + ')');
    mdTable(val, out, pad);
    return;
  }
  if (Array.isArray(val)) { out.push(pad + key + ': ' + (val.length ? val.map(scalar).join(', ') : '(none)')); return; }
  if (isPlainObj(val)) {
    if (depth >= 3) { out.push(pad + key + ': ' + JSON.stringify(val)); return; }
    out.push(pad + key + ':');
    for (const [k, v] of Object.entries(val)) mdValue(k, v, out, depth + 1);
    return;
  }
  out.push(pad + key + ': ' + scalar(val));
}

function guideToMd(g, out) {
  out.push('# LockIn read-only data', '', g.about, '');
  out.push('Dates: ' + g.timezone);
  out.push('Plan: ' + g.planWindow, '');
  out.push('## How to read this, please follow these rules', '');
  g.countingRules.forEach((r, i) => out.push((i + 1) + '. ' + r));
  out.push('', '## Values you will see', '');
  for (const [k, v] of Object.entries(g.enums || {})) {
    if (isPlainObj(v)) out.push('- ' + k + ': ' + Object.entries(v).map(([a, b]) => a + ' = ' + b).join('; '));
    else out.push('- ' + k + ': ' + v);
  }
  out.push('', '## What each field means', '');
  for (const [k, v] of Object.entries(g.fields || {})) out.push('- ' + k + ': ' + v);
  out.push('', '## The response envelope', '');
  for (const [k, v] of Object.entries(g.envelope || {})) out.push('- ' + k + ': ' + v);
  out.push('', '## Query parameters', '');
  for (const [k, v] of Object.entries(g.params || {})) out.push('- ' + k + ': ' + v);
  if (g.windows && g.windows.length) { out.push('', '## Fixed windows', ''); g.windows.forEach(w => out.push('- ' + w)); }
  out.push('', '## Not available here', '');
  (g.notIncluded || []).forEach(n => out.push('- ' + n));
}

// Renders a payload as readable plain text. Same data as the JSON, nothing added, nothing dropped.
export function toMarkdown(payload) {
  const out = [];
  guideToMd(payload.guide, out);
  out.push('', '## This response', '');
  out.push('- endpoint: ' + payload.meta.endpoint);
  out.push('- today: ' + payload.meta.today + ' (' + payload.meta.timezone + ')');
  out.push('- total rows in the dataset: ' + payload.total);
  out.push('- rows included below: ' + payload.returned);
  if (payload.returned < payload.total) out.push('- WARNING: this is a slice, not the whole dataset. Say so before drawing conclusions.');
  const p = payload.meta.params || {};
  out.push('- params applied: ' + Object.entries(p).map(([k, v]) => k + '=' + scalar(v)).join(', '));
  out.push('', '## Stats', '');
  for (const [k, v] of Object.entries(payload.stats || {})) mdValue(k, v, out, 0);
  if (Array.isArray(payload.rows)) {
    out.push('', '## Raw rows (' + payload.rows.length + ')', '');
    if (payload.rows.length) mdTable(payload.rows, out, ''); else out.push('(none)');
  }
  return out.join('\n') + '\n';
}
