const labels={dashboard:'Organization Profile & Overall Health',products:'Product Management',customers:'Customer Management',transactions:'Transactions & Sales',inventory:'Inventory Management',reports:'Reports & Analytics',users:'User Management',settings:'Preferences & System Settings'};
const content=document.getElementById('content'),title=document.getElementById('title'),toast=document.getElementById('toast');
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('show'),2300)}
function navigate(page){if(!labels[page])return;document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===page));title.textContent=labels[page];if(page==='dashboard'){location.hash='';location.reload();return}content.innerHTML=`<section class="card" style="padding:65px 20px;text-align:center"><div style="font-size:38px;color:#2d6a4f">♧</div><h2 style="font:700 21px Outfit;color:#1b4332">${labels[page]}</h2><p style="color:#85877e;font-size:12px">This section is planned for the next development step. Database records and actions are not connected yet.</p><button class="soft" id="back">← Back to dashboard</button></section>`;document.getElementById('back').onclick=()=>location.reload();location.hash=page;document.getElementById('sidebar').classList.remove('open')}
document.querySelectorAll('.nav').forEach(n=>n.addEventListener('click',()=>navigate(n.dataset.page)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.goto)));
document.getElementById('menu').onclick=()=>document.getElementById('sidebar').classList.toggle('open');
document.getElementById('refresh').onclick=()=>notify('Dashboard preview refreshed.');
document.getElementById('bell').onclick=()=>notify('Notifications will be connected in a later phase.');
document.getElementById('period').onchange=e=>notify('Selected: '+e.target.value);
document.getElementById('search').onkeydown=e=>{if(e.key==='Enter'&&e.target.value.trim())notify('Search will be connected in a later phase.')};
if(location.hash&&labels[location.hash.slice(1)])navigate(location.hash.slice(1));
