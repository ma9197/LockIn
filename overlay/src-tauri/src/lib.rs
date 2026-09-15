// LockIn Overlay: a tray app with one transparent, always-on-top, click-through window that
// shows the live grind session and focus timer. The page (src/app.js) does the polling and
// drawing; Rust owns the tray, the pairing window, autostart and the connection status shown
// in the tray menu.

use tauri::{
    image::Image,
    menu::{CheckMenuItem, Menu, MenuItem, Submenu},
    tray::{TrayIcon, TrayIconBuilder},
    AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};

const TRAY_ON: &[u8] = include_bytes!("../icons/tray-on.png");
const TRAY_OFF: &[u8] = include_bytes!("../icons/tray-off.png");

struct Tray {
    icon: TrayIcon,
    status: MenuItem<tauri::Wry>,
}

/// Opens (or fronts) the small pairing window. Always runs on the main thread: building a
/// window from a synchronous command deadlocks the event loop on Windows (the 1.0.0 white box).
fn show_pair(app: &AppHandle) {
    let app2 = app.clone();
    let _ = app.run_on_main_thread(move || {
        if let Some(w) = app2.get_webview_window("pair") {
            let _ = w.show();
            let _ = w.unminimize();
            let _ = w.set_focus();
            return;
        }
        let _ = WebviewWindowBuilder::new(&app2, "pair", WebviewUrl::App("pair.html".into()))
            .title("Pair LockIn Overlay")
            .inner_size(420.0, 500.0)
            .resizable(false)
            .always_on_top(true)   // stays visible over the browser the user copies the code from
            .center()
            .build();
    });
}

/// Called by the page on first run and when the token stops working.
#[tauri::command]
async fn open_pair(app: AppHandle) {
    show_pair(&app);
}

/// The page reports whether the last poll worked; the tray shows it.
#[tauri::command]
fn set_status(app: AppHandle, connected: bool, detail: String) {
    if let Some(t) = app.try_state::<Tray>() {
        let icon = if connected { TRAY_ON } else { TRAY_OFF };
        if let Ok(img) = Image::from_bytes(icon) {
            let _ = t.icon.set_icon(Some(img));
        }
        let label = if connected { format!("● Connected · {}", detail) } else { format!("○ {}", detail) };
        let _ = t.status.set_text(&label);
        let _ = t.icon.set_tooltip(Some(format!("LockIn Overlay · {}", label)));
    }
}

#[tauri::command]
fn monitors(app: AppHandle) -> Vec<serde_json::Value> {
    app.available_monitors()
        .unwrap_or_default()
        .iter()
        .enumerate()
        .map(|(i, m)| {
            let p = m.position();
            let s = m.size();
            serde_json::json!({ "index": i, "name": m.name().cloned().unwrap_or_else(|| format!("Display {}", i + 1)),
                "x": p.x, "y": p.y, "width": s.width, "height": s.height, "scale": m.scale_factor() })
        })
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // a second launch just fronts the pairing window if it exists, otherwise does nothing
            // (a paired helper with nothing running shows nothing on purpose)
            let h = app.clone();
            if h.get_webview_window("pair").is_some() { show_pair(&h); }
        }))
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--autostart"])))
        .invoke_handler(tauri::generate_handler![open_pair, set_status, monitors])
        .setup(|app| {
            let handle = app.handle().clone();

            // ---- tray menu ----
            let status = MenuItem::with_id(app, "status", "○ Not connected", false, None::<&str>)?;
            let autostart_on = app.autolaunch().is_enabled().unwrap_or(false);
            let autostart = CheckMenuItem::with_id(app, "autostart", "Start with system", true, autostart_on, None::<&str>)?;
            let pair = MenuItem::with_id(app, "pair", "Pair again…", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit LockIn Overlay", true, None::<&str>)?;

            // one entry per display; the page keeps the choice in its store and repositions itself
            let mons = app.available_monitors().unwrap_or_default();
            let mut mon_items: Vec<CheckMenuItem<tauri::Wry>> = Vec::new();
            for (i, m) in mons.iter().enumerate() {
                let name = m.name().cloned().unwrap_or_else(|| format!("Display {}", i + 1));
                let label = format!("{} ({}×{})", name, m.size().width, m.size().height);
                mon_items.push(CheckMenuItem::with_id(app, format!("mon-{}", i), label, true, i == 0, None::<&str>)?);
            }
            let mon_refs: Vec<&dyn tauri::menu::IsMenuItem<tauri::Wry>> = mon_items.iter().map(|m| m as &dyn tauri::menu::IsMenuItem<tauri::Wry>).collect();
            let monitor_menu = Submenu::with_items(app, "Show on", true, &mon_refs)?;

            let menu = Menu::with_items(app, &[&status, &monitor_menu, &autostart, &pair, &quit])?;
            let icon = TrayIconBuilder::with_id("main")
                .icon(Image::from_bytes(TRAY_OFF)?)
                .tooltip("LockIn Overlay · not connected")
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event({
                    let mon_items = mon_items.clone();
                    let autostart_item = autostart.clone();
                    move |app, ev| {
                        let id = ev.id().as_ref();
                        match id {
                            "quit" => app.exit(0),
                            "pair" => {
                                let _ = app.emit("unpair", ());
                                show_pair(app);
                            }
                            "autostart" => {
                                let al = app.autolaunch();
                                let on = al.is_enabled().unwrap_or(false);
                                let _ = if on { al.disable() } else { al.enable() };
                                let _ = autostart_item.set_checked(al.is_enabled().unwrap_or(!on));
                            }
                            _ => {
                                if let Some(rest) = id.strip_prefix("mon-") {
                                    if let Ok(idx) = rest.parse::<usize>() {
                                        for (i, m) in mon_items.iter().enumerate() { let _ = m.set_checked(i == idx); }
                                        let _ = app.emit("monitor", idx);
                                    }
                                }
                            }
                        }
                    }
                })
                .build(app)?;
            app.manage(Tray { icon, status });

            // the overlay window never takes the mouse: clicks land on whatever is behind it
            if let Some(w) = handle.get_webview_window("overlay") {
                let _ = w.set_ignore_cursor_events(true);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running LockIn Overlay");
}
