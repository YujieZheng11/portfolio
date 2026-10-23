(() => {
  'use strict';
  const root = document.querySelector('#lettering-showcase');
  const studies = window.PORTFOLIO_LETTERING;
  const state = { active: 0, pinned: null, dark: false };
  const find = selector => root.querySelector(selector);
  const number = index => String(index + 1).padStart(2, '0');
  let labels, language;

  function fillPanel(imageSelector, labelSelector, index) {
    const study = studies[index];
    const image = find(imageSelector);
    image.src = `assets/lettering/${study.file}`;
    image.alt = `Bussey Building — ${study[language]}`;
    image.width = study.width;
    image.height = study.height;
    find(labelSelector).textContent = `${number(index)} / ${study[language]}`;
  }

  function update() {
    const comparing = state.pinned !== null;
    fillPanel('#lettering-current-image', '#lettering-current-label', state.active);
    find('#lettering-current-role').textContent = comparing ? labels.comparison : labels.current;
    find('#lettering-pinned-panel').hidden = !comparing;
    if (comparing) fillPanel('#lettering-pinned-image', '#lettering-pinned-label', state.pinned);
    const stage = find('#lettering-stage');
    stage.classList.toggle('is-compare', comparing);
    stage.classList.toggle('is-dark', state.dark);
    find('#lettering-position').textContent = `${number(state.active)} / ${String(studies.length).padStart(2, '0')}`;
    find('#lettering-pin').textContent = comparing ? labels.unpin : labels.pin;
    find('#lettering-pin').setAttribute('aria-pressed', String(comparing));
    find('#lettering-invert').setAttribute('aria-pressed', String(state.dark));
    root.querySelectorAll('[data-lettering]').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === state.active));
      button.classList.toggle('is-pinned', index === state.pinned);
      button.querySelector('.lettering-pin-mark').hidden = index !== state.pinned;
    });
  }

  function select(index, reveal = false) {
    state.active = (index + studies.length) % studies.length;
    update();
    if (reveal) {
      const strip = find('#lettering-options');
      const button = strip.querySelector(`[data-lettering="${state.active}"]`);
      const left = button.offsetLeft;
      if (left < strip.scrollLeft) strip.scrollLeft = left;
      if (left + button.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = left + button.offsetWidth - strip.clientWidth;
    }
  }

  function render(nextLanguage) {
    language = nextLanguage;
    labels = window.PORTFOLIO_LETTERING_LABELS[language];
    root.innerHTML = `
      <div class="lettering-heading"><p class="mono">${labels.eyebrow}</p><h3>${labels.heading}</h3><p>${labels.intro}</p></div>
      <div id="lettering-stage" class="lettering-stage" role="group" tabindex="0" aria-label="${labels.keyboard}">
        <figure id="lettering-pinned-panel" hidden><figcaption class="mono"><span>${labels.pinned}</span><span id="lettering-pinned-label"></span></figcaption><div class="lettering-art"><img id="lettering-pinned-image" alt="" draggable="false"></div></figure>
        <figure><figcaption class="mono"><span id="lettering-current-role"></span><span id="lettering-current-label" aria-live="polite"></span></figcaption><div class="lettering-art"><img id="lettering-current-image" alt="" draggable="false"></div></figure>
      </div>
      <div class="lettering-toolbar"><div class="lettering-navigation"><button id="lettering-prev" type="button" aria-label="${labels.previous}">←</button><span id="lettering-position" class="mono"></span><button id="lettering-next" type="button" aria-label="${labels.next}">→</button></div><div class="lettering-actions"><button id="lettering-pin" type="button" aria-pressed="false">${labels.pin}</button><button id="lettering-invert" type="button" aria-pressed="false">${labels.invert}</button></div></div>
      <div class="lettering-strip-label mono"><span>${labels.strip}</span><span>${labels.swipe}</span></div>
      <div id="lettering-options" class="lettering-options" role="group" aria-label="${labels.choose}"></div>`;
    for (const [index, study] of studies.entries()) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.lettering = index;
      button.setAttribute('aria-label', `${labels.choose} ${number(index)} / ${study[language]}`);
      button.innerHTML = `<span class="lettering-option-meta mono"><span>${number(index)}</span><span>${study[language]}</span></span><img src="assets/lettering/${study.file}" width="${study.width}" height="${study.height}" alt="" draggable="false"><span class="lettering-pin-mark mono" hidden aria-hidden="true">A</span>`;
      button.addEventListener('click', () => select(index));
      find('#lettering-options').append(button);
    }
    find('#lettering-prev').addEventListener('click', () => select(state.active - 1, true));
    find('#lettering-next').addEventListener('click', () => select(state.active + 1, true));
    find('#lettering-pin').addEventListener('click', () => {
      if (state.pinned === null) {
        state.pinned = state.active;
        select(state.active + 1, true);
      } else { state.pinned = null; update(); }
    });
    find('#lettering-invert').addEventListener('click', () => { state.dark = !state.dark; update(); });
    root.onkeydown = event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault(); event.stopPropagation();
        select(state.active + (event.key === 'ArrowRight' ? 1 : -1), true);
      }
    };
    update();
  }

  window.PORTFOLIO_LETTERING_SHOWCASE = { render };
})();
