/* 빛고을장례119 — 공통 스크립트 */

// 모바일 메뉴
(function(){
  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mmenu');
  if(!burger || !mmenu) return;
  burger.addEventListener('click', function(){
    var on = mmenu.classList.toggle('on');
    burger.setAttribute('aria-expanded', on);
  });
  mmenu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      mmenu.classList.remove('on');
      burger.setAttribute('aria-expanded', false);
    });
  });
})();

// FAQ 아코디언
document.querySelectorAll('.faq-q').forEach(function(btn){
  btn.addEventListener('click', function(){
    var item = btn.parentElement;
    var ans = item.querySelector('.faq-a');
    var wasOpen = item.classList.contains('on');
    document.querySelectorAll('.faq-i.on').forEach(function(o){
      o.classList.remove('on');
      o.querySelector('.faq-a').style.maxHeight = null;
    });
    if(!wasOpen){
      item.classList.add('on');
      ans.style.maxHeight = ans.scrollHeight + 'px';
    }
  });
});

// 상담 모달
function openModal(){
  var m = document.getElementById('modal');
  if(!m) return;
  m.classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  var m = document.getElementById('modal');
  if(!m) return;
  m.classList.remove('on');
  document.body.style.overflow = '';
}
(function(){
  var m = document.getElementById('modal');
  if(!m) return;
  m.addEventListener('click', function(e){ if(e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });
})();

// 폼 제출 (시안 — 실제 오픈 시 네이버 폼/서버 연동)
function handleSubmit(e){
  e.preventDefault();
  alert('상담 신청이 접수되었습니다.\n확인 후 빠르게 연락드리겠습니다.\n\n(시안 단계 — 실제 오픈 시 연동 예정)');
  closeModal();
  e.target.reset();
}
document.querySelectorAll('form.form, #modalForm').forEach(function(f){
  f.addEventListener('submit', handleSubmit);
});

/* ---------- 임종 시 대처 — 장소별 탭 ---------- */
document.querySelectorAll('.er-tab').forEach(function(tab){
  tab.addEventListener('click', function(){
    document.querySelectorAll('.er-tab').forEach(function(t){ t.classList.remove('on'); });
    document.querySelectorAll('.er-panel').forEach(function(p){ p.classList.remove('on'); });
    tab.classList.add('on');
    var panel = document.getElementById('er-' + tab.dataset.t);
    if (panel) panel.classList.add('on');
  });
});

// 맨 위로 버튼 (전 페이지 공통)
(function(){
  var btn = document.createElement('button');
  btn.className = 'to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label','맨 위로');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6"/><path d="M6 12l6-6 6 6"/></svg><span class="tt-lab">맨 위로</span>';
  btn.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  document.body.appendChild(btn);
  var toggle = function(){
    if(window.pageYOffset > 500){ btn.classList.add('show'); }
    else { btn.classList.remove('show'); }
  };
  window.addEventListener('scroll', toggle, {passive:true});
  toggle();
})();

// 푸터 제휴 장례식장 로고 (2중 노출·신뢰 / 클릭 시 상세 이동)
(function(){
  var foot = document.querySelector('footer.foot') || document.querySelector('.foot');
  if(!foot) return;
  var halls = [
    ['1000000846','jpg','학동금호장례식장'],['1000000776','jpg','천지장례식장'],
    ['7000001770','jpg','브이아이피장례타운'],['7000001839','jpg','광주국빈장례문화원'],
    ['7000002849','jpg','선한병원장례식장'],['7000001501','jpg','광주남문장례식장'],
    ['1000000427','jpg','성요한병원장례식장'],['7000002578','png','그린장례문화원'],
    ['7000001447','png','구호전장례식장'],['1000000658','jpg','일곡병원장례식장'],
    ['7000001023','jpg','만평장례식장'],['7000003033','jpg','베스트장례문화원'],
    ['7000000584','jpg','광주수완장례식장'],['7000001025','jpg','스카이장례식장'],
    ['1000000453','jpg','송정장례식장'],['1000000484','jpg','신가병원장례식장'],
    ['7000001807','jpg','빛장례식장']
  ];
  var wrap = document.createElement('div');
  wrap.className = 'foot-logos';
  var inner = document.createElement('div');
  inner.className = 'foot-logos-in';
  var lab = document.createElement('div');
  lab.className = 'foot-logos-lab';
  lab.textContent = '함께하는 제휴 장례식장';
  inner.appendChild(lab);
  var grid = document.createElement('div');
  grid.className = 'foot-logos-grid';
  halls.forEach(function(h){
    var a = document.createElement('a');
    a.href = 'hall-detail-' + h[0] + '.html';
    a.setAttribute('aria-label', h[2]);
    var img = document.createElement('img');
    img.src = 'logos/' + h[0] + '.' + h[1];
    img.alt = h[2] + ' 로고';
    img.loading = 'lazy';
    a.appendChild(img);
    grid.appendChild(a);
  });
  inner.appendChild(grid);
  wrap.appendChild(inner);
  foot.parentNode.insertBefore(wrap, foot);
})();
