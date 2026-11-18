# 参与贡献

谢谢愿意看一眼这个插件。它目前的定位是「能日常用，但离产品还有距离」，所以任何形式的反馈都有价值——不必是代码。

## 最有用的几种贡献

1. **体验反馈 / 截图**：在哪个 DSH 版本、什么系统、侧栏多宽、工作区多少个的情况下不顺手；截图或录屏放到 issue 里即可。
2. **外壳适配**：`src/60-component.js` 里的 `measureAvail()` 是运行时测量外壳几何来固定区域高度的，这一块最脆。如果你知道更稳的做法（例如官方暴露了排版变量、或 `useSectionScroller` 有更新的用法），非常欢迎直接 PR。
3. **功能补全**：拖拽排序、视图选项（分组/排序弹层）、搜索命中高亮、跨平台快捷键核对。
4. **国际化**：目前只有中文/英文，补其它语言只需要在 `src/10-locales.js` 加一份词典并在 `src/90-entry.js` 注册。
5. **测试**：哪怕只是「构建产物语法检查 + manifest 校验 + slot 注册」的冒烟脚本。

## 提交 Issue 时请带上

- DSH 版本（`dsh --version`）
- 操作系统
- 复现步骤，以及期望 vs 实际
- 浏览器控制台里 `[folder-cards]` 开头的报错（如果有）

## 本地开发

```sh
# 1. 改源码（不要直接改 client.js，它是构建产物）
# 2. 构建
npm run build
# 3. 安装到你的 Web profile（或在插件管理器里添加本目录）
dsh plugin --profile desktop add link:$PWD
# 4. 刷新页面
```

代码分层：

```
src/00-config.js        常量
src/10-locales.js       词典
src/20-styles.js        样式（只用 --dsw-alias-* 主题令牌）
src/30-storage.js       localStorage
src/40-helpers.js       纯函数
src/45-icons.js         内联 SVG
src/50-scroll-region.js 滚动区
src/60-component.js     侧栏区域组件
src/90-entry.js         入口与 slot 注册
```

## 约定

- **不引入 DSH 客户端包**（`@deepseek-ai/dsh-client-*`）作为模块依赖：版本漂移会让整块区域崩掉；需要的行为自己写。
- **只用主题令牌**着色（`--dsw-alias-*`），不写字面色值，保证明暗主题都能用。
- **不写官方状态**：插件只读 DSH 的服务快照，自己的数据存 `localStorage`（键见 `docs/DETAIL.md`）。
- **动效尊重 `prefers-reduced-motion`**。
- 面向用户的文案走 locale 服务，不要在组件里硬编码中文。

## PR

- 一个 PR 只做一件事，附上改动前后的行为说明。
- 如果改了 `src/`，请同时提交重新构建的 `client.js`（CI 尚未建立，先手动保证一致）。
- 涉及界面的改动，附一张截图或一段说明会快很多。
