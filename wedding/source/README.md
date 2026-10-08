# 两个月备婚计划 · GitHub Pages 版

公开访问地址：https://sdws1983.github.io/wedding/

这是纯静态 React 网页，包含 61 项初始筹备任务，以及预算、宾客、服务商、婚礼当天流程和物品清单。初始婚期、姓名、预算、宾客信息均留空。

## 数据保存

网页通过浏览器 `localStorage` 自动保存，键名为 `wedding-countdown:plan:v1`。用户填写的数据不会上传到 GitHub。每个浏览器独立保存，没有自动跨设备同步；“备份与恢复”可导出、导入 JSON。清除网站数据、使用无痕窗口或更换浏览器会影响本地进度，请定期备份。导入前会校验数据，确认替换后才写入。无效原有数据不会被默认计划自动覆盖。

## 开发和发布

需要 Node.js 22.13 或更新版本。在本目录安装依赖后运行：

```sh
npm install
npm run dev
npm run build
```

Vite 配置的基础路径为 `/wedding/`。构建产物在 `dist/`；将其内容复制到上一级 `wedding/` 目录，然后提交到仓库的 `master` 分支。现有 GitHub Pages 分支发布流程会部署它。源文件位于 `wedding/source/`，构建产物位于 `wedding/index.html`、`wedding/assets/` 和 `wedding/favicon.svg`。

旧云端版位于 https://our-wedding-countdown.sdws1983.chatgpt.site 。两处数据独立。
