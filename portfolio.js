/* 문구는 content.js, 실제 이미지와 PDF 경로는 assets.js에서 관리합니다. */
(() => {
  'use strict';
  const content = window.PORTFOLIO_CONTENT;
  if (!content) throw new Error('content.js를 불러오지 못했습니다. 파일 위치와 문법을 확인해 주세요.');
  const { site, ui, works, games, profile } = content;
  const assets = window.PORTFOLIO_ASSETS || {};
  const documents = assets.documents || {};
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const number = value => String(value).padStart(2, '0');
  const text = (selector, value) => { const node = document.querySelector(selector); if (node) node.textContent = value; };
  const html = (selector, value) => { const node = document.querySelector(selector); if (node) node.innerHTML = value; };
  const firstSentence = value => String(value || '').match(/^[\s\S]*?[.!?](?=\s|$)/)?.[0] || String(value || '');

  function sentences(value) {
    return String(value ?? '').split(/\n+/).flatMap(line => line.trim().split(/(?<=[.!?])\s+/u)).filter(Boolean);
  }

  function proseMarkup(value, className = 'prose') {
    const paragraphs = (Array.isArray(value) ? value : [value]).flatMap(sentences);
    return `<div class="${className}">${paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</div>`;
  }

  function itemList(value, className = 'role-items', separator = ' · ') {
    const items = (Array.isArray(value) ? value : String(value || '').split(separator)).map(item => String(item).trim()).filter(Boolean);
    return `<ul class="${className}">${items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
  }

  function capabilityButton(label) {
    const capability = (profile.skillDetails || []).find(item => item.label === label);
    if (!capability) return escape(label);
    return `<button type="button" class="capability-button" data-capability-open="${escape(capability.id)}" aria-label="${escape(label)} 활용 역량 보기" aria-haspopup="dialog" aria-controls="modal">${escape(label)}</button>`;
  }

  function capabilityList(value) {
    const labels = Array.isArray(value) ? value : String(value || '').split(' · ');
    return `<ul class="capability-list">${labels.map(label => `<li>${capabilityButton(label.trim())}</li>`).join('')}</ul>`;
  }

  function detailContent(work, part) {
    const groups = part === 1 && Array.isArray(work.solutionGroups) ? work.solutionGroups : [];
    const pool = work.details[part].flatMap(sentences);
    const grouped = new Set();
    const groupedBody = groups.map(group => {
      const paragraphs = (group.sentenceIndices || []).filter(index => Number.isInteger(index) && index >= 0 && index < pool.length).map(index => { grouped.add(index); return pool[index]; });
      if (!paragraphs.length) return '';
      return `<div class="detail-group"><h4>${escape(group.title)}</h4><div class="detail-group-body">${group.asList ? itemList(paragraphs, 'detail-group-list') : proseMarkup(paragraphs)}</div></div>`;
    }).join('');
    const body = groups.length ? groupedBody + (grouped.size < pool.length ? proseMarkup(pool.filter((_, index) => !grouped.has(index))) : '') : work.details[part].map(paragraph => proseMarkup(paragraph)).join('');
    const check = part === 1 ? `<div class="detail-check"><small>${escape(ui.checkLabel)}</small>${itemList(work.check, 'check-items', ' / ')}</div>` : '';
    return `<div class="detail-content">${body}${check}</div>`;
  }

  function safeURL(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const parsed = new URL(value, document.baseURI);
      const relativeFile = location.protocol === 'file:' && parsed.protocol === 'file:' && !/^(?:[a-z][a-z0-9+.-]*:|[\\/])/i.test(value);
      if (parsed.protocol === 'https:' || (parsed.protocol === 'http:' && parsed.origin === location.origin) || relativeFile) return parsed.href;
    } catch (_) { /* 잘못된 경로는 화면에 연결하지 않습니다. */ }
    return '';
  }

  function mediaMarkup(media, fallbackTitle, eager = false) {
    if (!media) return '';
    const src = safeURL(media.src);
    if (!src) return '';
    const title = media.alt || fallbackTitle;
    const original = safeURL(media.original) || src;
    if (media.type === 'video') {
      const poster = safeURL(media.poster);
      return `<button type="button" class="media-trigger video-trigger" data-video-open="${escape(src)}" data-media-original="${escape(original)}" data-media-title="${escape(title)}" data-media-poster="${escape(poster)}" aria-label="${escape(title)} 영상 보기">${poster ? `<img class="media-image" src="${escape(poster)}" alt="${escape(title)}" width="1600" height="900" loading="${eager ? 'eager' : 'lazy'}" decoding="async">` : `<span class="video-label">${escape(title)}</span>`}<span class="media-expand">영상 보기 ▷</span></button>`;
    }
    return `<button type="button" class="media-trigger" data-image-open="${escape(src)}" data-media-original="${escape(original)}" data-media-title="${escape(title)}" aria-label="${escape(title)} 확대 보기"><img class="media-image" src="${escape(src)}" alt="${escape(title)}" width="${Number(media.width) || 1600}" height="${Number(media.height) || 900}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}><span class="media-expand" aria-hidden="true">↗</span></button>`;
  }

  function setMedia(selector, media, fallbackTitle, eager = false) {
    const node = document.querySelector(selector);
    if (!node) return;
    const markup = mediaMarkup(media, fallbackTitle, eager);
    node.hidden = !markup;
    node.innerHTML = markup;
  }

  function documentLinks(doc, className = 'doc-actions') {
    const url = safeURL(doc?.url);
    if (!url) return '';
    return `<div class="${className}"><a class="btn" href="${escape(url)}" target="_blank" rel="noopener noreferrer">PDF 원본 보기 ↗</a><a class="text-link" href="${escape(url)}" download>다운로드 ↓</a></div>`;
  }

  document.title = site.title;
  text('.brand-name', site.name);
  text('.brand-role', site.role);
  setMedia('#hero-media', assets.hero || assets.projects?.battle, 'The Battle Arena 작업 화면', true);
  setMedia('#featured-media', assets.projects?.battle, 'The Battle Arena 작업 화면');
  setMedia('#jump-media', assets.projects?.jump, 'Project Jump 작업 화면');
  const overviewURL = safeURL(documents.overview?.url);
  ['#header-download', '#hero-download', '#footer-download'].forEach(selector => {
    const link = document.querySelector(selector);
    if (!link) return;
    link.hidden = !overviewURL;
    if (!overviewURL) return;
    link.href = '#portfolio-overview';
  });
  const overviewSection = document.getElementById('portfolio-overview');
  if (overviewSection) overviewSection.hidden = !overviewURL;
  setMedia('#overview-preview', { src: documents.overview?.cover, alt: documents.overview?.title, width: 1280, height: 720 }, '포트폴리오 개요 표지');
  text('#overview-file-meta', `포트폴리오 개요 · PDF · ${documents.overview?.pageCount || 21}쪽`);
  if (overviewURL) html('#overview-actions', `<a class="btn primary" href="${escape(overviewURL)}" download="서동민_포트폴리오_개요.pdf">개요 PDF 다운로드 <span aria-hidden="true">↓</span></a><a class="text-link" href="${escape(overviewURL)}" target="_blank" rel="noopener noreferrer">PDF 원본 보기 ↗</a>`);

  html('#battle-tasks', works.slice(0, 3).map((work, i) => `<article class="task-item"><div class="task-copy"><span class="eyebrow">${escape(work.eyebrow)}</span><h4>${escape(work.title)}</h4><p class="task-subtitle">${escape(work.subtitle)}</p></div><button type="button" class="text-link" data-work-open="${i}">제작 과정 보기 ↗</button></article>`).join(''));
  html('#jump-actions', `<button type="button" class="btn primary" data-work-open="3">기획 과정 보기 ↗</button>`);
  html('#document-grid', [4, 5].map((i, documentIndex) => {
    const work = works[i];
    const doc = documents[documentIndex === 0 ? 'monster' : 'guardian'];
    const cover = typeof doc?.cover === 'string' ? { src: doc.cover, alt: doc.title || work.title } : doc?.cover;
    const preview = mediaMarkup(cover, work.title);
    return `<article class="doc-card">${preview ? `<div class="doc-preview">${preview}</div>` : ''}<div class="doc-content"><span class="doc-tag">개인 기획 · ${escape(work.category)}서</span><h3>${escape(work.title)}</h3><b class="work-subtitle">${escape(work.subtitle)}</b>${proseMarkup(work.summary)}<div class="doc-meta"><small>${escape(work.metaLabel || ui.roleLabel)}</small>${itemList(work.role)}</div><div class="doc-actions"><button type="button" class="btn primary" data-work-open="${i}">기획 내용 열람 ↗</button></div>${documentLinks(doc)}</div></article>`;
  }).join(''));
  html('#skills-grid', works.slice(6).map((work, offset) => {
    const i = offset + 6;
    const media = assets.works?.[work.id];
    const visual = mediaMarkup(media, work.title);
    return `<article class="skill-item${visual ? '' : ' has-no-media'}">${visual ? `<figure class="skill-media">${visual}</figure>` : ''}<div class="skill-copy"><span class="eyebrow">${escape(work.eyebrow)}</span><h3>${escape(work.title)}</h3>${proseMarkup(work.summary)}<div class="role"><small>${escape(work.metaLabel || ui.roleLabel)}</small>${itemList(work.role)}</div><button type="button" class="text-link" data-work-open="${i}">작업 과정 보기 ↗</button></div></article>`;
  }).join(''));
  text('#profile-kicker', profile.tagline);
  html('#profile-summary', proseMarkup(profile.paragraphs[0], 'prose profile-summary-text'));
  const portrait = safeURL(assets.profile?.portrait);
  html('#profile-identity', `<div class="profile-person">${portrait ? `<img class="profile-portrait" src="${escape(portrait)}" alt="서동민 프로필 사진" width="${Number(assets.profile?.portraitWidth) || 142}" height="${Number(assets.profile?.portraitHeight) || 189}" loading="lazy" decoding="async">` : ''}<p class="profile-person-name">${escape(site.name)}</p><p class="profile-english-name">${escape(profile.englishName)}</p><span class="profile-person-role">${escape(site.role)}</span></div><a class="text-link profile-contact" href="#contact">연락처 보기 <span aria-hidden="true">↓</span></a>`);
  html('#profile-facts', `<div class="profile-fact-column"><section class="profile-group"><h3>학력 사항</h3><ol class="profile-timeline">${(profile.education || []).map(item => `<li><span>${escape(item.year)}</span><p>${escape(item.description)}</p></li>`).join('')}</ol></section><section class="profile-group"><h3>보유 역량</h3><dl class="profile-capabilities">${(profile.capabilities || []).map(item => `<div><dt>${escape(item.label)}</dt><dd>${capabilityList(item.value)}</dd></div>`).join('')}</dl><p class="capability-hint">이름을 누르면 활용 내용을 볼 수 있습니다.</p></section></div><div class="profile-fact-column"><section class="profile-group"><h3>프로젝트 이력</h3><ol class="profile-projects">${(profile.projects || []).map(project => `<li><span class="profile-date">${escape(project.period)}</span><a class="profile-project-name" href="#${escape(project.target)}">${escape(project.name)} <span aria-hidden="true">↗</span></a><p>${escape(project.type)}</p>${itemList(project.role, 'role-items profile-role-items')}</li>`).join('')}</ol></section><section class="profile-group"><h3>전시 이력</h3><p class="profile-exhibition"><span class="profile-date">${escape(profile.exhibition?.year)}</span><strong>${escape(profile.exhibition?.description)}</strong><span>${escape(profile.exhibition?.project)}</span></p></section></div>`);
  html('#profile-tools', `<h3>보유 기술</h3><ul>${(profile.tools || []).map(tool => `<li>${capabilityButton(tool)}</li>`).join('')}</ul>`);
  html('#principles', site.principles.map(principle => `<div class="principle"><span>${escape(principle.label)}</span><b>${escape(principle.title)}</b><p>${escape(principle.description)}</p></div>`).join(''));
  html('#gamegrid', games.map((game, i) => `<details class="game" name="played-games"><summary><small>${number(i + 1)} / ${escape(game.category)}</small><strong>${escape(game.name)}</strong><span>${escape(game.headline)} · ${escape(ui.gameExpand)}</span></summary><div class="inside"><p class="draft-label">${escape(ui.gameNote)}</p><ul class="game-story">${ui.gameLabels.map((label, j) => `<li><b>${escape(label)}</b><p>${escape(game.paragraphs[j])}</p></li>`).join('')}</ul></div></details>`).join(''));
  // Keep the same behavior in browsers without native exclusive details groups.
  document.getElementById('gamegrid')?.addEventListener('toggle', event => {
    const opened = event.target;
    if (!opened.matches('details.game') || !opened.open) return;
    document.querySelectorAll('#gamegrid > details.game[open]').forEach(game => {
      if (game !== opened) game.open = false;
    });
  }, true);

  const contactLinks = [];
  const email = String(assets.contact?.email || '').trim();
  const phone = String(assets.contact?.phone || '').trim();
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) contactLinks.push(`<a class="contact-link" href="mailto:${escape(email)}"><small>이메일</small><strong>${escape(email)}</strong><span aria-hidden="true">↗</span></a>`);
  const dialable = phone.replace(/[^+\d]/g, '');
  if (/^\+?\d{7,15}$/.test(dialable)) contactLinks.push(`<a class="contact-link" href="tel:${escape(dialable)}"><small>전화</small><strong>${escape(phone)}</strong><span aria-hidden="true">↗</span></a>`);
  html('#contact-links', contactLinks.join(''));
  const contactSection = document.getElementById('contact');
  if (contactSection) contactSection.hidden = !contactLinks.length;
  document.querySelectorAll('nav .links a[href="#contact"]').forEach(link => { link.hidden = !contactLinks.length; });

  const workDialog = document.getElementById('modal');
  const imageDialog = document.getElementById('image-modal');
  const dialogs = [workDialog, imageDialog].filter(Boolean);
  const dialogTriggers = new WeakMap();
  let previousOverflow = '';
  function openDialog(dialog, trigger = document.activeElement) {
    if (!dialog || dialog.open) return;
    if (!dialogs.some(node => node.open)) previousOverflow = document.body.style.overflow;
    dialogTriggers.set(dialog, trigger);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    closeMenu();
    dialog.showModal();
  }
  dialogs.forEach(dialog => {
    dialog.addEventListener('close', () => {
      dialog.querySelectorAll('video').forEach(video => video.pause());
      if (!dialogs.some(node => node.open)) {
        document.body.style.overflow = previousOverflow;
        document.body.classList.remove('modal-open');
      }
      const trigger = dialogTriggers.get(dialog);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      queueProgress();
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  document.querySelector('.modal-close')?.addEventListener('click', () => workDialog?.close());
  document.querySelector('.image-close')?.addEventListener('click', () => imageDialog?.close());

  function evidenceMedia(work) {
    const media = assets.works?.[work.id];
    if (!media) return [];
    const candidates = [media, ...(Array.isArray(media.gallery) ? media.gallery : [])];
    const seen = new Set();
    return candidates.filter(item => {
      const src = safeURL(item?.src);
      if (!src || seen.has(src)) return false;
      seen.add(src);
      return true;
    });
  }

  function openWork(index, trigger) {
    const work = works[index];
    if (!work || !workDialog) return;
    const alreadyOpen = workDialog.open;
    delete workDialog.dataset.mode;
    workDialog.removeAttribute('aria-describedby');
    document.querySelector('.modal-close')?.setAttribute('aria-label', '작업 상세 닫기');
    text('#modal-title', work.title);
    const evidence = evidenceMedia(work);
    const externalActions = work.actions.map(action => ({ ...action, url: safeURL(action.url) })).filter(action => action.url);
    const sourceDocument = index === 4 ? documents.monster : index === 5 ? documents.guardian : null;
    const sourceActions = sourceDocument ? documentLinks(sourceDocument, 'modal-action-links') : overviewURL ? '<div class="modal-action-links"><a class="text-link" href="#portfolio-overview" data-overview-link>포트폴리오 개요 PDF 안내 <span aria-hidden="true">↑</span></a></div>' : '';
    html('#modal-body', `
      <div class="work-modal-heading">
        <div class="eyebrow">${escape(work.eyebrow)}</div>
        <p class="work-subtitle">${escape(work.subtitle)}</p>
        ${proseMarkup(work.summary)}
        <div class="role"><small>${escape(work.metaLabel || ui.roleLabel)}</small>${itemList(work.role)}</div>
      </div>
      <div class="modal-summary-grid">${ui.detailLabels.map((label, part) => `
        <a class="modal-summary-card" href="#work-detail-${index}-${part}" data-detail-target="work-detail-${index}-${part}">
          <small>${number(part + 1)}</small><strong>${escape(label)}</strong>
          <p>${escape(firstSentence(work.details[part][0]))}</p><span aria-hidden="true">↓</span>
        </a>`).join('')}
      </div>
      <div class="detail-sections">${ui.detailLabels.map((label, part) => `
        <section class="detail-section" id="work-detail-${index}-${part}">
          <h3><span>${number(part + 1)}</span> ${escape(label)}</h3>
          ${detailContent(work, part)}
        </section>`).join('')}
      </div>
      ${evidence.length ? `<div class="evidence-gallery">${evidence.map((media, i) => `
        <figure class="evidence-item">${mediaMarkup(media, `${work.title} 작업 자료 ${i + 1}`)}${media.alt ? `<figcaption class="evidence-caption">${escape(media.alt)}</figcaption>` : ''}</figure>`).join('')}</div>` : ''}
      <p class="modal-source">${escape(work.sources)}</p>
      ${sourceActions}
      ${externalActions.length ? `<div class="modal-action-links">${externalActions.map(action => `<a class="btn" href="${escape(action.url)}" target="_blank" rel="noopener noreferrer">${escape(action.label)}</a>`).join('')}</div>` : ''}
    `);
    openDialog(workDialog, trigger);
    const body = document.getElementById('modal-body');
    if (body) body.scrollTop = 0;
    workDialog.scrollTop = 0;
    if (alreadyOpen) document.getElementById('modal-title')?.focus({ preventScroll: true });
  }

  function openCapability(id, trigger) {
    const capability = (profile.skillDetails || []).find(item => item.id === id);
    if (!capability || !workDialog) return;
    workDialog.dataset.mode = 'capability';
    workDialog.setAttribute('aria-describedby', 'capability-summary');
    document.querySelector('.modal-close')?.setAttribute('aria-label', '역량 안내 닫기');
    text('#modal-title', capability.label);
    const relatedWorks = (capability.workIds || []).map(workId => works.findIndex(work => work.id === workId)).filter(index => index >= 0);
    html('#modal-body', `
      <div class="capability-overview"><p class="eyebrow">${escape(capability.category)}</p><p id="capability-summary">${escape(capability.summary)}</p></div>
      <section class="capability-section" aria-labelledby="capability-abilities"><h3 id="capability-abilities">할 수 있는 일</h3>${itemList(capability.items, 'capability-abilities')}</section>
      ${relatedWorks.length ? `<section class="capability-section capability-related" aria-labelledby="capability-related-title"><h3 id="capability-related-title">관련 작업</h3><div class="capability-work-links">${relatedWorks.map(index => `<button type="button" class="capability-work-link" data-work-open="${index}"><span>${escape(works[index].title)}</span><span aria-hidden="true">↗</span></button>`).join('')}</div></section>` : ''}
    `);
    openDialog(workDialog, trigger);
    document.getElementById('modal-body').scrollTop = 0;
    workDialog.scrollTop = 0;
  }

  function openMedia(button) {
    if (!imageDialog) return;
    const isVideo = Boolean(button.dataset.videoOpen);
    const src = safeURL(button.dataset.videoOpen || button.dataset.imageOpen);
    if (!src) return;
    const title = button.dataset.mediaTitle || '';
    const image = document.getElementById('lightbox-image');
    let video = document.getElementById('lightbox-video');
    text('#image-title', title);
    if (isVideo && !video) {
      video = document.createElement('video');
      video.id = 'lightbox-video';
      video.className = 'video-player';
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      image?.insertAdjacentElement('afterend', video);
    }
    if (video) {
      video.pause();
      video.hidden = !isVideo;
      if (isVideo) {
        video.src = src;
        video.poster = safeURL(button.dataset.mediaPoster);
      }
    }
    if (image) {
      image.hidden = isVideo;
      if (!isVideo) { image.src = safeURL(button.dataset.mediaOriginal) || src; image.alt = title; }
    }
    const originalLink = document.getElementById('image-original');
    if (originalLink) {
      originalLink.href = safeURL(button.dataset.mediaOriginal) || src;
      originalLink.target = '_blank';
      originalLink.rel = 'noopener noreferrer';
      originalLink.textContent = isVideo ? '원본 영상 열기 ↗' : '원본 이미지 열기 ↗';
    }
    openDialog(imageDialog, button);
  }

  document.addEventListener('click', event => {
    const overviewLink = event.target.closest('[data-overview-link]');
    if (overviewLink) {
      closeMenu();
      if (dialogs.some(dialog => dialog.open)) {
        event.preventDefault();
        dialogs.forEach(dialog => { if (dialog.open) { dialogTriggers.delete(dialog); dialog.close(); } });
        history.pushState(null, '', '#portfolio-overview');
        requestAnimationFrame(() => {
          document.getElementById('overview-title')?.focus({ preventScroll: true });
          document.getElementById('portfolio-overview')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        });
      }
      return;
    }
    const capabilityButton = event.target.closest('[data-capability-open]');
    if (capabilityButton) { openCapability(capabilityButton.dataset.capabilityOpen, capabilityButton); return; }
    const workButton = event.target.closest('[data-work-open]');
    if (workButton) { openWork(Number(workButton.dataset.workOpen), workButton); return; }
    const mediaButton = event.target.closest('[data-image-open], [data-video-open]');
    if (mediaButton) { openMedia(mediaButton); return; }
    const detailLink = event.target.closest('[data-detail-target]');
    if (detailLink) {
      event.preventDefault();
      document.getElementById(detailLink.dataset.detailTarget)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('nav .links');
  function closeMenu() {
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.classList.remove('is-open');
    navigation?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.classList.toggle('is-open', open);
    navigation?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.matchMedia('(min-width: 769px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const progress = document.querySelector('.scroll-progress span');
  let progressFrame = 0;
  function queueProgress() {
    if (progressFrame) return;
    progressFrame = requestAnimationFrame(() => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = available > 0 ? Math.max(0, Math.min(1, window.scrollY / available)) : 0;
      if (progress) progress.style.transform = `scaleX(${fraction})`;
      progressFrame = 0;
    });
  }
  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', queueProgress, { passive: true });
  window.addEventListener('load', queueProgress, { once: true });
  document.querySelectorAll('details').forEach(node => node.addEventListener('toggle', queueProgress));
  queueProgress();
  const navLinks = [...document.querySelectorAll('nav .links a[href^="#"]')].filter(link => !link.hidden);
  const sections = navLinks.map(link => document.getElementById(link.hash.slice(1))).filter(section => section && !section.hidden);
  function activateSection(section) {
    navLinks.forEach(link => {
      const active = Boolean(section && link.hash === `#${section.id}`);
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    const visibleSections = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visibleSections.set(entry.target, entry.isIntersecting));
      const visible = sections.filter(section => visibleSections.get(section));
      const passed = sections.filter(section => section.getBoundingClientRect().top <= window.innerHeight * .4);
      const candidates = visible.length ? visible : passed;
      candidates.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
      activateSection(candidates[0]);
    }, { rootMargin: '-18% 0px -58% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }
  function openLegacyHash() {
    const match = location.hash.match(/^#work-(\d+)$/);
    if (match && works[Number(match[1])]) openWork(Number(match[1]));
  }
  window.addEventListener('hashchange', openLegacyHash);
  openLegacyHash();
})();
