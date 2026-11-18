# 发布清单：GitHub / npm / 插件目录

这份文档从「还没有 GitHub 账号」开始，按顺序做即可。命令都在仓库根目录执行。

## 0. 注册 GitHub

1. 打开 <https://github.com/signup>，填邮箱、密码、用户名（用户名会成为仓库地址的一部分，例如 `github.com/yourname/dsh-folder-cards`）。
2. 收邮件点验证链接；建议顺手开启两步验证（Settings → Password and authentication）。
3. 记下用户名，后面所有 `<你的用户名>` 都要替换成它。

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
git remote add origin https://github.com/<你的用户名>/dsh-folder-cards.git
git push -u origin main
```

## 2. 补仓库信息

- **Description**（仓库右上角 About → 齿轮）：
  `Portrait folder cards for the DeepSeek Harness sidebar: card grid, droplet transitions, search, native session menus.`
- **Topics**（同一处）：`dsh-plugin`、`deepseek-harness`、`dsh`、`sidebar`、`cards`、`cordis`。
  `dsh-plugin` 是生态目录普遍抓取的标签，务必加上。
- **package.json 补 repository**（建好仓库后加，然后 `npm run build` 不需要重建，但提交一次）：

```json
"repository": { "type": "git", "url": "git+https://github.com/<你的用户名>/dsh-folder-cards.git" },
"homepage": "https://github.com/<你的用户名>/dsh-folder-cards#readme",
"bugs": { "url": "https://github.com/<你的用户名>/dsh-folder-cards/issues" }
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

## 4. 出现在插件中心

DSH 内置市场（插件管理器里的 Discover / 市场页）和社区目录站抓的是**插件索引**，索引通常来自 GitHub 仓库与 npm：

- 先把上面第 2 步的 **topic `dsh-plugin`** 和 README 做好——这是最有效的第一步。
- 社区目录站（例如 dshbase、dshplugin.online）一般有提交入口或可以直接提 issue，说明「新插件 + 仓库地址 + 一句话简介」；具体收录规则以站方为准，本仓库不做承诺。
- 内置市场的索引插件（如 `dshbase-catalog`）装了之后可以直接说「帮我装 dsh-folder-cards」，由 agent 在索引里找到并安装；索引是否覆盖本仓库取决于该索引的抓取范围。

## 5. 维护建议

- 建一个 `CHANGELOG.md` 或直接用 GitHub Releases 记录每个版本改了什么。
- 提 issue 时让用户带上 DSH 版本与 `[folder-cards]` 开头的控制台报错（README 和 CONTRIBUTING 已写）。
- 每次改完 `src/` 记得 `npm run build` 再提交 `client.js`，否则安装的人拿到的是旧产物。
- 不要把 `node_modules/`、`.pnpm-store`、个人绝对路径提交进仓库（`.gitignore` 已处理常见项）。
