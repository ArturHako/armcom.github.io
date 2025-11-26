const root=document.documentElement;const toggle=document.getElementById('themeToggle');
function setTheme(mode){root.setAttribute('data-theme',mode);toggle.setAttribute('data-mode',mode);localStorage.setItem('theme',mode)}
(function(){const saved=localStorage.getItem('theme');const preferred=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';setTheme(saved||preferred)})();
if(toggle){
  toggle.addEventListener('click',()=>setTheme(toggle.getAttribute('data-mode')==='dark'?'light':'dark'));
  toggle.addEventListener('keyup',(e)=>{if(e.key==='Enter'||e.key===' ')toggle.click()});
}

const io=new IntersectionObserver((entries)=>{entries.forEach((e)=>{if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px',threshold:0.1});

function cardEl(data){
  const article=document.createElement('article');
  article.className='community-card';
  article.style.setProperty('--accent', data.colors?.[0]||'var(--accent)');
  article.style.setProperty('--accent-2', data.colors?.[1]||'var(--accent-2)');

  const logo=document.createElement('div');
  logo.className='logo';
  if(data.logoImage){
    const img=document.createElement('img');
    img.src=data.logoImage; img.alt=`${data.name} logo`; img.width=64; img.height=64; img.style.borderRadius='16px'; img.style.width='64px'; img.style.height='64px';
    logo.appendChild(img);
  } else {
    const span=document.createElement('span');
    span.textContent=(data.name||'').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    logo.appendChild(span);
  }

  const body=document.createElement('div'); body.className='card-body';
  const title=document.createElement('h3'); title.className='card-title'; title.textContent=data.name;
  const desc=document.createElement('p'); desc.className='card-desc'; desc.textContent=data.description||'';

  const platforms=document.createElement('div'); platforms.className='platforms'; platforms.setAttribute('aria-label','Online platforms');
  (data.platforms||[]).forEach(p=>{const a=document.createElement('a'); a.className='pill'; a.href=p.url||'#'; a.setAttribute('aria-label',p.name); a.textContent=p.name; platforms.appendChild(a)});

  const row=document.createElement('div'); row.className='row';
  const chips=document.createElement('div'); chips.className='chips';
  if(data.membershipCost){
    if(data.membershipCost.monthly){const c=document.createElement('span'); c.className='chip accent'; c.textContent=data.membershipCost.monthly; chips.appendChild(c)}
    if(data.membershipCost.yearly){const c=document.createElement('span'); c.className='chip accent'; c.textContent=data.membershipCost.yearly; chips.appendChild(c)}
  }
  const members=document.createElement('span'); members.className='chip'; members.textContent=`Members • ${Number(data.membersCount||0).toLocaleString()}`; chips.appendChild(members);
  const founded=document.createElement('span'); founded.className='chip'; founded.setAttribute('aria-label','Founded date'); founded.textContent=`Founded: ${data.foundedDate}`;

  row.appendChild(chips); row.appendChild(founded);

  const cta=document.createElement('a'); cta.className='cta'; cta.href='#'; cta.setAttribute('aria-label',`Join ${data.name}`); cta.textContent='Join community';

  if(data.founderName || data.founderImage){
    const founderWrap=document.createElement('div'); founderWrap.className='row';
    const founderChip=document.createElement('span'); founderChip.className='chip'; founderChip.textContent=`Founder • ${data.founderName||''}`;
    if(data.founderImage){const img=document.createElement('img'); img.src=data.founderImage; img.alt=`${data.founderName} photo`; img.width=24; img.height=24; img.style.borderRadius='50%'; img.style.marginRight='8px'; founderChip.prepend(img)}
    founderWrap.appendChild(founderChip);
    body.appendChild(founderWrap);
  }

  body.appendChild(title); body.appendChild(desc); body.appendChild(platforms); body.appendChild(row); body.appendChild(cta);
  article.appendChild(logo); article.appendChild(body);
  article.addEventListener('pointermove',(e)=>{const r=article.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*100;const y=(e.clientY-r.top)/r.height*100;article.style.setProperty('--mx',x+'%');article.style.setProperty('--my',y+'%')});
  return article;
}

async function render(){
  const mount=document.getElementById('cards');
  if(!mount) return;
  mount.innerHTML='';
  try{
    const res=await fetch('data/communities.json',{cache:'no-cache'});
    const items=await res.json();
    items.forEach(item=>{const el=cardEl(item); mount.appendChild(el); io.observe(el)});
  }catch(err){
    const msg=document.createElement('div'); msg.className='chip'; msg.textContent='Failed to load communities.'; document.querySelector('main').prepend(msg);
    console.error(err);
  }
}

render();
