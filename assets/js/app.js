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

  const top=document.createElement('div'); top.className='card-top';
  const logoWrap=document.createElement('div'); logoWrap.className='logo-wrap';
  const logo=document.createElement('div'); logo.className='logo';
  if(data.logoImage){
    const img=document.createElement('img');
    img.src=data.logoImage;
    img.alt=`${data.name} logo`;
    logo.appendChild(img);
  } else {
    const span=document.createElement('span');
    span.textContent=(data.name||'').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    logo.appendChild(span);
  }
  logoWrap.appendChild(logo);

  const meta=document.createElement('div'); meta.className='card-meta';
  const badge=document.createElement('span'); badge.className='micro-chip accent'; badge.textContent='Community node';
  meta.appendChild(badge);
  if(data.foundedDate){
    const year=new Date(data.foundedDate).getFullYear();
    const since=document.createElement('span'); since.className='micro-chip'; since.textContent=`Since ${year}`;
    meta.appendChild(since);
  }

  top.appendChild(logoWrap);
  top.appendChild(meta);

  const main=document.createElement('div'); main.className='card-main';
  const titleRow=document.createElement('div'); titleRow.className='title-row';
  const title=document.createElement('h3'); title.className='card-title'; title.textContent=data.name;
  titleRow.appendChild(title);

  const primaryPlatform=data.platforms?.[0];
  if(primaryPlatform){
    const a=document.createElement('a'); a.className='platform-pill'; a.href=primaryPlatform.url||'#';
    if(a.href !== '#'){a.target='_blank'; a.rel='noopener noreferrer';}
    if(primaryPlatform.icon){
      const icon=document.createElement('span'); icon.className='platform-icon';
      const iconImg=document.createElement('img'); iconImg.src=primaryPlatform.icon; iconImg.alt=`${primaryPlatform.name} icon`;
      icon.appendChild(iconImg); a.appendChild(icon);
    }
    const label=document.createElement('span'); label.textContent=primaryPlatform.name; a.appendChild(label);
    titleRow.appendChild(a);
  }

  main.appendChild(titleRow);

  if(data.description){
    const desc=document.createElement('p'); desc.className='card-desc'; desc.textContent=data.description;
    main.appendChild(desc);
  }

  const statGrid=document.createElement('div'); statGrid.className='stat-grid';
  const membersStat=document.createElement('div'); membersStat.className='stat-block';
  membersStat.innerHTML=`<span class="stat-label">Members</span><span class="stat-value">${Number(data.membersCount||0).toLocaleString()}</span>`;
  statGrid.appendChild(membersStat);

  const monthlyCost=typeof data.membershipCost==='string'?data.membershipCost:data.membershipCost?.monthly;
  if(monthlyCost){
    const cost=document.createElement('div'); cost.className='stat-block';
    cost.innerHTML=`<span class="stat-label">Monthly</span><span class="stat-value">${monthlyCost}</span>`;
    statGrid.appendChild(cost);
  }

  if(data.foundedDate){
    const year=new Date(data.foundedDate).getFullYear();
    const founded=document.createElement('div'); founded.className='stat-block';
    founded.innerHTML=`<span class="stat-label">Founded</span><span class="stat-value">${year}</span>`;
    statGrid.appendChild(founded);
  }
  main.appendChild(statGrid);

  const signal=document.createElement('div'); signal.className='signal-bar';
  main.appendChild(signal);

  if(data.founderName || data.founderImage){
    const founderRow=document.createElement('div'); founderRow.className='founder-row';
    if(data.founderImage){
      const img=document.createElement('img');
      img.src=data.founderImage;
      img.alt=`${data.founderName||'Founder'} photo`;
      img.className='founder-img';
      founderRow.appendChild(img);
    }
    const info=document.createElement('div'); info.className='founder-info';
    const label=document.createElement('span'); label.className='founder-label'; label.textContent='Founder';
    const name=document.createElement('span'); name.className='founder-name'; name.textContent=data.founderName||'Anonymous';
    info.appendChild(label); info.appendChild(name);
    founderRow.appendChild(info);
    main.appendChild(founderRow);
  }

  const ctaRow=document.createElement('div'); ctaRow.className='cta-row';
  const cta=document.createElement('a'); cta.className='cta';
  const ctaHref=data.communityUrl||primaryPlatform?.url||'#';
  cta.href=ctaHref; cta.innerHTML='Enter portal <span>↗</span>';
  if(ctaHref && ctaHref !== '#'){cta.target='_blank'; cta.rel='noopener noreferrer';}
  ctaRow.appendChild(cta);

  const vibe=document.createElement('span'); vibe.className='micro-chip'; vibe.textContent='Live orbit';
  ctaRow.appendChild(vibe);

  article.appendChild(top);
  article.appendChild(main);
  article.appendChild(ctaRow);

  article.addEventListener('pointermove',(e)=>{
    const r=article.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width*100;
    const y=(e.clientY-r.top)/r.height*100;
    article.style.setProperty('--mx',x+'%');
    article.style.setProperty('--my',y+'%');
  });

  return article;
}

async function render(){
  const mount=document.getElementById('cards');
  if(!mount) return;
  mount.innerHTML='';
  try{
    const res=await fetch('data/communities.json',{cache:'no-cache'});
    const items=await res.json();
    items.forEach((item,i)=>{
      const el=cardEl(item);
      el.style.animationDelay=`${i*0.1}s`;
      mount.appendChild(el);
      io.observe(el);
    });
  }catch(err){
    const msg=document.createElement('div'); msg.className='chip'; msg.textContent='Failed to load communities.';
    document.querySelector('main').prepend(msg);
    console.error(err);
  }
}

render();
