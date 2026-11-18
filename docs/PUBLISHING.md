# 发布清单：GitHub / npm / 插件目录

这份文档从「还没有 GitHub 账号」开始，按顺序做即可。命令都在仓库根目录执行。

## 0. 注册 GitHub

1. 打开 <https://github.com/signup>，填邮箱、密码、用户名（用户名会成为仓库地址的一部分，例如 `github.com/yourname/dsh-folder-cards`）。
2. 收邮件点验证链接；建议顺手开启两步验证（Settings → Password and authentication）。
3. 记下用户名；本文档里的仓库地址已按 `changhao213141` 填好，换成别的账号时记得全局替换。

## 1. 建仓库并上传

**网页方式（不用装 git）**

1. 右上角 `+` → New repository。
2. 名称填 `dsh-folder-cards`，选 **Public**，**不要**勾选 “Add a README file”（本仓库已有 README）。
3. 创建后进入仓库，点 “uploading an existing file”，把本目录里除 `node_modules/` 之外的所有文件拖进去（可以整个文件夹拖）。
4. 提交信息写 `feat: initial release`，点 Commit changes。

**命令行方式（已安装 git）**

```sh
git init
git add .
git commit -m "feat: initial release"
git branch -M main
git remote add origin https://github.com/changhao213141/dsh-folder-cards.git
git push -u origin main
```

## 2. 补仓库信息

- **Description**（仓库右上角 About → 齿轮）：
  `Portrait folder cards for the DeepSeek Harness sidebar: card grid, droplet transitions, search, native session menus.`
- **Topics**（同一处）：`dsh-plugin`、`deepseek-harness`、`dsh`、`sidebar`、`cards`、`cordis`。
  `dsh-plugin` 是生态目录普遍抓取的标签，务必加上。
- **package.json 补 repository**（建好仓库后加，然后 `npm run build` 不需要重建，但提交一次）：

```json
"repository": { "type": "git", "url": "git+https://github.com/changhao213141/dsh-folder-cards.git" },
"homepage": "https://github.com/changhao213141/dsh-folder-cards#readme",
"bugs": { "url": "https://github.com/changhao213141/dsh-folder-cards/issues" }
```

## 3. 发布到 npm（可选，但推荐）

包名 `dsh-folder-cards` 目前**未被占用**（已查 `registry.npmjs.org`，返回 404）。发布后别人就能用 `dsh plugin add dsh-folder-cards`。

1. 注册 <https://www.npmjs.com/signup> 并验证邮箱。
2. 本机装好 Node ≥ 18（能跑 `npm` 即可）。
3. 登录并发布：

```sh
npm login                       # 按提示输入用户名/密码/邮箱验证码
npm publish --access public     # 构建产物 client.js 必须已是最新（npm run build）
```

发布前检查：`package.json` 里没有 `"private": true`（已移除）、版本号与改动匹配（当前 `0.2.0`）。后续每次发布先改版本号：

```sh
npm version patch   # 或 minor / major
npm publish --access public
```

## 4. 进插件市场

「插件市场」其实是三条独立的路，规则各不相同。

### 4.1 dshmarket（内置可视化市场，收录 = 一个文件 PR）

它的目录**只**来自 curated 仓库 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)，不会自动扫描 GitHub。收录方式是往那个仓库提一个文件 PR。

官方 `contributing.md` 的硬性条件：

1. `package.json` 声明 `dsh.bundle`（本仓库已有）且根目录有 `cordis.patch.yml`（已有）——只有 `dsh.client` 会被拒；
2. **仓库创建满 1 天**（自动校验。本仓库建于 2026-11-18，约 11-19 23:12 之后才达标）；
3. 仓库带 `dsh-plugin` topic；
4. 描述如实、无营销词（会被对照代码检查）；
5. 一个 PR 最多 3 条。

PR 步骤：

1. 打开 <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>；
2. Add file → Create new file，路径与文件名必须是
   `data/plugins/changhao213141__dsh-folder-cards.yml`；
3. 粘贴 [`docs/market/changhao213141__dsh-folder-cards.yml`](market/changhao213141__dsh-folder-cards.yml) 的内容（分类 `ui`）；
4. 提交时选择 “Create a new branch and start a pull request”，PR 标题写
   `Add dsh-folder-cards`，正文可以照抄本节末尾的模板。

合并后站点与 dshmarket 通常一天内自动跟进。npm 是否发布**不影响收录**，条目里不要手写 `npm:` 字段（会被拒）。

截图（可选）：市场详情页会读仓库根的 `screenshots.json` 显示截图（见本仓库已放置的版本，路径相对于该文件，1–8 张）。没写时会退回从 README 抽图。

### 4.2 官方 Discover（`@deepseek-ai/dsh-plugin-market`）

默认没有任何索引源，需要用户自己加。dshmarket 的目录已被转成 format-1 索引：
`https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json`

4.1 合并之后，任何人在 **Plugins → Discover → Index sources** 里加这个地址就能搜到本插件。README 里已经写了这句提示。

### 4.3 社区目录站

- **dshbase**：数据源是 GitHub `dsh-plugin` topic + 合并目录，打上 topic 后会被抓；也可以走表单
  <https://github.com/ylwl1997/dshbase/issues/new?template=plugin-submission.yml>。
- **dshplugin.online / dshplugin.store** 等：以站点说明为准，一般支持按仓库地址提 issue 或提交页。

### PR 正文模板

```markdown
Adds dsh-folder-cards to the registry.

- Repo: https://github.com/changhao213141/dsh-folder-cards (MIT)
- Claims the `sidebar.workspaces` seat (priority -1); writes no official state, disabling restores the native list
- Requires DSH `>=0.2.2-rc.1 <0.3.0` (`engines.dsh`), tested on 0.2.2-rc.3
- No install-time build: `client.js` is committed; sources live in `src/` with a dependency-free `build.mjs`
- Browser-local only: card artwork and view preferences are stored in `localStorage`
```

## 5. 维护建议

- 建一个 `CHANGELOG.md` 或直接用 GitHub Releases 记录每个版本改了什么。
- 提 issue 时让用户带上 DSH 版本与 `[folder-cards]` 开头的控制台报错（README 和 CONTRIBUTING 已写）。
- 每次改完 `src/` 记得 `npm run build` 再提交 `client.js`，否则安装的人拿到的是旧产物。
- 不要把 `node_modules/`、`.pnpm-store`、个人绝对路径提交进仓库（`.gitignore` 已处理常见项）。
