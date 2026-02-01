
import React from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";


import App from './App';
import './i18n'; // Import i18n config
import "./App.css";

console.log('[Main] Topoo Gateway initialized at:', new Date().toISOString());
(window as any).__REFACTOR_ACTIVE = true;

// 启动时显式调用 Rust 命令显示窗口
// 配合 visible:false 使用，解决启动黑屏问题
invoke("show_main_window").catch(console.error);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
