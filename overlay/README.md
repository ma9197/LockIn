# LockIn Overlay

A tiny tray app (Tauri 2) that floats your live LockIn grind session and focus timer over any
program, half transparent and click-through. Users get it from **Settings → Integrations → Desktop
overlay** inside LockIn; this folder is only for building it.

```
src/            the two pages: index.html (the overlay chip) and pair.html (first-run pairing)
src/fonts/      Archivo + Atkinson Hyperlegible (OFL), bundled so the design needs no internet
src-tauri/      Rust side: tray menu, pairing window, autostart, tray status; tauri.conf.json
```

## How it works
- Pairing: LockIn shows a 6-character code (valid 10 min). The helper posts it to
  `POST /api/overlay/pair` and receives an `overlay` token that can only read
  `GET /api/overlay/state`. The token lives in the app's local store (`settings.json`).
- Polling: every 15 s idle, every 5 s while something runs. Seconds tick locally.
- Placement, size, opacity, offset and "show the timer" come from LockIn Settings with every poll.
  The display, "Start with system", "Pair again" and Quit live in the tray menu.
- Nothing running → the window is hidden. Any error → hidden + grey tray icon with a tooltip.

## Build locally
```
# once: Rust (https://rustup.rs) and, on Windows, the WebView2 runtime (ships with Windows 11)
cd overlay && npm ci
npx tauri dev            # runs against https://cslockin.com by default; the pairing window lets you point it at http://localhost:8787
npx tauri build          # installers land in src-tauri/target/release/bundle/
```

## Release
1. Bump `version` in `src-tauri/tauri.conf.json` and `src-tauri/Cargo.toml`.
2. `git tag overlay-v1.2.3 && git push --tags` → `.github/workflows/overlay.yml` builds Windows + macOS,
   signs the updater manifest and publishes the GitHub Release. `/overlay/download` on the site
   redirects to the newest asset for the visitor's OS.
3. Updater signing: the public key is in `tauri.conf.json` (`plugins.updater.pubkey`); the private key
   and its password are the repository secrets `TAURI_SIGNING_PRIVATE_KEY` /
   `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. Generate a pair once with `npx tauri signer generate -w ~/.tauri/lockin-overlay.key`.

Builds are not code-signed (no Apple or Windows certificate), so first launch shows the usual
"unknown publisher" prompt on both platforms. The release notes tell users what to click.
