const root=document.documentElement;const toggle=document.getElementById('themeToggle');const themeLabel=document.getElementById('themeLabel');
function setTheme(mode){root.setAttribute('data-theme',mode);toggle.setAttribute('data-mode',mode);localStorage.setItem('theme',mode);if(themeLabel)themeLabel.textContent=mode.charAt(0).toUpperCase()+mode.slice(1);}
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

  // Logo
  const logo=document.createElement('div');
  logo.className='logo';
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

  const body=document.createElement('div'); body.className='card-body';
  const head=document.createElement('div'); head.className='card-head';
  const meta=document.createElement('div');

  // Title
  const title=document.createElement('h3'); title.className='card-title'; title.textContent=data.name;
  meta.appendChild(title);

  // Description
  if(data.description){
    const desc=document.createElement('p'); desc.className='card-desc'; desc.textContent=data.description;
    meta.appendChild(desc);
  }

  head.appendChild(logo);
  head.appendChild(meta);
  body.appendChild(head);

  // Founder section
  const primaryPlatform=data.platforms?.[0];
  if(data.founderName || data.founderImage){
    const founderChip=document.createElement('div'); founderChip.className='founder-chip';
    if(data.founderImage){
      const img=document.createElement('img');
      img.src=data.founderImage;
      img.alt=`${data.founderName} photo`;
      img.className='founder-img';
      founderChip.appendChild(img);
    }
    const founderInfo=document.createElement('div'); founderInfo.className='founder-info';
    const founderLabel=document.createElement('span'); founderLabel.className='founder-label'; founderLabel.textContent='Founder';
    const founderName=document.createElement('span'); founderName.className='founder-name'; founderName.textContent=data.founderName||'';
    founderInfo.appendChild(founderLabel);
    founderInfo.appendChild(founderName);
    founderChip.appendChild(founderInfo);
    body.appendChild(founderChip);
  }

  // Stats row
  const statsRow=document.createElement('div'); statsRow.className='stats-row';

  // Members stat
  const membersStat=document.createElement('div'); membersStat.className='stat-item';
  const membersValue=document.createElement('span'); membersValue.className='stat-value'; membersValue.textContent=Number(data.membersCount||0).toLocaleString();
  const membersLabel=document.createElement('span'); membersLabel.className='stat-label'; membersLabel.textContent='Members';
  membersStat.appendChild(membersValue);
  membersStat.appendChild(membersLabel);
  statsRow.appendChild(membersStat);

  // Cost stat
  const monthlyCost=typeof data.membershipCost==='string'?data.membershipCost:data.membershipCost?.monthly;
  if(monthlyCost){
    const costStat=document.createElement('div'); costStat.className='stat-item';
    const costValue=document.createElement('span'); costValue.className='stat-value'; costValue.textContent=monthlyCost;
    const costLabel=document.createElement('span'); costLabel.className='stat-label'; costLabel.textContent='Monthly';
    costStat.appendChild(costValue);
    costStat.appendChild(costLabel);
    statsRow.appendChild(costStat);
  }

  // Founded stat
  if(data.foundedDate){
    const foundedStat=document.createElement('div'); foundedStat.className='stat-item';
    const year=new Date(data.foundedDate).getFullYear();
    const foundedValue=document.createElement('span'); foundedValue.className='stat-value'; foundedValue.textContent=year;
    const foundedLabel=document.createElement('span'); foundedLabel.className='stat-label'; foundedLabel.textContent='Founded';
    foundedStat.appendChild(foundedValue);
    foundedStat.appendChild(foundedLabel);
    statsRow.appendChild(foundedStat);
  }
  body.appendChild(statsRow);

  // Platform
  if(primaryPlatform){
    const platforms=document.createElement('div'); platforms.className='platforms';
    const a=document.createElement('a'); a.className='pill platform-pill'; a.href=primaryPlatform.url||'#';
    if(a.href !== '#'){a.target='_blank'; a.rel='noopener noreferrer';}
    if(primaryPlatform.icon){
      const icon=document.createElement('span'); icon.className='platform-icon';
      const iconImg=document.createElement('img'); iconImg.src=primaryPlatform.icon; iconImg.alt=`${primaryPlatform.name} icon`;
      icon.appendChild(iconImg); a.appendChild(icon);
    }
    const label=document.createElement('span'); label.textContent=primaryPlatform.name; a.appendChild(label);
    platforms.appendChild(a); body.appendChild(platforms);
  }

  // CTA
  const cta=document.createElement('a'); cta.className='cta';
  const ctaHref=data.communityUrl||primaryPlatform?.url||'#';
  cta.href=ctaHref; cta.textContent='Join Community →';
  if(ctaHref && ctaHref !== '#'){cta.target='_blank'; cta.rel='noopener noreferrer';}
  body.appendChild(cta);

  article.appendChild(body);

  // Mouse tracking for glow effect
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
    const counter=document.getElementById('communityCount');
    if(counter) counter.textContent=items.length;
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
