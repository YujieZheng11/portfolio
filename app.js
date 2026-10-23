(() => {
  'use strict';
  const projects = window.PORTFOLIO_PROJECTS;
  const grid = document.querySelector('#project-grid');
  const projectDialog = document.querySelector('#project-dialog');
  const indexDialog = document.querySelector('#index-dialog');
  let activeProject = 0, activeSlide = 0;
  const el = (selector) => document.querySelector(selector);
  let language = 'en';
  try { language = localStorage.getItem('portfolio-language') || (navigator.language.startsWith('zh') ? 'zh' : 'en'); } catch {}
  if (!['en', 'zh'].includes(language)) language = 'en';
  const text = (key) => window.PORTFOLIO_LABELS[language][key];
  const number = value => String(value).padStart(2, '0');
  const localizedProject = (index) => language === 'zh' ? {...projects[index], ...window.PORTFOLIO_PROJECT_TEXT_ZH[projects[index].id]} : projects[index];

  function renderProjects() {
  grid.replaceChildren();
  el('#index-list').replaceChildren();
  for (const [i, source] of projects.entries()) {
    const project = localizedProject(i);
    const card = document.createElement('article');
    card.className = 'project-card';
    card.dataset.id = project.id;
    card.dataset.category = project.category;
    card.style.setProperty('--card-bg', project.color);
    card.innerHTML = `<button type="button" aria-label="${text('explore')} ${project.title}"><div class="project-image"><span class="image-index">${number(i + 1)} / ${text('project')}</span><span class="cover-edition" aria-hidden="true">YZ — 2022–2026</span><div class="cover-art"><img src="assets/${project.id}-cover.webp" alt="${project.title} — ${text('outcome')}" loading="lazy" width="800" height="620"></div><span class="cover-title" lang="en" aria-hidden="true">${source.title}</span><span class="image-action" aria-hidden="true">↗</span></div><div class="project-meta"><span>${project.label}</span><span>${number(i + 1)}</span></div><h3 class="project-title">${project.title}</h3><p class="project-summary">${project.short}</p></button>`;
    card.querySelector('button').addEventListener('click', () => openProject(i));
    grid.append(card);

    const row = document.createElement('button');
    row.type = 'button'; row.className = 'index-row';
    row.innerHTML = `<span class="mono">${number(i + 1)}</span><span class="index-name">${project.title}</span><span class="mono index-category">${text(project.category)}</span><span aria-hidden="true">↗</span>`;
    row.addEventListener('click', () => { indexDialog.close(); openProject(i); });
    el('#index-list').append(row);
  }
  applyFilter();
  }

  function applyFilter() {
    const category = el('[data-filter][aria-pressed="true"]').dataset.filter;
    let count = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
      if (!card.hidden) count++;
    });
    el('#project-count').textContent = `${count} ${text(count === 1 ? 'singular' : 'plural')}`;
  }

  function setLanguage(nextLanguage) {
    language = nextLanguage;
    try { localStorage.setItem('portfolio-language', language); } catch {}
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    const column = language === 'zh' ? 2 : 1;
    window.PORTFOLIO_COPY.forEach(entry => { el(entry[0]).innerHTML = entry[column].replaceAll('{count}', number(projects.length)); });
    window.PORTFOLIO_ARIA.forEach(entry => { el(entry[0]).setAttribute('aria-label', entry[column]); });
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    document.title = text('title');
    document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach(meta => meta.content = text('description'));
    document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]').forEach(meta => meta.content = text('title'));
    el('.about-cn').lang = document.documentElement.lang;
    renderProjects();
    if (projectDialog.open) renderProjectDetails();
    document.dispatchEvent(new Event('portfolio-language-change'));
  }
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      applyFilter();
    });
  });

  function showDialog(dialog) {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function openProject(index) {
    activeProject = index; activeSlide = 0;
    renderProjectDetails(); showDialog(projectDialog); projectDialog.scrollTop = 0;
  }
  function renderProjectDetails() {
    const p = localizedProject(activeProject);
    el('#dialog-file').textContent = `${p.id}.project`;
    el('#dialog-category').textContent = p.label;
    el('#dialog-title').textContent = p.title;
    el('#dialog-subtitle').textContent = language === 'zh' ? p.cn : p.short;
    el('#dialog-subtitle').lang = document.documentElement.lang;
    el('#dialog-description').textContent = p.description;
    el('#project-position').textContent = `${text('project')} ${number(activeProject + 1)} / ${number(projects.length)}`;
    projectDialog.classList.toggle('fit-artwork', Boolean(p.fit));
    projectDialog.classList.toggle('type-project', Boolean(p.specimen));
    el('#project-website').hidden = !p.website;
    if (p.website) el('#project-website').href = p.website;
    else el('#project-website').removeAttribute('href');
    el('#type-lab').hidden = !p.specimen;
    el('#lettering-showcase').hidden = !p.specimen;
    if (p.specimen) {
      window.PORTFOLIO_LETTERING_SHOWCASE.render(language);
      window.PORTFOLIO_TYPE_LAB.render(language);
    }
    el('#case-thumbnails').replaceChildren();
    p.slides.forEach((imageNumber, i) => {
      const caption = p.captions[imageNumber - 1];
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `${text('image')} ${i + 1}: ${caption}`);
      button.innerHTML = `<img src="assets/${p.id}-${imageNumber}.webp" alt="" loading="lazy">`;
      button.addEventListener('click', () => { activeSlide = i; updateSlide(); });
      el('#case-thumbnails').append(button);
    });
    updateSlide();
  }
  function updateSlide() {
    const p = localizedProject(activeProject);
    const imageNumber = p.slides[activeSlide];
    const caption = p.captions[imageNumber - 1];
    const image = el('#case-image');
    image.src = `assets/${p.id}-${imageNumber}.webp`;
    el('#case-original').href = image.src;
    image.alt = `${p.title}: ${caption}`;
    el('#case-caption').textContent = caption;
    el('#slide-status').textContent = `${number(activeSlide + 1)} / ${number(p.slides.length)}`;
    el('#prev-slide').disabled = activeSlide === 0;
    el('#next-slide').disabled = activeSlide === p.slides.length - 1;
    el('#case-thumbnails').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === activeSlide)));
  }
  el('#prev-slide').addEventListener('click', () => { if (activeSlide > 0) { activeSlide--; updateSlide(); } });
  el('#next-slide').addEventListener('click', () => { if (activeSlide < projects[activeProject].slides.length - 1) { activeSlide++; updateSlide(); } });
  el('#next-project').addEventListener('click', () => openProject((activeProject + 1) % projects.length));
  [el('#index-open'), el('#archive-open')].forEach(button => button.addEventListener('click', () => showDialog(indexDialog)));
  [projectDialog, indexDialog].forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (!projectDialog.open && !indexDialog.open) document.body.classList.remove('modal-open');
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });
  projectDialog.addEventListener('keydown', event => {
    if (event.target.closest('input, textarea, select, [contenteditable], #type-lab, #lettering-showcase')) return;
    if (event.key === 'ArrowLeft' && activeSlide > 0) { event.preventDefault(); activeSlide--; updateSlide(); }
    if (event.key === 'ArrowRight' && activeSlide < projects[activeProject].slides.length - 1) { event.preventDefault(); activeSlide++; updateSlide(); }
  });
  el('#year').textContent = new Date().getFullYear();
  setLanguage(language);

  // A point-cloud torus: original, browser-rendered artwork with no external dependency.
  const canvas = el('#particle-art');
  const ctx = canvas.getContext('2d');
  if (!ctx) { el('#motion-toggle').hidden = true; return; }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches, visible = true, width = 0, height = 0;
  let time = 0, previousTime = 0, frame = null, pointerX = 0, pointerY = 0;
  const points = [];
  let seed = 74;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 6200; i++) {
    const u = random() * Math.PI * 2, v = random() * Math.PI * 2;
    const r = .45 + .11 * Math.cos(u * 3);
    const radius = 1.03 + r * Math.cos(v);
    points.push({x:radius * Math.cos(u), y:radius * Math.sin(u), z:r * Math.sin(v) + .24 * Math.sin(u * 3), size:.35 + random() * .85});
  }
  function resize() {
    const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); draw();
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const ax = -.7 + pointerY * .25, ay = time * .16 + pointerX * .35, az = -.4;
    const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay), cz = Math.cos(az), sz = Math.sin(az);
    const scale = Math.min(width * .22, height * .24);
    const projected = points.map(p => {
      const y = p.y * cx - p.z * sx, z = p.y * sx + p.z * cx;
      const x = p.x * cy + z * sy, depth = -p.x * sy + z * cy;
      return {x:x * cz - y * sz, y:x * sz + y * cz, z:depth, size:p.size};
    }).sort((a, b) => a.z - b.z);
    for (const p of projected) {
      const perspective = 4.5 / (4.5 - p.z);
      const opacity = .20 + ((p.z + 1.8) / 3.6) * .68;
      ctx.fillStyle = `rgba(23,25,23,${opacity.toFixed(2)})`;
      const size = p.size * perspective * 1.35;
      ctx.fillRect(width * .49 + p.x * scale * perspective, height * .44 + p.y * scale * perspective, size, size);
    }
    ctx.strokeStyle = '#626951';ctx.lineWidth = .65;
    const ox = width * .49, oy = height * .44;
    ctx.beginPath();ctx.moveTo(ox - 8, oy);ctx.lineTo(ox + 8, oy);ctx.moveTo(ox, oy - 8);ctx.lineTo(ox, oy + 8);ctx.stroke();
  }
  function tick(now) {
    frame = null;
    if (paused || !visible || document.hidden) return;
    if (now - previousTime >= 32) { time += Math.min((now - previousTime) / 1000, .06); previousTime = now; draw(); }
    frame = requestAnimationFrame(tick);
  }
  function syncMotion() {
    el('#motion-toggle').setAttribute('aria-pressed', String(paused));
    el('#motion-toggle').textContent = text(paused ? 'play' : 'pause');
    el('#motion-toggle').setAttribute('aria-label', text(paused ? 'playLabel' : 'pauseLabel'));
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; previousTime = performance.now();
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  canvas.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    const rect = canvas.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / width - .5; pointerY = (event.clientY - rect.top) / height - .5;
    if (paused) draw();
  });
  canvas.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; if (paused) draw(); });
  el('#motion-toggle').addEventListener('click', () => { paused = !paused; syncMotion(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  document.addEventListener('portfolio-language-change', syncMotion);
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncMotion(); }).observe(canvas);
  resize(); syncMotion();
})();
