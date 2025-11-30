const root = document.documentElement;
const toggle = document.getElementById('themeToggle');

function setTheme(mode) {
  root.setAttribute('data-theme', mode);
  toggle.setAttribute('data-mode', mode);
  localStorage.setItem('theme', mode);
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  setTheme(saved || preferred);
})();

toggle?.addEventListener('click', () => {
  setTheme(toggle.getAttribute('data-mode') === 'dark' ? 'light' : 'dark');
});

toggle?.addEventListener('keyup', (e) => {
  if (e.key === 'Enter' || e.key === ' ') toggle.click();
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      io.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

function statBlock(label, value) {
  const stat = document.createElement('div');
  stat.className = 'stat-card';

  const statLabel = document.createElement('span');
  statLabel.className = 'stat-label';
  statLabel.textContent = label;

  const statValue = document.createElement('span');
  statValue.className = 'stat-value';
  statValue.textContent = value;

  stat.appendChild(statLabel);
  stat.appendChild(statValue);
  return stat;
}

function cardEl(data) {
  const article = document.createElement('article');
  article.className = 'community-card';
  article.style.setProperty('--accent-local', data.colors?.[0] || 'var(--accent)');

  const grid = document.createElement('div');
  grid.className = 'card-grid';

  const logo = document.createElement('div');
  logo.className = 'logo';
  if (data.logoImage) {
    const img = document.createElement('img');
    img.src = data.logoImage;
    img.alt = `${data.name} logo`;
    logo.appendChild(img);
  } else {
    const span = document.createElement('span');
    span.textContent = (data.name || '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    logo.appendChild(span);
  }

  const body = document.createElement('div');
  body.className = 'card-body';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = data.name;
  body.appendChild(title);

  if (data.description) {
    const desc = document.createElement('p');
    desc.className = 'card-desc';
    desc.textContent = data.description;
    body.appendChild(desc);
  }

  const pulseRow = document.createElement('div');
  pulseRow.className = 'pulse-row';
  const vibe = document.createElement('span');
  vibe.className = 'pulse';
  vibe.textContent = 'Live Node';
  pulseRow.appendChild(vibe);
  if (data.platforms?.length) {
    const platformPulse = document.createElement('span');
    platformPulse.className = 'pulse';
    platformPulse.textContent = data.platforms[0].name;
    pulseRow.appendChild(platformPulse);
  }
  body.appendChild(pulseRow);

  const statsRow = document.createElement('div');
  statsRow.className = 'stat-grid';

  const members = Number(data.membersCount || 0).toLocaleString();
  statsRow.appendChild(statBlock('Members', members));

  const monthlyCost = typeof data.membershipCost === 'string' ? data.membershipCost : data.membershipCost?.monthly;
  if (monthlyCost) statsRow.appendChild(statBlock('Monthly', monthlyCost));

  if (data.foundedDate) {
    const year = new Date(data.foundedDate).getFullYear();
    statsRow.appendChild(statBlock('Founded', year));
  }
  body.appendChild(statsRow);

  const metaRow = document.createElement('div');
  metaRow.className = 'meta-row';

  if (data.founderName || data.founderImage) {
    const founder = document.createElement('div');
    founder.className = 'founder-chip';

    if (data.founderImage) {
      const img = document.createElement('img');
      img.src = data.founderImage;
      img.alt = `${data.founderName || 'Founder'} photo`;
      img.className = 'founder-img';
      founder.appendChild(img);
    }

    const info = document.createElement('div');
    info.className = 'founder-info';
    const label = document.createElement('span');
    label.className = 'founder-label';
    label.textContent = 'Founder';
    const name = document.createElement('span');
    name.className = 'founder-name';
    name.textContent = data.founderName || '';

    info.appendChild(label);
    info.appendChild(name);
    founder.appendChild(info);
    metaRow.appendChild(founder);
  }

  const actionWrap = document.createElement('div');
  actionWrap.className = 'pulse-row';

  const primaryPlatform = data.platforms?.[0];
  if (primaryPlatform) {
    const platformLink = document.createElement('a');
    platformLink.className = 'platform-pill';
    platformLink.href = primaryPlatform.url || '#';
    if (platformLink.href !== '#') {
      platformLink.target = '_blank';
      platformLink.rel = 'noopener noreferrer';
    }

    if (primaryPlatform.icon) {
      const icon = document.createElement('span');
      icon.className = 'platform-icon';
      const iconImg = document.createElement('img');
      iconImg.src = primaryPlatform.icon;
      iconImg.alt = `${primaryPlatform.name} icon`;
      icon.appendChild(iconImg);
      platformLink.appendChild(icon);
    }

    const label = document.createElement('span');
    label.textContent = primaryPlatform.name;
    platformLink.appendChild(label);
    actionWrap.appendChild(platformLink);
  }

  const cta = document.createElement('a');
  const ctaHref = data.communityUrl || primaryPlatform?.url || '#';
  cta.className = 'cta';
  cta.href = ctaHref;
  cta.textContent = 'Launch Portal →';
  if (ctaHref && ctaHref !== '#') {
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
  }
  actionWrap.appendChild(cta);

  metaRow.appendChild(actionWrap);
  body.appendChild(metaRow);

  grid.appendChild(logo);
  grid.appendChild(body);
  article.appendChild(grid);

  article.addEventListener('pointermove', (e) => {
    const r = article.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    article.style.setProperty('--mx', `${x}%`);
    article.style.setProperty('--my', `${y}%`);
  });

  return article;
}

async function render() {
  const mount = document.getElementById('cards');
  if (!mount) return;
  mount.innerHTML = '';
  try {
    const res = await fetch('data/communities.json', { cache: 'no-cache' });
    const items = await res.json();
    items.forEach((item, i) => {
      const el = cardEl(item);
      el.style.animationDelay = `${i * 0.12}s`;
      mount.appendChild(el);
      io.observe(el);
    });
  } catch (err) {
    const msg = document.createElement('div');
    msg.className = 'chip';
    msg.textContent = 'Failed to load communities.';
    document.querySelector('main').prepend(msg);
    console.error(err);
  }
}

render();
