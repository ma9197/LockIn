// Index of every page renderer, used by scripts/check.mjs to render each page with a fake
// config and parse every emitted <script>. Each export takes (cfg, opts) and returns HTML.
import { dashboardPage } from './dashboard.js';
import { calendarPage } from './calendar.js';
import { progressPage } from './progress.js';
import { leetcodePage } from './leetcode.js';
import { jobsPage } from './jobs.js';
import { copyPage } from './copy.js';
import { friendsPage } from './friends.js';
import { settingsPage } from './settings.js';
import { bookPage } from './book.js';
import { sharePinPage, shareOffPage } from './pin.js';
import { landingPage, signupPage, loginPage, forgotPage, resetPage } from './auth.js';
export const forgot = () => forgotPage();
export const reset = () => resetPage('0'.repeat(64));
import { onboardPage } from './onboard.js';

export const today = cfg => dashboardPage(cfg);
export const calendar = cfg => calendarPage(cfg);
export const progress = cfg => progressPage(cfg);
export const progressShared = cfg => progressPage(cfg, { share: true });
export const leetcode = cfg => leetcodePage(cfg);
export const jobs = cfg => jobsPage(cfg);
export const copy = cfg => copyPage(cfg);
export const friends = cfg => friendsPage(cfg);
export const settings = cfg => settingsPage(cfg);
export const book = cfg => bookPage(cfg);
export const sharePin = cfg => sharePinPage(cfg, '');
export const shareOff = () => shareOffPage();
export const landing = () => landingPage();
export const signup = () => signupPage();
export const login = () => loginPage();
export const onboard = cfg => onboardPage({ display_name: cfg.user.displayName, handle: cfg.user.handle });
