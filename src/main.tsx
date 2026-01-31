<<<<<<< HEAD
=======

>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
import React from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";

<<<<<<< HEAD
=======

>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
import App from './App';
import './i18n'; // Import i18n config
import "./App.css";

<<<<<<< HEAD
import { isTauri } from "./utils/env";
// 启动时显式调用 Rust 命令显示窗口
// 配合 visible:false 使用，解决启动黑屏问题
if (isTauri()) {
  invoke("show_main_window").catch(console.error);
}
=======
console.log('[Main] Topoo Gateway initialized at:', new Date().toISOString());
(window as any).__REFACTOR_ACTIVE = true;

// 启动时显式调用 Rust 命令显示窗口
// 配合 visible:false 使用，解决启动黑屏问题
invoke("show_main_window").catch(console.error);
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
<<<<<<< HEAD

=======
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
  </React.StrictMode>,
);
