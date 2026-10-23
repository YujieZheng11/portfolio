(() => {
  'use strict';
  const root = document.querySelector('#type-lab');
  const face = window.PORTFOLIO_TYPEFACE;
  const state = { value: 'Space to play.', size: matchMedia('(max-width: 650px)').matches ? 56 : 88, spacing: 4, dark: false, guides: true, selected: 'A', sample: 0 };
  const phrases = ['Space to play.', 'Hello, London!', 'BUILDING LETTERS', 'Form & feeling', 'A little curiosity'];
  const find = selector => root.querySelector(selector);
  let labels;

  function glyph(char) {
    const data = face.glyphs[char];
    if (!data) return null;
    const img = document.createElement('img');
    img.src = `assets/type-glyphs/${data.file}`;
    img.alt = '';
    img.draggable = false;
    img.className = 'specimen-glyph';
    img.style.width = `${data.width / face.capHeight}em`;
    img.style.height = `${face.height / face.capHeight}em`;
    return img;
  }

  function updateComposition() {
    const output = find('#type-output');
    const fragment = document.createDocumentFragment();
    const unsupported = new Set();
    for (const word of state.value.split(/(\s+)/)) {
      if (!word) continue;
      const group = document.createElement('span');
      group.className = /^\s+$/.test(word) ? 'specimen-space' : 'specimen-word';
      if (!/^\s+$/.test(word)) {
        for (const char of word) {
          // Straight quotes use the equivalent punctuation in the supplied board.
          const original = char === '"' ? '“' : char === "'" ? '’' : char;
          let letter = glyph(original);
          if (!letter) {
            letter = document.createElement('span');
            letter.className = 'specimen-unsupported';
            letter.textContent = char;
            unsupported.add(char);
          }
          group.append(letter);
        }
      }
      fragment.append(group);
    }
    output.replaceChildren(fragment);
    output.setAttribute('aria-label', state.value || labels.empty);
    output.classList.toggle('is-empty', !state.value.trim());
    if (!state.value.trim()) {
      const empty = document.createElement('span');
      empty.className = 'specimen-empty';
      empty.textContent = labels.empty;
      output.replaceChildren(empty);
    }
    root.style.setProperty('--specimen-size', `${state.size}px`);
    root.style.setProperty('--specimen-spacing', `${state.spacing}px`);
    find('#type-size-value').textContent = `${state.size} ${labels.unit}`;
    find('#type-spacing-value').textContent = `${state.spacing} ${labels.unit}`;
    find('#type-supported').textContent = unsupported.size ? `${labels.unsupported} ${[...unsupported].join(' ')}` : labels.source;
    const stage = find('.specimen-stage');
    stage.classList.toggle('is-dark', state.dark);
    stage.classList.toggle('has-guides', state.guides);
    find('#type-paper').setAttribute('aria-pressed', String(state.dark));
    find('#type-guides').setAttribute('aria-pressed', String(state.guides));
  }

  function inspectLetter() {
    const pair = state.selected + state.selected.toLowerCase();
    const display = find('#type-letter-display');
    display.replaceChildren(...[...pair].map(glyph));
    display.setAttribute('aria-label', pair);
    find('#type-letter-name').textContent = `${state.selected} / ${state.selected.toLowerCase()}`;
    root.querySelectorAll('[data-glyph]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.glyph === state.selected)));
  }

  function render(language) {
    labels = window.PORTFOLIO_TYPE_LABELS[language];
    root.innerHTML = `
      <div class="specimen-heading"><div><p class="mono">${labels.eyebrow}</p><h3>${labels.heading}</h3></div><span class="specimen-mark" aria-hidden="true">Aa ↗</span></div>
      <div class="specimen-input-row"><label for="type-input">${labels.input}</label><input id="type-input" type="text" lang="en" maxlength="60" autocomplete="off" spellcheck="false" placeholder="${labels.placeholder}"><button id="type-sample" type="button" class="mono">${labels.sample}</button></div>
      <div class="specimen-stage has-guides">
        <div class="specimen-stage-meta mono"><span>${labels.stage}</span><span aria-hidden="true">01 / Aa — Zz</span></div>
        <div id="type-output" class="specimen-output" role="img" lang="en"></div>
        <div class="specimen-stage-foot mono"><span>${labels.original}</span><span aria-hidden="true">YZ / TYPE STUDY</span></div>
      </div>
      <div class="specimen-controls">
        <label for="type-size"><span>${labels.size}<output id="type-size-value" for="type-size"></output></span><input id="type-size" type="range" min="36" max="128" step="1"></label>
        <label for="type-spacing"><span>${labels.spacing}<output id="type-spacing-value" for="type-spacing"></output></span><input id="type-spacing" type="range" min="-2" max="18" step="1"></label>
        <div class="specimen-toggles"><button id="type-paper" type="button" aria-pressed="false">${labels.paper}</button><button id="type-guides" type="button" aria-pressed="true">${labels.guides}</button></div>
      </div>
      <p id="type-supported" class="specimen-note" aria-live="polite"></p>
      <div class="specimen-inspector">
        <div class="specimen-letter-panel"><div id="type-letter-display" role="img" class="specimen-letter-display"></div><span id="type-letter-name" class="mono"></span></div>
        <div class="specimen-alphabet"><p class="mono">${labels.inspector}</p><p>${labels.pick}</p><div id="type-alphabet" role="group" aria-label="${labels.inspector}"></div></div>
      </div>`;
    find('#type-input').value = state.value;
    find('#type-size').value = state.size;
    find('#type-spacing').value = state.spacing;
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.glyph = letter;
      button.textContent = letter;
      button.setAttribute('aria-label', `${labels.letter} ${letter} / ${letter.toLowerCase()}`);
      button.addEventListener('click', () => { state.selected = letter; inspectLetter(); });
      find('#type-alphabet').append(button);
    }
    find('#type-input').addEventListener('input', event => { state.value = event.target.value; updateComposition(); });
    find('#type-size').addEventListener('input', event => { state.size = Number(event.target.value); updateComposition(); });
    find('#type-spacing').addEventListener('input', event => { state.spacing = Number(event.target.value); updateComposition(); });
    find('#type-sample').addEventListener('click', () => {
      state.sample = (state.sample + 1) % phrases.length;
      state.value = phrases[state.sample];
      find('#type-input').value = state.value;
      updateComposition();
    });
    find('#type-paper').addEventListener('click', () => { state.dark = !state.dark; updateComposition(); });
    find('#type-guides').addEventListener('click', () => { state.guides = !state.guides; updateComposition(); });
    updateComposition();
    inspectLetter();
  }

  window.PORTFOLIO_TYPE_LAB = { render };
})();
