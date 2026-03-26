# Skills Manager 技术分析文档

## 1. 项目概述

**Skills Manager** 是一个跨平台的桌面应用，用于统一管理 AI 编程助手的技能(Skills)。它解决了 AI Agent 工具生态碎片化的问题——用户无需在每个工具中单独管理技能，可以在一个应用中管理所有技能并同步到多个工具。

### 核心价值
- **统一管理**: 所有 AI 工具的技能集中存储在 `~/.skills-manager/`
- **多工具同步**: 支持 15+ 种 AI 编程工具
- **场景切换**: 通过场景(Scenario)功能快速切换不同的技能组合

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 前端 | React 19 + TypeScript | 现代化 UI 框架 |
| 构建工具 | Vite 7 | 快速的开发服务器和构建 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 桌面框架 | Tauri 2 | Rust 后端 + WebView |
| 后端 | Rust | 高性能、安全 |
| 数据库 | SQLite (rusqlite) | 轻量级本地存储 |
| 通信 | Tauri IPC | 前端-后端桥接 |
| i18n | react-i18next | 国际化 |

### 2.2 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Skills Manager                         │
├─────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Tailwind)               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Views: MySkills, InstallSkills, Projects,       │  │
│  │        Settings, Dashboard                        │  │
│  │ Components: Sidebar, SkillDetailPanel,          │  │
│  │             MultiSelectToolbar, Dialogs         │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│                    Tauri IPC                            │
│                          │                               │
├─────────────────────────────────────────────────────────┤
│  Backend (Rust)                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Commands Layer (10 modules)                       │  │
│  │ - tools.rs, skills.rs, sync.rs, scenarios.rs     │  │
│  │ - projects.rs, scan.rs, git_backup.rs           │  │
│  │ - browse.rs, settings.rs                         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Core Layer (17 modules)                          │  │
│  │ - skill_store.rs: SQLite 数据存储                │  │
│  │ - tool_adapters.rs: 工具适配器                   │  │
│  │ - sync_engine.rs: 同步引擎                       │  │
│  │ - installer.rs: 安装器                           │  │
│  │ - git_fetcher.rs: Git 克隆/拉取                 │  │
│  │ - scanner.rs: 本地技能扫描                       │  │
│  │ - central_repo.rs: 中心仓库管理                  │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│                    SQLite DB                             │
│                    (~/.skills-manager/)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 核心模块分析

### 3.1 数据存储层 (`skill_store.rs`)

使用 SQLite 作为本地数据库，存储结构如下：

**主要表结构：**
- `skills`: 管理技能元数据
- `skill_targets`: 技能到工具的映射关系
- `scenarios`: 场景定义
- `scenario_skills`: 场景-技能关联
- `projects`: 项目管理
- `settings`: 应用设置

**关键特性：**
```rust
// 敏感数据加密 (AES-256-GCM)
const SENSITIVE_KEYS: &[&str] = &[
    "proxy_url", 
    "git_backup_remote_url", 
    "skillsmp_api_key"
];

// WAL 模式提升并发性能
conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");
```

### 3.2 工具适配器 (`tool_adapters.rs`)

支持 15 种 AI 编程工具的技能管理：

| 工具 | Skills 目录 | 检测目录 |
|------|-------------|----------|
| Cursor | `.cursor/skills` | `.cursor` |
| Claude Code | `.claude/skills` | `.claude` |
| OpenCode | `.config/opencode/skills` | `.config/opencode` |
| Gemini CLI | `.gemini/skills` | `.gemini` |
| Windsurf | `.codeium/windsurf/skills` | `.codeium/windsurf` |
| ... | ... | ... |

**工具检测逻辑：**
- 同时检查 `~` 和 `~/.config/` 目录
- Claude Code 还支持插件目录: `.claude/plugins/cache`, `.claude/plugins/marketplaces`

### 3.3 同步引擎 (`sync_engine.rs`)

两种同步模式：
1. **Symlink (符号链接)**: Unix 默认，更新中心库即可同步
2. **Copy (复制)**: Cursor 等工具需要复制文件

```rust
pub enum SyncMode {
    Symlink,  // Unix 默认
    Copy,     // Cursor 等工具
}
```

### 3.4 安装器 (`installer.rs`)

支持多种安装来源：
- **本地目录**: 直接复制
- **ZIP/SKILL 压缩包**: 自动解压并查找 `SKILL.md`
- **Git 仓库**: 克隆远程仓库

### 3.5 场景管理 (`scenarios.rs`)

场景是技能的分组，支持：
- 创建/删除/重命名场景
- 添加/移除技能
- 场景间切换自动同步/取消同步

---

## 4. 关键特性实现

### 4.1 Git 备份

```rust
// git_backup.rs
pub fn git_backup_commit()  // 提交本地更改
pub fn git_backup_push()    // 推送到远程
pub fn git_backup_pull()    // 从远程拉取
pub fn git_backup_clone()   // 从远程克隆
```

### 4.2 市场集成

支持从以下市场安装技能：
- **skills.sh**: `skillssh_api.rs`
- **skills.mp**: `skillsmp_api.rs`

### 4.3 系统托盘

```rust
// lib.rs
fn build_tray_menu()      // 构建托盘菜单
fn switch_scenario_from_tray()  // 从托盘切换场景
```

支持：
- 显示/隐藏主窗口
- 快速切换场景
- 退出应用

---

## 5. 安全设计

### 5.1 敏感数据加密
```rust
// 使用 AES-256-GCM 加密敏感设置
const SENSITIVE_KEYS: &[&str] = &["proxy_url", "git_backup_remote_url", ...];
```

### 5.2 沙箱隔离
- Tauri 默认启用 CSP
- 仅允许 `ipc:` 和 `https:` 连接

### 5.3 单实例运行
```rust
tauri_plugin_single_instance::init(|app, _args, _cwd| {
    restore_main_window(app);  // 已有实例时聚焦窗口
})
```

---

## 6. 数据流

### 6.1 安装技能流程
```
用户选择来源 (本地/Git/市场)
    ↓
installer.rs: install_from_local() / git_fetcher.rs
    ↓
skill_store.rs: insert_skill()
    ↓
同步到目标工具 (sync_engine.rs: sync_skill)
```

### 6.2 场景切换流程
```
用户选择场景
    ↓
scenarios.rs: switch_scenario()
    ↓
取消同步旧场景技能 (unsync_scenario_skills)
    ↓
同步新场景技能 (sync_scenario_skills)
    ↓
更新托盘菜单 (refresh_tray_menu)
    ↓
通知前端 (emit "tray-scenario-switched")
```

---

## 7. 文件结构

```
skills-manager/
├── src/                          # React 前端
│   ├── views/                    # 页面组件
│   │   ├── MySkills.tsx         # 我的技能
│   │   ├── InstallSkills.tsx    # 安装技能
│   │   ├── Projects.tsx         # 项目管理
│   │   ├── Settings.tsx         # 设置
│   │   └── Dashboard.tsx        # 仪表盘
│   ├── components/              # 可复用组件
│   ├── hooks/                   # React Hooks
│   ├── context/                 # React Context
│   └── lib/                     # 工具函数
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── lib.rs              # 主入口，托盘逻辑
│   │   ├── main.rs             # 程序入口
│   │   ├── commands/           # Tauri 命令
│   │   └── core/               # 核心业务逻辑
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

---

## 8. 优缺点分析

### 优点
1. **跨平台支持**: Tauri 2 天生支持 macOS/Windows/Linux
2. **高性能**: Rust 后端处理文件操作快速
3. **多工具统一管理**: 支持 15+ 种 AI 工具
4. **场景切换**: 灵活的场景管理
5. **Git 备份**: 版本控制和跨设备同步
6. **安全设计**: 敏感数据加密、单实例运行

### 缺点
1. **Rust 编译时间**: 开发环境首次编译较慢
2. **依赖复杂**: 同时需要 Node.js 和 Rust 环境
3. **Tauri 生态**: 相比 Electron，插件生态较小
4. **数据库锁定**: SQLite WAL 模式在某些场景下可能有锁问题

---

## 9. 开发建议

### 9.1 开发环境
```bash
# 需要安装
- Node.js 18+
- Rust toolchain
- Xcode Command Line Tools (macOS)

# 启动开发
npm install
npm run tauri:dev
```

### 9.2 调试技巧
- 前端: 使用浏览器 DevTools (右键 → Inspect)
- 后端: 查看日志文件 `~/.skills-manager/logs/`

### 9.3 潜在改进点
1. 添加 WebDAV 备份支持
2. 支持技能模板市场
3. 增加技能依赖解析
4. 添加云端同步功能
5. 支持 VS Code 插件

---

## 10. 总结

Skills Manager 是一个设计良好的 AI 技能管理工具，采用现代化的技术栈(Tauri 2 + React 19 + Rust)，实现了跨平台的统一技能管理。其架构清晰、模块化程度高，代码质量良好。核心创新点在于：

1. **场景概念**: 解决了不同工作场景需要不同技能组合的问题
2. **多工具适配**: 统一的适配器模式支持 15+ 种工具
3. **Git 备份**: 原生 Git 集成实现版本控制和跨设备同步

该项目可作为 Tauri 2 + React 技术栈构建桌面应用的优秀参考。
