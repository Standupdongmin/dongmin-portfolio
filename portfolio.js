/* 화면 구조와 스타일은 HTML에, 수정할 내용은 content.js에 있습니다. */
(() => {
  'use strict';
  const content = window.PORTFOLIO_CONTENT;
  if (!content) throw new Error('content.js를 불러오지 못했습니다. 파일 위치와 문법을 확인해 주세요.');
  const { site, ui, works, games, profile } = content;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const lines = values => values.map(escape).join('<br>');
  const text = (selector, value) => { document.querySelector(selector).textContent = value; };
  const html = (selector, value) => { document.querySelector(selector).innerHTML = value; };
  function art(type){const colors={arena:'#d09b68',effect:'#f79451',hud:'#a5d089',jump:'#a7cb71',ai:'#8cae87',boss:'#b2a1d2'};let c=colors[type];let s='';if(type==='ai'){s='<path d="M130 80H470M300 80V135M120 135H480M120 135V190M300 135V190M480 135V190" fill="none" stroke="'+c+'" stroke-width="2"/>';[[230,50,'타깃 판단'],[50,190,'대기'],[230,190,'추격'],[410,190,'공격']].forEach(([x,y,t])=>s+='<rect x="'+x+'" y="'+y+'" width="140" height="45" fill="#29392a" stroke="'+c+'"/><text x="'+(x+70)+'" y="'+(y+29)+'" text-anchor="middle" fill="'+c+'" font-size="15">'+t+'</text>')}else if(type==='jump'){s='<path d="M60 215Q200 50 300 145T530 65" stroke="'+c+'" stroke-width="2" stroke-dasharray="7 7" fill="none"/>';[[50,220],[180,180],[310,150],[460,100]].forEach(([x,y],i)=>s+='<path d="M'+x+' '+y+'l60 -20 50 20 -60 20z" fill="'+c+'" opacity=".8"/><path d="M'+x+' '+y+'v30l50 20 60 -20v-30l-60 20z" fill="#394d31"/>');s+='<circle cx="490" cy="60" r="12" fill="#ff783c"/>'}else if(type==='boss'){s='<circle cx="300" cy="155" r="100" stroke="'+c+'" fill="none" stroke-dasharray="3 8"/><path d="M300 55L370 190H230Z" fill="#473a58" stroke="'+c+'"/><path d="M300 115L420 250H180Z" fill="'+c+'" opacity=".13"/><circle cx="300" cy="155" r="17" fill="'+c+'"/>'}else{s='<path d="M0 270L210 110H390L600 270M0 0L210 110M600 0L390 110M210 110V210H390V110" fill="none" stroke="'+c+'" opacity=".4"/><path d="M260 155H340M300 115V195" stroke="'+c+'"/><circle cx="300" cy="155" r="27" fill="none" stroke="'+c+'"/><path d="M375 280L340 215L380 190L440 215L470 280Z" fill="#5a6653" stroke="'+c+'"/>';if(type==='effect')s+='<path d="M345 205L305 175L330 168L290 132L358 174L347 150L378 190Z" fill="#ffad68"/>';if(type==='hud')s+='<rect x="30" y="235" width="150" height="8" fill="#abc881"/><text x="30" y="225" fill="#abc881" font-size="12">체력</text><text x="500" y="245" fill="#abc881" font-size="26">24 / 96</text>'}return '<svg viewBox="0 0 600 300" role="img" aria-label="작업 내용을 표현한 개념 그래픽"><defs><pattern id="g'+type+'" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#77876a" opacity=".1"/></pattern></defs><rect width="600" height="300" fill="url(#g'+type+')"/>'+s+'</svg>'}

  document.title = site.title;
  html('.brand', `${escape(site.name)}<i> / </i>${escape(site.role)}`);
  document.querySelectorAll('nav .links a').forEach((node, i) => { node.textContent = site.navigation[i]; });
  text('.hero .eyebrow', site.hero.eyebrow);
  html('.hero h1', `${lines(site.hero.headline.slice(0, 2))}<br><em>${escape(site.hero.headline[2])}</em>`);
  const introduction = site.hero.intro.map((line, i) => {
    if (i !== 0 || !line.includes(site.name)) return escape(line);
    return line.split(site.name).map(escape).join(`<b>${escape(site.name)}</b>`);
  }).join('<br>');
  html('.hero p', introduction);
  html('.hero .actions a', `${escape(site.hero.primaryAction)} <span>↓</span>`);
  text('.hero .actions button', site.hero.profileAction);
  text('.arttag', site.hero.artTag);
  html('.artfoot', `${escape(site.hero.artCaption)}<br><span class="tiny">${escape(site.hero.artNote)}</span>`);
  document.querySelectorAll('.principles > div').forEach((node, i) => {
    const principle = site.principles[i];
    node.querySelector('span').textContent = principle.label;
    node.querySelector('b').textContent = principle.title;
    node.querySelector('p').textContent = principle.description;
  });
  for (const section of ['works', 'games']) {
    text(`#${section} .eyebrow`, site[section].eyebrow);
    text(`#${section} h2`, site[section].title);
    html(`#${section} .sectionhead > p`, lines(site[section].description));
  }
  text('#games > .tiny', site.games.note);
  text('.closing .eyebrow', site.closing.eyebrow);
  html('.closing h2', `${escape(site.closing.heading[0])}<br><strong>${escape(site.closing.heading[1])}</strong>`);
  html('.closing p', lines(site.closing.description));
  text('.closing .actions button', site.closing.profileAction);
  text('.closing .actions a', site.closing.backAction);
  document.querySelectorAll('footer span').forEach((node, i) => { node.textContent = site.footer[i]; });
  text('.modal-close', ui.closeLabel);
  document.querySelector('.modal-close').setAttribute('aria-label', ui.closeAriaLabel);

  html('.filters', ui.categories.map((category, i) => `<button class="filter ${i ? '' : 'active'}" aria-pressed="${!i}" data-cat="${escape(category)}">${escape(category)}</button>`).join(''));
  html('#worklist', works.map((work, i) => `<article class="work" data-category="${escape(work.category)}" id="work-${i}"><div class="overview"><div class="visual">${art(work.art)}<span class="vlabel">${escape(ui.visualNote)}</span></div><div><div class="eyebrow">${escape(work.eyebrow)}</div><h3>${escape(work.title)}</h3><b>${escape(work.subtitle)}</b><p>${escape(work.summary)}</p><div class="role"><small>${escape(ui.roleLabel)}</small>${escape(work.role)}</div><div class="actions">${work.actions.map((action, j) => `<button class="btn${j === 0 ? ' primary' : ''}" data-work-index="${i}" data-action-index="${j}">${escape(action.label)}</button>`).join('')}</div></div></div><div class="explore">${ui.detailLabels.map((label, j) => `<button class="expbtn" aria-expanded="false" aria-controls="detail-${i}-${j}" id="toggle-${i}-${j}" data-work="${i}" data-part="${j}"><small>0${j + 1}</small><b>${escape(label)}</b><span aria-hidden="true">＋</span></button>`).join('')}</div>${ui.detailLabels.map((label, j) => `<div class="detail" id="detail-${i}-${j}" role="region" aria-labelledby="toggle-${i}-${j}" hidden><h4>${escape(label)}</h4><ul class="project-story">${work.details[j].map(paragraph => `<li>${escape(paragraph)}</li>`).join('')}</ul>${j === 1 ? `<div class="check">${escape(ui.checkLabel)} · ${escape(work.check)}</div>` : ''}<p class="sample">${escape(work.sources)}</p></div>`).join('')}</article>`).join(''));
  document.querySelectorAll('.visual svg').forEach(node => { node.setAttribute('aria-label', ui.visualLabel); });
  text('#count', `${works.length}${ui.workCount}`);
  document.querySelectorAll('.filter').forEach(button => {
    button.onclick = () => {
      document.querySelectorAll('.filter').forEach(node => {
        node.classList.toggle('active', node === button);
        node.setAttribute('aria-pressed', String(node === button));
      });
      let count = 0;
      document.querySelectorAll('.work').forEach(node => {
        node.hidden = button.dataset.cat !== ui.allCategory && node.dataset.category !== button.dataset.cat;
        if (!node.hidden) count++;
      });
      text('#count', `${count}${ui.workCount}`);
    };
  });
  document.querySelectorAll('.expbtn').forEach(button => {
    button.onclick = () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const article = button.closest('article');
      article.querySelectorAll('.expbtn').forEach(node => { node.setAttribute('aria-expanded', 'false'); node.querySelector('span').textContent = '＋'; });
      article.querySelectorAll('.detail').forEach(node => { node.hidden = true; });
      if (!expanded) {
        button.setAttribute('aria-expanded', 'true');
        button.querySelector('span').textContent = '−';
        document.getElementById(button.getAttribute('aria-controls')).hidden = false;
      }
    };
  });
  html('#gamegrid', games.map((game, i) => `<details class="game"><summary><small>0${i + 1} / ${escape(game.category)}</small><strong>${escape(game.name)}</strong><span>${escape(game.headline)} · ${escape(ui.gameExpand)}</span></summary><div class="inside"><p class="draft-label">${escape(ui.gameNote)}</p><ul class="game-story">${ui.gameLabels.map((label, j) => `<li><b>${escape(label)}</b><p>${escape(game.paragraphs[j])}</p></li>`).join('')}</ul></div></details>`).join(''));

  const modal = document.getElementById('modal');
  function openModal(title, paragraphs, source, url) {
    let link = '';
    if (url) {
      const parsed = new URL(url, document.baseURI);
      const relativeFile = location.protocol === 'file:' && parsed.protocol === 'file:' && !/^(?:[a-z][a-z0-9+.-]*:|[\\/])/i.test(url);
      if (parsed.protocol === 'https:' || (parsed.origin === location.origin && parsed.protocol === 'http:') || relativeFile) {
        link = `<a class="btn" href="${escape(parsed.href)}" target="_blank" rel="noopener noreferrer">${escape(ui.linkLabel)}</a>`;
      }
    }
    html('#modal-body', `<div class="eyebrow">${escape(ui.modalEyebrow)}</div><h2 id="modal-title">${escape(title)}</h2><div class="doc">${paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</div><p class="tiny">${escape(source)}</p>${link}`);
    modal.showModal();
  }
  document.querySelectorAll('[data-modal]').forEach(button => { button.onclick = () => openModal(profile.title, profile.paragraphs, profile.sourceNote, profile.url); });
  document.querySelectorAll('[data-work-index]').forEach(button => {
    button.onclick = () => {
      const work = works[Number(button.dataset.workIndex)];
      const action = work.actions[Number(button.dataset.actionIndex)];
      openModal(action.title, work.details[action.detail], work.sources, action.url);
    };
  });
  document.querySelector('.modal-close').onclick = () => modal.close();
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
  });
})();
