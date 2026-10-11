# Yumin Huang · Plant Genomics

Personal academic website for Yumin Huang, Professor at Fujian Agriculture and Forestry University.

## Site structure

- `index.html` — Home and biography
- `research/index.html` — Research program
- `publications/index.html` — Complete publication record
- `software/index.html` — Software and computational resources
- `lab-docs/index.html` — Lab documentation landing page
- `lab-docs/guide.md` — **Editable source of the full lab guide**
- `lab-docs/resources.md` — **Editable source of the research learning resources**
- `lab-docs/rna-seq/index.html` — Previously published RNA-seq outline
- `_layouts/lab-document.html` — Shared layout for the two Markdown documents
- `lab-docs/docs.css` / `docs.js` — Document typography, navigation, tables and template copying
- `site.css` / `site.js` — Shared site design, language switcher and navigation

## 修改实验室指南与学习资源

两份正文以Markdown保存。GitHub Pages现有的Jekyll发布流程会自动生成网页，不需要手动修改HTML、安装Node.js或运行构建命令。

| 内容 | 在线编辑 | 发布页面 |
| --- | --- | --- |
| 实验室指南 | [编辑guide.md](https://github.com/sdws1983/sdws1983.github.io/edit/master/lab-docs/guide.md) | [打开页面](https://sdws1983.github.io/lab-docs/guide/) |
| 科研能力学习资源 | [编辑resources.md](https://github.com/sdws1983/sdws1983.github.io/edit/master/lab-docs/resources.md) | [打开页面](https://sdws1983.github.io/lab-docs/resources/) |

1. 登录有仓库写入权限的GitHub账号，打开对应的在线编辑链接。网页上的“编辑本页”按钮也能进入同一位置。
2. 修改正文，使用Preview查看；保留顶部的`layout`、`permalink`、`source_path`和`document_key`字段。
3. 修改版本时，一并更新顶部的`version`、`updated`；文档首页和相应页面会自动采用这些版本信息。
4. 点击Commit changes，填写简短修改说明，提交到`master`。通常几分钟后自动发布。
5. 在仓库Actions中查看“pages build and deployment”是否成功，再打开发布页面。近期提交可从文件History查看。

基本写法：

```markdown
## 新章节
{: #new-section }

一段说明文字。

- 一条事项
- 另一条事项

[资源名称](https://example.org)

| 项目 | 说明 |
| --- | --- |
| 示例 | 第一行内容<br>第二行内容 |
```

已有章节下的`{: #chapter_5 }`、`{: #appendix_4 }`等是跳转标识，修改标题时保留它们。资源表中的`<span id="resource_R01"></span>`作用相同。新增章节可给一个新的英文标识，网页侧边目录会自动更新。表格一行对应一条记录，单元格内换行用`<br>`，段落间隔用`<br><br>`。

两份页面保留中文正文；网站语言切换用于导航与公共界面。附录可“复制本节”，也可使用“打印 / 保存为PDF”。Word审阅批注不属于网页正文。

## Local preview

For ordinary HTML pages, from the repository root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. A plain HTTP server does not build the two Markdown documents. Their complete rendering is provided by the GitHub Pages Jekyll build; local Jekyll preview is optional.

## Other page maintenance

Edit the relevant HTML page or shared stylesheet, check both language modes, and commit to `master`. The site uses the existing Pages publishing source and does not require an npm build.
