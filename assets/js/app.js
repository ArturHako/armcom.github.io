const root=document.documentElement;const toggle=document.getElementById('themeToggle');
const isMobile=window.matchMedia('(max-width: 820px)').matches||window.matchMedia('(pointer: coarse)').matches;
if(isMobile) root.classList.add('is-mobile');
const escapeHtml=(str='')=>str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const markdownToHtml=(str='')=>{
  const escaped=escapeHtml(str);
  return escaped
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/\n/g,'<br>');
};
const socialIcons={
  facebook:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 0-10.406 8.91v-6.3H8.078V12h2.516V9.797c0-2.485 1.48-3.86 3.747-3.86 1.086 0 2.223.194 2.223.194v2.445h-1.252c-1.234 0-1.618.765-1.618 1.55V12h2.75l-.439 2.61h-2.311v6.3A9.002 9.002 0 0 0 21 12"/></svg>',
  instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm11.25 1.25a1 1 0 1 1-2 0a1 1 0 0 1 2 0ZM12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z"/></svg>',
  twitter:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 5.5a4.1 4.1 0 0 1-1.18.32A2.06 2.06 0 0 0 20.42 4a4.13 4.13 0 0 1-1.31.5A2.05 2.05 0 0 0 12 6.05a5.82 5.82 0 0 1-4.23-2.14A2.05 2.05 0 0 0 8.38 6a2.05 2.05 0 0 1-.93-.26v.03A2.05 2.05 0 0 0 9.87 7.8a2.06 2.06 0 0 1-.93.04A2.05 2.05 0 0 0 10.9 9a4.12 4.12 0 0 1-3 0a5.8 5.8 0 0 0 3.14.92A5.81 5.81 0 0 0 17.93 7a4.12 4.12 0 0 0 1.07-1.05Z"/></svg>',
  linkedin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.1 9.2V19H2V9.2h3.1ZM3.55 4C2.7 4 2 4.7 2 5.55S2.7 7.1 3.55 7.1c.84 0 1.55-.7 1.55-1.55C5.1 4.7 4.4 4 3.55 4ZM14.37 9.02c-1.63 0-2.64.89-3.08 1.75h-.05V9.2H8.2V19h3.12v-4.82c0-1.27.24-2.5 1.81-2.5c1.54 0 1.56 1.44 1.56 2.58V19H17V13.9c0-2.42-.52-4.88-2.63-4.88Z"/></svg>'
};
function setTheme(mode){root.setAttribute('data-theme',mode);toggle.setAttribute('data-mode',mode);localStorage.setItem('theme',mode)}
(function(){const saved=localStorage.getItem('theme');const preferred=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';setTheme(saved||preferred)})();
if(toggle){
  toggle.addEventListener('click',()=>setTheme(toggle.getAttribute('data-mode')==='dark'?'light':'dark'));
  toggle.addEventListener('keyup',(e)=>{if(e.key==='Enter'||e.key===' ')toggle.click()});
}

const io=!isMobile && 'IntersectionObserver'in window
  ? new IntersectionObserver((entries)=>{entries.forEach((e)=>{if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target)}})},{rootMargin:'0px 0px -10% 0px',threshold:0.1})
  : null;

function setDescHeight(el){
  if(!el) return;
  const content=el.querySelector('.card-desc');
  const openPadding=32;
  const targetHeight=Math.ceil((content?.scrollHeight||el.scrollHeight)+openPadding);
  el.style.setProperty('--open-height',`${targetHeight}px`);
}

function cardEl(data){
  const article=document.createElement('article');
  article.className='community-card';
  article.style.setProperty('--accent', data.colors?.[0]||'var(--accent)');
  article.style.setProperty('--accent-2', data.colors?.[1]||'var(--accent-2)');

  const shell=document.createElement('div');
  shell.className='card-shell';

  // Header block
  const top=document.createElement('div');
  top.className='card-top';

  const logo=document.createElement('div');
  logo.className='logo';
  if(data.logoImage){
    const img=document.createElement('img');
    img.src=data.logoImage;
    img.alt=`${data.name} լոգո`;
    logo.appendChild(img);
  } else {
    const span=document.createElement('span');
    span.textContent=(data.name||'').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    logo.appendChild(span);
  }

  const titleBlock=document.createElement('div');
  titleBlock.className='title-block';
  const title=document.createElement('h3'); title.className='card-title'; title.textContent=data.name;
  titleBlock.appendChild(title);
  if(isMobile){
    const tapHint=document.createElement('span'); tapHint.className='tap-hint';
    tapHint.textContent='Սեղմեք քարտը՝ բացելու նկարագրությունը';
    titleBlock.appendChild(tapHint);
  }
  let descWrap;
  if(data.description){
    descWrap=document.createElement('div'); descWrap.className='description-bubble';
    const desc=document.createElement('p'); desc.className='card-desc'; desc.innerHTML=markdownToHtml(data.description);
    descWrap.appendChild(desc);
  }
  top.appendChild(logo);
  top.appendChild(titleBlock);
  shell.appendChild(top);
  if(descWrap) shell.appendChild(descWrap);

  // Founder chips
  const primaryPlatform=data.platforms?.[0];
  const founders=Array.isArray(data.founders)&&data.founders.length?data.founders:(data.founderName?[{name:data.founderName,image:data.founderImage}]:[]);
  if(founders.length){
    const foundersWrap=document.createElement('div'); foundersWrap.className='founders-grid';
    founders.forEach((founder)=>{
      const founderChip=document.createElement('div'); founderChip.className='founder-chip';
      if(founder.image){
        const img=document.createElement('img');
        img.src=founder.image;
        img.alt=`${founder.name||'Հիմնադիր'} լուսանկար`;
        img.className='founder-img';
        founderChip.appendChild(img);
      }
      const founderInfo=document.createElement('div'); founderInfo.className='founder-info';
      const founderLabel=document.createElement('span'); founderLabel.className='founder-label'; founderLabel.textContent='Հիմնադիր';
      const founderName=document.createElement('span'); founderName.className='founder-name'; founderName.textContent=founder.name||'';
      founderInfo.appendChild(founderLabel);
      founderInfo.appendChild(founderName);
      founderChip.appendChild(founderInfo);
      foundersWrap.appendChild(founderChip);
    });
    shell.appendChild(foundersWrap);
  }

  // Stat stack
  const statsRow=document.createElement('div'); statsRow.className='stat-stack';

  const membersStat=document.createElement('div'); membersStat.className='stat-item';
const membersValue=document.createElement('span'); membersValue.className='stat-value';
const rawCount=data.membersCount;
const numericCount=typeof rawCount==='string'
    ? Number(rawCount.replace(/[^\d.-]/g,''))
    : Number(rawCount);
membersValue.textContent=Number.isFinite(numericCount) && numericCount>=0
    ? numericCount.toLocaleString()
    : (rawCount ?? '—');
  const membersLabel=document.createElement('span'); membersLabel.className='stat-label'; membersLabel.textContent='Անդամներ';
  membersStat.appendChild(membersValue);
  membersStat.appendChild(membersLabel);
  statsRow.appendChild(membersStat);

  const monthlyCost=typeof data.membershipCost==='string'?data.membershipCost:data.membershipCost?.monthly;
  if(monthlyCost){
    const costStat=document.createElement('div'); costStat.className='stat-item';
    const costValue=document.createElement('span'); costValue.className='stat-value'; costValue.textContent=monthlyCost;
    const costLabel=document.createElement('span'); costLabel.className='stat-label'; costLabel.textContent='Անդամավճար';
    costStat.appendChild(costValue);
    costStat.appendChild(costLabel);
    statsRow.appendChild(costStat);
  }

  if(data.foundedDate){
    const foundedStat=document.createElement('div'); foundedStat.className='stat-item';
    const year=new Date(data.foundedDate).getFullYear();
    const foundedValue=document.createElement('span'); foundedValue.className='stat-value'; foundedValue.textContent=year;
    const foundedLabel=document.createElement('span'); foundedLabel.className='stat-label'; foundedLabel.textContent='Հիմնադրվել է';
    foundedStat.appendChild(foundedValue);
    foundedStat.appendChild(foundedLabel);
    statsRow.appendChild(foundedStat);
  }
  shell.appendChild(statsRow);

  // Platform
  if(primaryPlatform){
    const platforms=document.createElement('div'); platforms.className='platforms';
    const platformLabel=document.createElement('span'); platformLabel.className='platform-label eyebrow'; platformLabel.textContent='Հարթակ';
    platforms.appendChild(platformLabel);
    const a=document.createElement('div'); a.className='platform-pill';
    if(primaryPlatform.icon){
      const icon=document.createElement('span'); icon.className='platform-icon';
      const iconImg=document.createElement('img'); iconImg.src=primaryPlatform.icon; iconImg.alt=`${primaryPlatform.name} պատկերակ`;
      icon.appendChild(iconImg); a.appendChild(icon);
    }
    const label=document.createElement('span'); label.textContent=primaryPlatform.name; a.appendChild(label);
    platforms.appendChild(a);
    shell.appendChild(platforms);
  }

  // Optional socials
  if(Array.isArray(data.socials) && data.socials.length){
    const socialRow=document.createElement('div'); socialRow.className='social-row';
    data.socials.forEach((social)=>{
      const iconMarkup=socialIcons[social.type?.toLowerCase?.()];
      if(!iconMarkup || !social.url) return;
      const link=document.createElement('a');
      link.className='social-icon';
      link.href=social.url;
      link.target='_blank';
      link.rel='noopener noreferrer';
      link.setAttribute('aria-label',`${social.type} պրոֆիլ`);
      link.innerHTML=iconMarkup;
      socialRow.appendChild(link);
    });
    if(socialRow.children.length) shell.appendChild(socialRow);
  }

  const ctaRow=document.createElement('div'); ctaRow.className='cta-row';
  const cta=document.createElement('a'); cta.className='cta';
  const ctaHref=data.communityUrl||primaryPlatform?.url||'#';
  cta.href=ctaHref; cta.textContent='Միանալ համայնքին →';
  if(ctaHref && ctaHref !== '#'){cta.target='_blank'; cta.rel='noopener noreferrer';}
  ctaRow.appendChild(cta);
  shell.appendChild(ctaRow);

  article.appendChild(shell);

  // Mouse tracking for glow & tilt
  if(!isMobile){
    article.addEventListener('pointermove',(e)=>{
      const r=article.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width;
      const y=(e.clientY-r.top)/r.height;
      const rx=((0.5 - y)*10).toFixed(2)+'deg';
      const ry=((x - 0.5)*10).toFixed(2)+'deg';
      article.style.setProperty('--mx',`${x*100}%`);
      article.style.setProperty('--my',`${y*100}%`);
      shell.style.setProperty('--rx',rx);
      shell.style.setProperty('--ry',ry);
    });
    article.addEventListener('pointerleave',()=>{
      shell.style.removeProperty('--rx');
      shell.style.removeProperty('--ry');
    });
  }

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
      if(!isMobile) el.style.animationDelay=`${i*0.1}s`;
      mount.appendChild(el);
      const desc=el.querySelector('.description-bubble');
      if(desc){
        requestAnimationFrame(()=>setDescHeight(desc));
      }
      if(io){io.observe(el);} else {el.classList.add('revealed');}
    });
  }catch(err){
    const msg=document.createElement('div'); msg.className='chip'; msg.textContent='Համայնքների բեռնումը ձախողվեց։';
    document.querySelector('main').prepend(msg);
    console.error(err);
  }
}

window.addEventListener('resize',()=>{
  document.querySelectorAll('.description-bubble').forEach(setDescHeight);
});

render();
