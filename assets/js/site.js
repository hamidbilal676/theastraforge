/* The Astra Forge — shared interactions */
(function(){
  "use strict";
  // theme
  var root=document.documentElement;
  function setTheme(t){root.setAttribute('data-theme',t);try{localStorage.setItem('af-theme',t)}catch(e){}
    var b=document.getElementById('themeBtn');if(b)b.textContent=(t==='dark')?'☀️':'🌙';}
  var saved=null;try{saved=localStorage.getItem('af-theme')}catch(e){}
  setTheme(saved||'light');
  document.addEventListener('click',function(e){
    var b=e.target.closest('#themeBtn');if(b){setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark');}
  });
  // burger
  var burger=document.getElementById('burger'),nav=document.getElementById('navLinks');
  if(burger&&nav){burger.addEventListener('click',function(){nav.classList.toggle('open')});
    nav.addEventListener('click',function(e){if(e.target.tagName==='A')nav.classList.remove('open')});}
  // faq
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');
    if(!q||!a)return;
    q.addEventListener('click',function(){
      var open=item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){o.classList.remove('open');var oa=o.querySelector('.faq-a');if(oa)oa.style.maxHeight=null;});
      if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
    });
  });
  // portfolio filters
  var fbtns=document.querySelectorAll('.pf-filter'),cards=document.querySelectorAll('.pf-card[data-cat]'),secs=document.querySelectorAll('.pf-sec[data-sec]');
  if(fbtns.length){fbtns.forEach(function(b){b.addEventListener('click',function(){
    fbtns.forEach(function(x){x.classList.remove('active')});b.classList.add('active');
    var f=b.getAttribute('data-filter');
    if(f==='all'){secs.forEach(function(x){x.style.display='';});cards.forEach(function(c){c.style.display='';});}
    else{secs.forEach(function(x){x.style.display='none';});cards.forEach(function(c){c.style.display=(c.getAttribute('data-cat')===f)?'':'none';});}
  });});}
})();
/* ---------- Three.js 3D hero (lazy-loaded) ---------- */
function initHero3D(){
  var canvas=document.getElementById('bg3d');
  if(!canvas||typeof THREE==='undefined')return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  try{
    var renderer=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
  }catch(e){canvas.style.display='none';return;}
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(60,1,0.1,100);
  camera.position.z=14;
  function size(){var w=canvas.clientWidth||canvas.parentElement.clientWidth,h=canvas.clientHeight||canvas.parentElement.clientHeight;
    renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));camera.aspect=w/h;camera.updateProjectionMatrix();}
  size();window.addEventListener('resize',size);
  var green=new THREE.Color(0x22c55e),greenL=new THREE.Color(0x4ade80);
  // particles
  var pGeo=new THREE.BufferGeometry(),N=window.innerWidth<700?180:380,pos=new Float32Array(N*3);
  for(var i=0;i<N;i++){pos[i*3]=(Math.random()-0.5)*36;pos[i*3+1]=(Math.random()-0.5)*20;pos[i*3+2]=(Math.random()-0.5)*16;}
  pGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  var pMat=new THREE.PointsMaterial({color:0x22c55e,size:0.09,transparent:true,opacity:0.75});
  var pts=new THREE.Points(pGeo,pMat);scene.add(pts);
  // floating shapes
  var shapes=[];
  var geos=[new THREE.IcosahedronGeometry(1.1,0),new THREE.TorusGeometry(1.4,0.42,14,36),new THREE.OctahedronGeometry(1.2,0),new THREE.TorusKnotGeometry(0.9,0.28,90,12)];
  var mats=[new THREE.MeshBasicMaterial({color:green,wireframe:true,transparent:true,opacity:0.5}),
            new THREE.MeshBasicMaterial({color:greenL,wireframe:true,transparent:true,opacity:0.4})];
  for(var s=0;s<7;s++){
    var m=new THREE.Mesh(geos[s%geos.length],mats[s%mats.length]);
    m.position.set((Math.random()-0.5)*26,(Math.random()-0.5)*12,(Math.random()-0.5)*8-2);
    m.userData={rx:(Math.random()-0.5)*0.012,ry:(Math.random()-0.5)*0.012,fy:m.position.y,sp:0.4+Math.random()*0.8,ph:Math.random()*6.28};
    scene.add(m);shapes.push(m);
  }
  var mx=0,my=0;
  window.addEventListener('pointermove',function(e){mx=(e.clientX/window.innerWidth-0.5);my=(e.clientY/window.innerHeight-0.5);},{passive:true});
  var t=0,run=true;
  document.addEventListener('visibilitychange',function(){run=!document.hidden;if(run)loop();});
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){run=!document.hidden&&es[0].isIntersecting;if(run)loop();},{threshold:0}).observe(canvas);
  }
  function loop(){
    if(!run)return;
    requestAnimationFrame(loop);
    t+=0.008;
    pts.rotation.y=t*0.03;
    camera.position.x+=(mx*2.4-camera.position.x)*0.04;
    camera.position.y+=(-my*1.6-camera.position.y)*0.04;
    camera.lookAt(0,0,0);
    shapes.forEach(function(m){m.rotation.x+=m.userData.rx;m.rotation.y+=m.userData.ry;
      m.position.y=m.userData.fy+Math.sin(t*m.userData.sp+m.userData.ph)*0.9;});
    renderer.render(scene,camera);
  }
  loop();
}

/* ---------- lead form: package pre-select + Formspree submit ---------- */
(function(){
  var form=document.getElementById('leadForm');
  var select=document.getElementById('lf-service');
  function pick(val){
    if(!select||!val)return;
    var opt=Array.prototype.find.call(select.options,function(o){return o.value===val||o.text===val;});
    if(opt)select.value=opt.value;
  }
  // pre-select from package buttons (Task 1 buttons carry data-package)
  document.addEventListener('click',function(e){
    var btn=e.target.closest('[data-package]');
    if(btn)pick(btn.getAttribute('data-package'));
  });
  // pre-select from URL hash like #lead-form?package=Growth
  try{
    var m=window.location.hash.match(/package=([^&]+)/);
    if(m)pick(decodeURIComponent(m[1]));
  }catch(e){}
  if(!form)return;
  var submit=document.getElementById('lf-submit');
  var err=document.getElementById('lf-error');
  var ok=document.getElementById('lf-success');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(err)err.hidden=true;
    if(!form.action){if(err)err.hidden=false;return;}
    if(submit){submit.disabled=true;submit.textContent='Sending...';}
    fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}})
      .then(function(r){if(!r.ok)throw new Error('submit failed');return r.json();})
      .then(function(){
        form.hidden=true;
        if(ok){ok.hidden=false;ok.scrollIntoView({behavior:'smooth',block:'center'});}
      })
      .catch(function(){
        if(err)err.hidden=false;
        if(submit){submit.disabled=false;submit.textContent='Send Request';}
      });
  });
})();

/* Lazy-load three.js after the page is interactive — keeps it off the critical path */
(function(){
  function load(){
    if(typeof THREE!=='undefined'){initHero3D();return;}
    var sc=document.createElement('script');
    sc.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/0.158.0/three.min.js';
    sc.onload=function(){try{initHero3D();}catch(e){}};
    document.head.appendChild(sc);
  }
  if('requestIdleCallback' in window){
    window.addEventListener('load',function(){requestIdleCallback(load,{timeout:3000});});
  }else{
    window.addEventListener('load',function(){setTimeout(load,2000);});
  }
})();

/* Count-up animation for stat cards (service pages) */
(function(){
  var els=document.querySelectorAll('.stat-card .n[data-count]');
  if(!els.length)return;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fmt(el,v){
    var dec=parseInt(el.getAttribute('data-dec')||'0',10);
    var pre=el.getAttribute('data-pre')||'',suf=el.getAttribute('data-suf')||'';
    var s=v.toFixed(dec);
    if(el.hasAttribute('data-comma')){
      var parts=s.split('.');
      parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');
      s=parts.join('.');
    }
    return pre+s+suf;
  }
  function run(el){
    var target=parseFloat(el.getAttribute('data-count'));
    if(reduce||isNaN(target)){if(!isNaN(target))el.textContent=fmt(el,target);return;}
    var t0=null,dur=1700;
    function step(ts){
      if(!t0)t0=ts;
      var p=Math.min((ts-t0)/dur,1);
      var e=1-Math.pow(1-p,3);
      el.textContent=fmt(el,target*e);
      if(p<1)requestAnimationFrame(step);else el.textContent=fmt(el,target);
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){if(en.isIntersecting){run(en.target);io.unobserve(en.target);}});
    },{threshold:0.35});
    els.forEach(function(el){io.observe(el);});
  }else{els.forEach(run);}
})();

/* Video download protection: no download button, no PiP, no right-click save */
document.querySelectorAll("video").forEach(function (v) {
  try { v.controlsList.add("nodownload"); } catch (e) {}
  v.disablePictureInPicture = true;
  v.addEventListener("contextmenu", function (e) { e.preventDefault(); });
});

/* ---------- 50% offer popup: once per visitor, after a few seconds ---------- */
(function(){
  var pop=document.getElementById('offerPop');
  if(!pop)return;
  var KEY='af-offer-seen';
  try{if(localStorage.getItem(KEY))return;}catch(e){}
  function seen(){try{localStorage.setItem(KEY,'1');}catch(e){}}
  function close(){pop.hidden=true;seen();}
  document.getElementById('popClose').addEventListener('click',close);
  document.getElementById('popNo').addEventListener('click',close);
  pop.addEventListener('click',function(ev){if(ev.target===pop)close();});
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&!pop.hidden)close();});
  var claim=document.getElementById('popClaim');
  if(claim)claim.addEventListener('click',function(ev){
    seen();
    var f=document.getElementById('lead-form');
    if(f){ev.preventDefault();pop.hidden=true;f.scrollIntoView({behavior:'smooth'});}
  });
  setTimeout(function(){
    if(window.location.hash.indexOf('lead-form')===1)return;
    var f=document.getElementById('lead-form');
    if(f){var r=f.getBoundingClientRect();if(r.top<window.innerHeight&&r.bottom>0)return;}
    pop.hidden=false;
  },6000);
})();
