"""Rebuild the static reading page after editing reading-guide.md (Python 3, stdlib only)."""
from pathlib import Path
from html import escape
import re, json
ROOT = Path(__file__).resolve().parent

def inline(text):
    text = escape(text, quote=False)
    text = re.sub(r'\[([^\]]+)\]\((https://[^\s)]+)\)', lambda m: '<a href="'+escape(m[2],quote=True)+'" target="_blank" rel="noopener noreferrer">'+m[1]+'</a>', text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    return re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', text)

def main():
    source = (ROOT/'reading-guide.md').read_text()
    groups=[]
    for match in re.finditer(r'^## ([A-H])．([^\n]+)\n(.*?)(?=^## |\Z)', source, re.M|re.S):
        key,name,body=match.groups()
        question=re.search(r'\*\*核心问题：\*\*(.+)',body)[1]
        stages=re.findall(r'^- (\d{4}[^\n]+)',body,re.M)
        priority=set(re.findall(r'[A-H]\d\d',re.search(r'\*\*优先精读：\*\*(.+)',body)[1]))
        contributions={}
        for row in re.findall(r'^\| (\d{4}) \|(.+)',body,re.M):
            cells=row[1].split('|')
            pid=re.search(r'[A-H]\d\d',cells[1])[0]
            contributions[pid]=cells[2].strip()
        papers=[]
        for pm in re.finditer(r'^#### ([A-H]\d\d)．(\d{4})｜([^\n]+)\n(.*?)(?=^#### |\Z)',body,re.M|re.S):
            pid,year,topic,details=pm.groups()
            citation=re.search(r'^\*\*(.+)\*\*$',details,re.M)[1]
            meta=re.search(r'^类型：(.+)',details,re.M)[1]
            ptype=re.search(r'\*\*(.+?)\*\*',meta)[1]
            fields=re.findall(r'^- \*\*(.+?)：\*\*(.+)',details,re.M)
            title,url=re.search(r'\[([^\]]+)\]\(([^)]+)\)',citation).groups()
            papers.append(dict(id=pid,year=int(year),topic=topic,citation=citation,type=ptype,meta=meta,fields=fields,title=title,url=url,contribution=contributions[pid],priority=pid in priority))
        assert len(papers)==10, (key,len(papers))
        assert [p['year'] for p in papers]==sorted(p['year'] for p in papers)
        note = re.search(r'(本方向含[^\n]+)', body)
        groups.append(dict(id=key,name=name,question=question,stages=stages,papers=papers,note=note[1] if note else ''))
    assert len(groups)==8
    (ROOT/'papers.json').write_text(json.dumps(groups,ensure_ascii=False,indent=2)+'\n')
    hub=(ROOT.parent/'index.html').read_text()
    header=re.search(r'<header class="site-header">.*?</header>',hub,re.S)[0]
    footer=re.search(r'<footer class="site-footer">.*?</footer>',hub,re.S)[0]
    group_options=''.join(f'<option value="{g["id"]}">{g["id"]} · {escape(g["name"])}</option>' for g in groups)
    nav=''.join(f'<a href="#direction-{g["id"]}"><span>{g["id"]}</span>{escape(g["name"])}</a>' for g in groups)
    sections=[]
    for g in groups:
        cards=[]
        for p in g['papers']:
            badges=f'<span class="type-badge type-{p["type"]}">{escape(p["type"])}</span>'
            if p['priority']: badges+='<span class="priority-badge">优先精读</span>'
            fields=''.join(f'<div><dt>{escape(k)}</dt><dd>{inline(v)}</dd></div>' for k,v in p['fields'])
            cards.append(f'''<article class="paper-card" id="{p['id']}" data-type="{escape(p['type'])}" data-priority="{str(p['priority']).lower()}">
<div class="paper-year">{p['year']}<span>{p['id']}</span></div><div class="paper-content">
<div class="paper-badges">{badges}</div><h3><a href="{escape(p['url'],quote=True)}" target="_blank" rel="noopener noreferrer">{escape(p['topic'])}<span aria-hidden="true"> ↗</span></a></h3>
<p class="citation">{inline(p['citation'])}</p><p class="contribution"><strong>历史贡献</strong> {inline(p['contribution'])}</p>
<details><summary>阅读导引与应用边界</summary><div class="reading-detail"><p class="paper-meta">类型：{inline(p['meta'])}</p><dl>{fields}</dl><a class="original-link" href="{escape(p['url'],quote=True)}" target="_blank" rel="noopener noreferrer">阅读原文 ↗</a> · <a href="#{p['id']}">本条链接</a></div></details>
</div></article>''')
        stages=''.join(f'<li>{escape(s)}</li>' for s in g['stages'])
        note = '<p class="core-question">'+escape(g['note'])+'</p>' if g['note'] else ''
        sections.append(f'''<section class="direction" id="direction-{g['id']}" data-direction="{g['id']}"><div class="direction-heading"><span class="direction-letter">{g['id']}</span><div><h2>{escape(g['name'])}</h2><p class="core-question">{escape(g['question'])}</p></div><span class="direction-count">10 篇</span></div><ol class="stages">{stages}</ol>{note}<div class="paper-list">{''.join(cards)}</div></section>''')
    page=f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#071f1b"><title>经典文献阅读 — HuangLab</title><meta name="description" content="八个研究方向、80篇经典与代表文献，沿学科发展脉络按年代阅读，区分研究论文与综述，附历史贡献、精读重点与原文链接。"><link rel="stylesheet" href="/site.css"><link rel="stylesheet" href="/lab-docs/docs.css"><link rel="stylesheet" href="paper.css"></head>
<body data-page="lab-docs" data-title-en="Classic Papers — HuangLab" data-title-zh="经典文献阅读 — HuangLab"><a class="skip-link" href="#main">跳到正文</a>{header}
<main id="main"><section class="document-hero paper-hero"><div class="wrap"><div class="breadcrumb"><a href="/">首页</a> / <a href="/lab-docs/">实验室文档</a> / 经典文献</div><p class="eyebrow">HUANGLAB / READING COLLECTION</p><h1>沿着学科的发展，<br>读懂关键的文献。</h1><p class="document-subtitle">八个研究方向的经典与代表作，以年代串联概念、方法和证据的演进。</p><div class="collection-stats"><span><strong>8</strong> 研究方向</span><span><strong>80</strong> 精选文献</span><span><strong>24</strong> 优先精读</span><span><strong>2001—2026</strong> 入选年代</span></div><div class="document-actions"><a href="#reading-list">开始阅读 ↓</a><a href="reading-guide.md" download>下载完整导读</a><button type="button" id="print-page">打印 / 保存 PDF</button></div></div></section>
<section class="collection-intro wrap"><p>从 1,377 条收藏记录中精选，每个方向 10 篇。<strong>先看发展脉络，再沿年代阅读，展开条目查看精读重点。</strong>研究论文、综述、方法流程与指南/评述分别标注，近年前沿也保留其定位。</p><details class="scope-note"><summary>关于选篇范围与年代</summary><p>这份清单呈现收藏范围内的代表性发展脉络，并非学科的完整历史；最早入选年份不等于学科起源。各方向按正式发表年份由早到晚排列，同年按问题衔接排列。发展阶段与历史贡献是阅读组织的概括，不表示论文间存在直接因果或影响关系。</p><p>包含研究论文 62 篇、综述 15 篇、方法流程 2 篇、指南/评述 1 篇。版本：2026 年 10 月 15 日。完整书目、勘误和年代说明见逐篇导读。</p></details></section>
<div class="wrap reading-layout" id="reading-list"><aside class="reading-sidebar"><p class="sidebar-label">研究方向 / DIRECTIONS</p><nav aria-label="研究方向">{nav}</nav><a class="back-hub" href="/lab-docs/">← 返回实验室文档</a></aside>
<div class="reading-main"><form class="filters" id="filters" hidden role="search" aria-label="筛选文献"><label class="search-label">搜索文献<input id="search" type="search" placeholder="题名、作者、方法或 DOI…" autocomplete="off"></label><div class="filter-row"><label>研究方向<select id="direction"><option value="all">全部方向</option>{group_options}</select></label><label>文献类型<select id="type"><option value="all">全部类型</option><option>研究论文</option><option>综述</option><option>方法流程</option><option>指南/评述</option></select></label><label class="priority-filter"><input type="checkbox" id="priority">只看优先精读</label><button type="reset">重置</button></div><div class="filter-status"><span id="result-count" role="status" aria-live="polite">显示 80 / 80 篇</span><button type="button" id="expand-all" aria-pressed="false">展开全部导读</button></div></form><noscript><p>文献已按方向与年代完整列出。启用 JavaScript 可使用搜索与筛选。</p></noscript><p id="empty-state" hidden>没有匹配的文献，请更换关键词或重置筛选。</p>{''.join(sections)}<p class="reading-end">读研究论文：追踪新问题、新证据与未解决问题。读综述：整理当时的共识、争议与值得回溯的原始研究。</p></div></div></main>{footer}<script src="/site.js" defer></script><script src="paper.js" defer></script></body></html>'''
    (ROOT/'index.html').write_text(page+'\n')
    print('Built 8 directions, 80 papers, 24 priority papers.')

if __name__=='__main__': main()
