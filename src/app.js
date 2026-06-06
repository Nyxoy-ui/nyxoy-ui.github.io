const STORAGE_KEY = 'nyxoy-story-pwa-state-v1';

const seedState = {
  theme: {
    accent: '#7c3aed',
    secondary: '#06b6d4',
    readerFont: 'Merriweather',
    uiFont: 'Inter',
    radius: 24,
  },
  currentUserId: null,
  users: [
    { id: 'admin-1', role: 'admin', name: 'Admin Nyx', email: 'admin@nyxoy.io', password: 'admin123', status: 'aktiv' },
    { id: 'author-1', role: 'author', name: 'Mira Stern', email: 'mira@nyxoy.io', password: 'author123', status: 'aktiv' },
    { id: 'reader-1', role: 'reader', name: 'Lina Leserin', email: 'lina@nyxoy.io', password: 'reader123', status: 'aktiv' },
  ],
  books: [
    {
      id: 'book-1',
      authorId: 'author-1',
      title: 'Die Stadt aus Mitternacht',
      genre: 'Urban Fantasy',
      status: 'Veröffentlicht',
      cover: 'linear-gradient(145deg, #111827, #7c3aed 52%, #f472b6)',
      font: 'Merriweather',
      blurb: 'Eine junge Kartenzeichnerin entdeckt Türen, die nur im Mondlicht erscheinen.',
      chapters: [
        {
          id: 'chapter-1',
          title: 'Kapitel 1: Die erste Tür',
          content: [
            { type: 'paragraph', text: 'Nora zeichnete die Stadt jede Nacht neu, weil sich Gassen und Brücken bewegten, sobald die Turmuhr Mitternacht schlug.' },
            { type: 'question', id: 'q1', prompt: 'Was würdest du tun, wenn deine Stadt sich jede Nacht verändert?', options: ['Eine Karte zeichnen', 'Zuhause bleiben', 'Die Polizei rufen'], answer: 'Eine Karte zeichnen' },
            { type: 'paragraph', text: 'Zwischen zwei Regenrinnen glühte plötzlich eine Tür. Sie war so schmal wie ein Atemzug und doch passte Noras ganze Neugier hindurch.' },
            { type: 'question', id: 'q2', prompt: 'Welche Stimmung erzeugt die glühende Tür?', options: ['Geheimnisvoll', 'Langweilig', 'Alltäglich'], answer: 'Geheimnisvoll' },
          ],
        },
        {
          id: 'chapter-2',
          title: 'Kapitel 2: Das Archiv der Stimmen',
          content: [
            { type: 'paragraph', text: 'Hinter der Tür lag ein Archiv voller Flüstern. Jede Schublade bewahrte eine Entscheidung, die jemand nie getroffen hatte.' },
            { type: 'question', id: 'q3', prompt: 'Welche Entscheidung soll Nora zuerst untersuchen?', options: ['Ihre eigene', 'Die des Bürgermeisters', 'Eine zufällige'], answer: 'Ihre eigene' },
            { type: 'paragraph', text: 'Als Nora ihre Schublade öffnete, fiel eine Feder heraus, dunkler als Tinte und leichter als ein Versprechen.' },
          ],
        },
      ],
    },
  ],
  answers: {},
};

let state = loadState();
let route = { view: 'home', bookId: null, chapterId: null };

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...seedState, ...saved } : structuredClone(seedState);
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || null;
}

function byId(id) {
  return document.getElementById(id);
}

function uid(prefix) {
  return `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
}

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }
}

function setThemeVars() {
  document.documentElement.style.setProperty('--accent', state.theme.accent);
  document.documentElement.style.setProperty('--secondary', state.theme.secondary);
  document.documentElement.style.setProperty('--radius', `${state.theme.radius}px`);
  document.documentElement.style.setProperty('--ui-font', `${state.theme.uiFont}, system-ui, sans-serif`);
  document.documentElement.style.setProperty('--reader-font', `${state.theme.readerFont}, Georgia, serif`);
}

function navigate(view, params = {}) {
  route = { view, bookId: params.bookId || null, chapterId: params.chapterId || null };
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function login(email, password) {
  const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password && item.status === 'aktiv');
  if (!user) return false;
  state.currentUserId = user.id;
  saveState();
  navigate(user.role === 'admin' ? 'admin' : user.role === 'author' ? 'studio' : 'library');
  return true;
}

function logout() {
  state.currentUserId = null;
  saveState();
  navigate('home');
}

function nav() {
  const user = currentUser();
  return `
    <header class="topbar">
      <button class="brand" data-nav="home" aria-label="Startseite öffnen">
        <span class="brand-mark">N</span>
        <span><strong>Nyxoy Stories</strong><small>PWA Story Studio</small></span>
      </button>
      <nav class="nav-links" aria-label="Hauptnavigation">
        <button data-nav="library">Bibliothek</button>
        ${user?.role === 'author' ? '<button data-nav="studio">Autor-Studio</button>' : ''}
        ${user?.role === 'admin' ? '<button data-nav="admin">Admin</button>' : ''}
        <button data-nav="design">Design</button>
      </nav>
      <div class="session">
        ${user ? `<span class="pill">${escapeHtml(user.name)} · ${roleLabel(user.role)}</span><button class="ghost" id="logout">Logout</button>` : '<button class="primary" data-nav="login">Login</button>'}
      </div>
    </header>`;
}

function roleLabel(role) {
  return { admin: 'Admin', author: 'Autor', reader: 'Leser' }[role] || role;
}

function layout(content) {
  setThemeVars();
  byId('app').innerHTML = `${nav()}<main>${content}</main><footer>Installierbar als PWA auf Android, iOS und Desktop · Offlinefähig nach dem ersten Laden</footer>`;
  bindGlobalEvents();
}

function render() {
  const map = {
    home: renderHome,
    login: renderLogin,
    library: renderLibrary,
    reader: renderReader,
    studio: renderStudio,
    admin: renderAdmin,
    design: renderDesign,
  };
  (map[route.view] || renderHome)();
}

function renderHome() {
  layout(`
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Wattpad-inspiriert · interaktiv · plattformübergreifend</span>
        <h1>Eine schöne PWA für Geschichten, Kapitel und Fragen mitten im Lesefluss.</h1>
        <p>Leser stöbern in einer Cover-Bibliothek, beantworten eingebettete Fragen, Autoren verwalten eigene Bücher und Admins behalten die komplette Nutzerkontrolle.</p>
        <div class="hero-actions">
          <button class="primary" data-nav="library">Bibliothek entdecken</button>
          <button class="glass" data-nav="login">Demo-Login testen</button>
        </div>
      </div>
      <aside class="phone-preview" aria-label="App Vorschau">
        <div class="notch"></div>
        <div class="mini-cover"></div>
        <h3>Die Stadt aus Mitternacht</h3>
        <p>Direkt im Kapitel erscheint eine Frage, ohne den Textfluss zu verlassen.</p>
        <div class="inline-question">Was würdest du tun?<button>Antwort wählen</button></div>
      </aside>
    </section>
    <section class="feature-grid">
      ${feature('Rollen & Rechte', 'Admin-, Autor- und Leser-Logins mit klaren Berechtigungen.')}
      ${feature('Autor-Studio', 'Autoren schreiben und bearbeiten ausschließlich ihre eigenen Bücher.')}
      ${feature('In-Text-Fragen', 'Fragen sind als Karten direkt zwischen Absätzen eingebettet.')}
      ${feature('Anpassbares Design', 'Schriftarten, Akzentfarben und Cover-Looks lassen sich konfigurieren.')}
    </section>`);
}

function feature(title, text) {
  return `<article class="feature"><h3>${title}</h3><p>${text}</p></article>`;
}

function renderLogin() {
  layout(`
    <section class="panel narrow">
      <span class="eyebrow">Demo-Zugänge</span>
      <h2>Einloggen</h2>
      <form id="login-form" class="stack">
        <label>E-Mail<input name="email" type="email" value="admin@nyxoy.io" autocomplete="email" required /></label>
        <label>Passwort<input name="password" type="password" value="admin123" autocomplete="current-password" required /></label>
        <button class="primary" type="submit">Login</button>
        <p id="login-error" class="error" role="alert"></p>
      </form>
      <div class="demo-logins">
        <button data-demo="admin@nyxoy.io|admin123">Admin</button>
        <button data-demo="mira@nyxoy.io|author123">Autor</button>
        <button data-demo="lina@nyxoy.io|reader123">Leser</button>
      </div>
    </section>`);
  byId('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (!login(form.get('email'), form.get('password'))) byId('login-error').textContent = 'Login fehlgeschlagen oder Konto deaktiviert.';
  });
  document.querySelectorAll('[data-demo]').forEach((button) => button.addEventListener('click', () => {
    const [email, password] = button.dataset.demo.split('|');
    document.querySelector('[name="email"]').value = email;
    document.querySelector('[name="password"]').value = password;
  }));
}

function renderLibrary() {
  layout(`
    <section class="section-heading"><span class="eyebrow">Bibliothek</span><h2>Stöbere durch Geschichten</h2><p>Cover, Genre und Schriftstil sind sichtbar wie in einer modernen Story-App.</p></section>
    <section class="book-grid">
      ${state.books.map((book) => `
        <article class="book-card">
          <div class="cover" style="background:${escapeHtml(book.cover)}"><span>${escapeHtml(book.genre)}</span></div>
          <div class="book-meta">
            <h3>${escapeHtml(book.title)}</h3>
            <p>${escapeHtml(book.blurb)}</p>
            <small>${escapeHtml(authorName(book.authorId))} · ${book.chapters.length} Kapitel · ${escapeHtml(book.status)}</small>
            <button class="primary" data-read-book="${book.id}">Lesen</button>
          </div>
        </article>`).join('')}
    </section>`);
  document.querySelectorAll('[data-read-book]').forEach((button) => button.addEventListener('click', () => {
    const book = state.books.find((item) => item.id === button.dataset.readBook);
    navigate('reader', { bookId: book.id, chapterId: book.chapters[0]?.id });
  }));
}

function authorName(authorId) {
  return state.users.find((user) => user.id === authorId)?.name || 'Unbekannt';
}

function renderReader() {
  const book = state.books.find((item) => item.id === route.bookId) || state.books[0];
  const chapter = book?.chapters.find((item) => item.id === route.chapterId) || book?.chapters[0];
  if (!book || !chapter) return renderLibrary();
  layout(`
    <section class="reader-shell">
      <aside class="chapter-list">
        <div class="cover small" style="background:${escapeHtml(book.cover)}"></div>
        <h3>${escapeHtml(book.title)}</h3>
        ${book.chapters.map((item) => `<button class="chapter-tab ${item.id === chapter.id ? 'active' : ''}" data-chapter="${item.id}">${escapeHtml(item.title)}</button>`).join('')}
      </aside>
      <article class="chapter" style="font-family:${escapeHtml(book.font)}, Georgia, serif">
        <span class="eyebrow">${escapeHtml(book.genre)} · ${escapeHtml(authorName(book.authorId))}</span>
        <h1>${escapeHtml(chapter.title)}</h1>
        ${chapter.content.map((block) => renderContentBlock(book.id, chapter.id, block)).join('')}
      </article>
    </section>`);
  document.querySelectorAll('[data-chapter]').forEach((button) => button.addEventListener('click', () => navigate('reader', { bookId: book.id, chapterId: button.dataset.chapter })));
  document.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.answerKey;
    state.answers[key] = button.dataset.answer;
    saveState();
    renderReader();
  }));
}

function renderContentBlock(bookId, chapterId, block) {
  if (block.type === 'paragraph') return `<p>${escapeHtml(block.text)}</p>`;
  const key = `${bookId}:${chapterId}:${block.id}`;
  const selected = state.answers[key];
  return `<section class="question-card">
    <strong>${escapeHtml(block.prompt)}</strong>
    <div class="answer-row">${block.options.map((option) => `<button class="answer ${selected === option ? 'selected' : ''}" data-answer-key="${key}" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('')}</div>
    ${selected ? `<small>${selected === block.answer ? 'Richtig beantwortet.' : 'Antwort gespeichert.'} Deine Wahl: ${escapeHtml(selected)}</small>` : '<small>Wähle eine Antwort, um weiter zu reflektieren.</small>'}
  </section>`;
}

function renderStudio() {
  const user = currentUser();
  if (!user || user.role !== 'author') return renderLogin();
  const myBooks = state.books.filter((book) => book.authorId === user.id);
  layout(`
    <section class="section-heading"><span class="eyebrow">Autor-Studio</span><h2>Eigene Bücher schreiben und bearbeiten</h2><p>Autoren sehen nur Werke, deren authorId ihrem Login entspricht.</p></section>
    <section class="dashboard">
      <form id="book-form" class="panel stack">
        <h3>Neues Buch</h3>
        <label>Titel<input name="title" required placeholder="Titel deiner Geschichte" /></label>
        <label>Genre<input name="genre" required placeholder="Fantasy, Romance, Thriller..." /></label>
        <label>Cover-Verlauf<input name="cover" value="linear-gradient(145deg, #0f172a, #7c3aed, #06b6d4)" /></label>
        <label>Schriftart<input name="font" value="Merriweather" /></label>
        <label>Klappentext<textarea name="blurb" required></textarea></label>
        <button class="primary">Buch anlegen</button>
      </form>
      <div class="stack">${myBooks.map((book) => studioBook(book)).join('') || '<p class="empty">Noch keine Bücher.</p>'}</div>
    </section>`);
  byId('book-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    state.books.push({ id: uid('book'), authorId: user.id, title: form.title, genre: form.genre, cover: form.cover, font: form.font, blurb: form.blurb, status: 'Entwurf', chapters: [{ id: uid('chapter'), title: 'Kapitel 1', content: [{ type: 'paragraph', text: 'Beginne hier mit deiner Geschichte.' }] }] });
    saveState();
    renderStudio();
  });
  bindStudioForms();
}

function studioBook(book) {
  return `<article class="panel studio-book">
    <form data-edit-book="${book.id}" class="stack">
      <h3>${escapeHtml(book.title)}</h3>
      <label>Titel<input name="title" value="${escapeHtml(book.title)}" /></label>
      <label>Klappentext<textarea name="blurb">${escapeHtml(book.blurb)}</textarea></label>
      <label>Status<select name="status"><option ${book.status === 'Entwurf' ? 'selected' : ''}>Entwurf</option><option ${book.status === 'Veröffentlicht' ? 'selected' : ''}>Veröffentlicht</option></select></label>
      <button>Änderungen speichern</button>
    </form>
    <form data-add-question="${book.id}" class="stack subtle-form">
      <h4>Frage in letztes Kapitel einfügen</h4>
      <input name="prompt" placeholder="Frage im Textfluss" required />
      <input name="options" placeholder="Optionen kommagetrennt" required />
      <input name="answer" placeholder="Richtige/gewünschte Antwort" required />
      <button class="ghost">Frage einfügen</button>
    </form>
  </article>`;
}

function bindStudioForms() {
  document.querySelectorAll('[data-edit-book]').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    const book = state.books.find((item) => item.id === form.dataset.editBook && item.authorId === currentUser().id);
    if (!book) return;
    const data = Object.fromEntries(new FormData(form));
    Object.assign(book, data);
    saveState();
    renderStudio();
  }));
  document.querySelectorAll('[data-add-question]').forEach((form) => form.addEventListener('submit', (event) => {
    event.preventDefault();
    const book = state.books.find((item) => item.id === form.dataset.addQuestion && item.authorId === currentUser().id);
    if (!book) return;
    const data = Object.fromEntries(new FormData(form));
    const chapter = book.chapters.at(-1);
    chapter.content.push({ type: 'question', id: uid('q'), prompt: data.prompt, options: data.options.split(',').map((item) => item.trim()).filter(Boolean), answer: data.answer });
    saveState();
    renderStudio();
  }));
}

function renderAdmin() {
  const user = currentUser();
  if (!user || user.role !== 'admin') return renderLogin();
  layout(`
    <section class="section-heading"><span class="eyebrow">Admin Control</span><h2>Nutzerverwaltung mit voller Kontrolle</h2><p>Admins legen Autoren an, deaktivieren Konten und behalten den Überblick über Rollen.</p></section>
    <section class="dashboard">
      <form id="author-form" class="panel stack">
        <h3>Neuen Autor anlegen</h3>
        <label>Name<input name="name" required /></label>
        <label>E-Mail<input name="email" type="email" required /></label>
        <label>Initiales Passwort<input name="password" value="author123" required /></label>
        <button class="primary">Autor erstellen</button>
      </form>
      <div class="panel"><h3>Alle Nutzer</h3><div class="user-list">${state.users.map((item) => `<div class="user-row"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.email)} · ${roleLabel(item.role)}</small></span><button data-toggle-user="${item.id}" ${item.id === user.id ? 'disabled' : ''}>${item.status === 'aktiv' ? 'Deaktivieren' : 'Aktivieren'}</button></div>`).join('')}</div></div>
    </section>`);
  byId('author-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    state.users.push({ id: uid('author'), role: 'author', status: 'aktiv', ...data });
    saveState();
    renderAdmin();
  });
  document.querySelectorAll('[data-toggle-user]').forEach((button) => button.addEventListener('click', () => {
    const target = state.users.find((item) => item.id === button.dataset.toggleUser);
    if (target) target.status = target.status === 'aktiv' ? 'deaktiviert' : 'aktiv';
    saveState();
    renderAdmin();
  }));
}

function renderDesign() {
  layout(`
    <section class="panel narrow">
      <span class="eyebrow">Design-System</span><h2>Look & Feel anpassen</h2>
      <form id="theme-form" class="stack">
        <label>Akzentfarbe<input name="accent" type="color" value="${state.theme.accent}" /></label>
        <label>Sekundärfarbe<input name="secondary" type="color" value="${state.theme.secondary}" /></label>
        <label>UI-Schrift<input name="uiFont" value="${escapeHtml(state.theme.uiFont)}" /></label>
        <label>Leseschrift<input name="readerFont" value="${escapeHtml(state.theme.readerFont)}" /></label>
        <label>Rundung<input name="radius" type="range" min="8" max="36" value="${state.theme.radius}" /></label>
        <button class="primary">Design speichern</button>
      </form>
    </section>`);
  byId('theme-form').addEventListener('submit', (event) => {
    event.preventDefault();
    state.theme = { ...state.theme, ...Object.fromEntries(new FormData(event.currentTarget)) };
    state.theme.radius = Number(state.theme.radius);
    saveState();
    renderDesign();
  });
}

function bindGlobalEvents() {
  document.querySelectorAll('[data-nav]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.nav)));
  byId('logout')?.addEventListener('click', logout);
}

registerServiceWorker();
render();
