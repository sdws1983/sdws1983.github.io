"use strict";
(() => {
  const form = document.querySelector('#filters');
  const cards = [...document.querySelectorAll('.paper-card')];
  const sections = [...document.querySelectorAll('.direction')];
  const search = document.querySelector('#search');
  const direction = document.querySelector('#direction');
  const type = document.querySelector('#type');
  const priority = document.querySelector('#priority');
  const expand = document.querySelector('#expand-all');
  const searchable = new Map(cards.map(card => [card,card.textContent.toLocaleLowerCase()+' '+[...card.querySelectorAll('a')].map(a=>a.href).join(' ')]));
  form.hidden = false;
  form.addEventListener('submit', event => event.preventDefault());
  function filter() {
    const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(card => {
      const visible = (direction.value==='all'||card.closest('.direction').dataset.direction===direction.value)
        && (type.value==='all'||card.dataset.type===type.value)
        && (!priority.checked||card.dataset.priority==='true')
        && words.every(word=>searchable.get(card).includes(word));
      card.hidden = !visible;
      if (visible) count++;
    });
    sections.forEach(section => {
      const n = [...section.querySelectorAll('.paper-card')].filter(card=>!card.hidden).length;
      section.hidden = n===0;
      section.querySelector('.direction-count').textContent = n+' 篇';
    });
    document.querySelector('#result-count').textContent = '显示 '+count+' / '+cards.length+' 篇';
    document.querySelector('#empty-state').hidden = count!==0;
  }
  form.addEventListener('input',filter);
  // Reset controls and results together, without depending on native reset timing.
  form.addEventListener('reset',event=>{
    event.preventDefault();
    search.value=''; direction.value='all'; type.value='all'; priority.checked=false;
    filter();
  });
  document.querySelectorAll('.reading-sidebar nav a').forEach(link => link.addEventListener('click',()=>{
    form.reset(); filter();
  }));
  function showHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = document.getElementById(id);
    if (target?.classList.contains('paper-card')) {
      form.reset(); filter(); target.querySelector('details').open = true;
      target.scrollIntoView();
    }
  }
  window.addEventListener('hashchange',showHash);
  showHash();
  expand.addEventListener('click',()=>{
    const open = expand.getAttribute('aria-pressed')!=='true';
    cards.filter(card=>!card.hidden).forEach(card=>{card.querySelector('details').open=open;});
    expand.setAttribute('aria-pressed',String(open));
    expand.textContent=open?'收起全部导读':'展开全部导读';
  });
  document.querySelector('#print-page').addEventListener('click',()=>window.print());
  let beforePrint=[];
  window.addEventListener('beforeprint',()=>{
    beforePrint=cards.map(card=>card.querySelector('details').open);
    cards.forEach(card=>{card.querySelector('details').open=true;});
  });
  window.addEventListener('afterprint',()=>cards.forEach((card,i)=>{card.querySelector('details').open=beforePrint[i]||false;}));
})();
