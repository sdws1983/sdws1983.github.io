"use strict";

document.documentElement.classList.add("js");

const article = document.querySelector(".document-body");
const toc = document.querySelector("#document-toc");
const status = document.querySelector("#copy-status");

if (article && toc) {
  const headings = [...article.querySelectorAll("h2")];
  headings.forEach((heading, index) => {
    if (!heading.id) heading.id = "section-" + (index + 1);
    const link = document.createElement("a");
    link.href = "#" + heading.id;
    link.textContent = heading.textContent;
    toc.append(link);
  });
  article.querySelectorAll("table").forEach((table, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "表格 " + (index + 1));
    table.before(wrapper);
    wrapper.append(table);
    if (table.querySelector("th")?.textContent.trim() === "资料与来源") {
      table.classList.add("resource-table");
    }
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.find((item) => item.isIntersecting);
      if (!entry) return;
      toc.querySelectorAll("a").forEach((link) => {
        if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-100px 0px -65% 0px" });
    headings.forEach((heading) => observer.observe(heading));
  }
  headings.filter((heading) => heading.id.startsWith("appendix_")).forEach((heading) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "section-copy";
    button.textContent = "复制本节";
    button.setAttribute("aria-label", "复制" + heading.textContent);
    button.addEventListener("click", async () => {
      const parts = [];
      let node = heading.nextElementSibling;
      while (node && node.tagName !== "H2") {
        parts.push(node.innerText || node.textContent);
        node = node.nextElementSibling;
      }
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(parts.join("\n\n"));
        status.textContent = "已复制，可粘贴到你的研究记录或文档中。";
      } catch {
        status.textContent = "请选中本节正文后复制。";
      }
    });
    heading.append(button);
  });
}

document.querySelector("[data-print-document]")?.addEventListener("click", () => window.print());

// Keep earlier Lab Docs bookmarks usable after introducing the two full guides.
if (document.body.dataset.documentKey === "hub") {
  const legacy = {
    "#start": "/lab-docs/guide/#chapter_4",
    "#workflow": "/lab-docs/guide/#chapter_7",
    "#reproducibility": "/lab-docs/guide/#chapter_10",
    "#training": "/lab-docs/guide/#chapter_5",
    "#communication": "/lab-docs/guide/#chapter_3",
    "#rna-seq": "/lab-docs/rna-seq/#rna-seq"
  };
  const destination = legacy[window.location.hash];
  if (destination) window.location.replace(destination);
}
