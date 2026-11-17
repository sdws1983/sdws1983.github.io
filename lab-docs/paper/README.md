# 经典与代表文献阅读

公开页面：https://sdws1983.github.io/lab-docs/paper/

`reading-guide.md` 是内容源文件，保留发展脉络版全部80篇导读、原收藏编号、年代说明与勘误。`papers.json` 和 `index.html` 由生成器输出，样式与交互分别保存在 `paper.css`、`paper.js`。

修改内容后，在仓库根目录执行（Python 3，无第三方依赖）：

```sh
python3 lab-docs/paper/build.py
```

提交 Markdown 及重新生成的 HTML、JSON，GitHub Pages 会更新页面。每方向的文献按正式发表年份递增；生成器核对八个方向和每方向十篇。更改选篇数量时需相应更新生成器校验与页面统计文案。

页面没有登录或在线写入后端。维护方式与现有实验室文档相同：修改仓库源文件并发布。
