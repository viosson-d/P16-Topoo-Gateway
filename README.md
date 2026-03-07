# Topoo Gateway 🚀

> 个人 AI 账号管理与 API 网关工具

<div align="center">
  <img src="public/topoo.png" alt="Topoo Gateway Logo" width="120" height="120" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">

  <h3>您的个人 AI 调度网关</h3>
  <p>多账号管理 · 协议转换 · 智能调度</p>
  
  <p>
    <img src="https://img.shields.io/badge/Version-0.0.129-blue?style=flat-square" alt="Version">
    <img src="https://img.shields.io/badge/Tauri-v2-orange?style=flat-square" alt="Tauri">
    <img src="https://img.shields.io/badge/Backend-Rust-red?style=flat-square" alt="Rust">
    <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square" alt="React">
  </p>

  <p>
    <a href="#-核心特性">核心特性</a> •
    <a href="#-安装指南">安装指南</a> •
    <a href="#-快速接入">快速接入</a> •
    <a href="#-更新日志">更新日志</a>
  </p>

  <p>
    <strong>简体中文</strong> |
    <a href="./README_EN.md">English</a>
  </p>
</div>

---

**Topoo Gateway** 是一个专为开发者和 AI 爱好者设计的桌面应用,提供多账号管理、协议转换和智能请求调度功能,让您轻松管理多个 AI 平台账号并统一调用。

## ✨ 核心特性

- 🔐 **多账号管理**: 支持 Google Gemini、Claude 等多平台账号统一管理
- 🔌 **协议转换**: 将 Web Session 转换为标准 API 接口 (OpenAI/Anthropic/Gemini 格式)
- 🔀 **智能调度**: 自动账号轮换、配额管理、故障转移
- 🎨 **多模态支持**: 支持 Imagen 3 图像生成
- 🖥️ **跨平台**: macOS、Windows、Linux 全平台支持
- 🐳 **Docker 部署**: 支持容器化部署,适合 NAS/服务器环境

## 📦 安装指南

### macOS

从 [GitHub Releases](https://github.com/viosson-d/topoo-gateway/releases) 下载最新的 `.dmg` 安装包。

**首次打开提示"无法打开"?**

```bash
sudo xattr -rd com.apple.quarantine "/Applications/Topoo Gateway.app"
```

### Windows

从 [GitHub Releases](https://github.com/viosson-d/topoo-gateway/releases) 下载 `.msi` 安装包或便携版 `.zip`。

### Linux

从 [GitHub Releases](https://github.com/viosson-d/topoo-gateway/releases) 下载 `.deb` 或 `AppImage`。

### Docker 部署

```bash
docker run -d --name topoo-gateway \
  -p 8045:8045 \
  -e API_KEY=sk-your-api-key \
  -e WEB_PASSWORD=your-login-password \
  -v ~/.topoo_gateway:/root/.antigravity_tools \
  viosson/topoo-gateway:latest
```

访问地址: `http://localhost:8045`

详细配置请参考 [Docker 部署指南](./docker/README.md)

## 🔌 快速接入

### OAuth 授权(添加账号)

1. 打开"Accounts / 账号" → "添加账号" → "OAuth"
2. 点击生成的授权链接,在浏览器中完成授权
3. 授权成功后应用会自动保存账号

### 接入 Claude Code CLI

```bash
export ANTHROPIC_API_KEY="sk-topoo"
export ANTHROPIC_BASE_URL="http://127.0.0.1:8045"
claude
```

### Python 调用示例

```python
import openai

client = openai.OpenAI(
    api_key="sk-topoo",
    base_url="http://127.0.0.1:8045/v1"
)

response = client.chat.completions.create(
    model="gemini-3-flash",
    messages=[{"role": "user", "content": "你好"}]
)
print(response.choices[0].message.content)
```

### 图像生成 (Imagen 3)

```python
response = client.images.generate(
    model="gemini-3-pro-image",
    prompt="一座未来主义风格的城市,赛博朋克,霓虹灯",
    size="1920x1080",
    quality="hd"
)
```

## 📝 更新日志

### v0.0.129 (2026-03-07)

- Updated the Intel macOS GitHub Actions runner label from `macos-13` to `macos-15-intel`
- Ready for a corrected multi-architecture signed updater/release run via `v0.0.129`

### v0.0.128 (2026-03-07)

- Fixed the GitHub Release workflow to build separate macOS architecture targets instead of the invalid universal Rust target
- Ready for a new signed updater/release run via `v0.0.128`

### v0.0.127 (2026-03-07)

- Added native Codex upstream routing with real ChatGPT Codex credentials and `/v1/responses` compatibility
- Unified update sources and enabled direct in-app auto-update/install flow
- Cleaned up product naming so Topoo Gateway is the product and Google Antigravity is only treated as the IDE

### v0.0.126 (2026-02-09)

- ✨ **动态版本显示**: 版本号自动从 package.json 读取
- 🔧 **窗口配置优化**: 默认尺寸 1280x800,最小尺寸 1024x700
- 🐛 **修复代码签名**: 解决应用无法打开的问题
- 📦 **GitHub Release**: 支持从 GitHub 直接下载 DMG

## 🛠️ 技术栈

- **前端**: React + TypeScript + Vite + TailwindCSS
- **后端**: Rust + Axum + Tauri
- **数据库**: SQLite
- **协议**: OpenAI API / Anthropic API / Gemini API

## 📄 License

Originally based on Antigravity Manager.

---

**Star ⭐ this project to support development!**
