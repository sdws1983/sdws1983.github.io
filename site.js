const root = document.documentElement;
const body = document.body;
const languageButton = document.querySelector(".lang-toggle");
const menuButton = document.querySelector(".menu-toggle");
const page = body.dataset.page || "home";

document.querySelector('[data-nav="' + page + '"]')?.setAttribute("aria-current", "page");

function preferredLanguage() {
  try {
    return localStorage.getItem("yh-language") || "en";
  } catch {
    return "en";
  }
}

function applyLanguage(language) {
  const lang = language === "zh" ? "zh" : "en";
  root.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-en][data-zh]").forEach((element) => {
    element.textContent = element.dataset[lang];
  });
  if (languageButton) {
    languageButton.textContent = lang === "en" ? "中文" : "English";
    languageButton.setAttribute("aria-label", lang === "en" ? "Switch language to Chinese" : "切换为英文");
    languageButton.setAttribute("aria-pressed", String(lang === "zh"));
  }
  if (menuButton) {
    const isOpen = body.classList.contains("nav-open");
    menuButton.setAttribute(
      "aria-label",
      lang === "zh"
        ? (isOpen ? "关闭导航" : "打开导航")
        : (isOpen ? "Close navigation" : "Open navigation")
    );
  }
  const title = body.dataset[lang === "zh" ? "titleZh" : "titleEn"];
  if (title) document.title = title;
  try {
    localStorage.setItem("yh-language", lang);
  } catch {
    // Language still works when browser storage is unavailable.
  }
}

applyLanguage(preferredLanguage());

languageButton?.addEventListener("click", () => {
  applyLanguage(root.lang === "en" ? "zh" : "en");
});

menuButton?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute(
    "aria-label",
    root.lang === "zh-CN"
      ? (isOpen ? "关闭导航" : "打开导航")
      : (isOpen ? "Close navigation" : "Open navigation")
  );
  menuButton.textContent = isOpen ? "×" : "☰";
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuButton) {
      menuButton.textContent = "☰";
      menuButton.setAttribute("aria-label", root.lang === "zh-CN" ? "打开导航" : "Open navigation");
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && body.classList.contains("nav-open")) {
    body.classList.remove("nav-open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuButton) {
      menuButton.textContent = "☰";
      menuButton.setAttribute("aria-label", root.lang === "zh-CN" ? "打开导航" : "Open navigation");
      menuButton.focus();
    }
  }
});

const year = document.querySelector("[data-current-year]");
if (year) year.textContent = String(new Date().getFullYear());
