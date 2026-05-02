use tauri::Manager;

// Re-export for Tauri
pub fn run() {
    main()
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let app_icon = app.default_window_icon().cloned();

            if let (Some(window), Some(icon)) = (app.get_webview_window("main"), app_icon.clone()) {
                let _ = window.set_icon(icon);
            }

            let quit = tauri::menu::MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let show = tauri::menu::MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
            let hide = tauri::menu::MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)?;
            let menu = tauri::menu::Menu::with_items(app, &[&show, &hide, &quit])?;

            let mut tray_builder = tauri::tray::TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("ChatMax")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .icon_as_template(false);

            if let Some(icon) = app_icon {
                tray_builder = tray_builder.icon(icon);
            }

            let _tray = tray_builder.build(app)?;

            use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};
            let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
            app.global_shortcut()
                .on_shortcut(shortcut, |app, _shortcut, _event| {
                    if let Some(window) = app.get_webview_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.hide();
                        } else {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
