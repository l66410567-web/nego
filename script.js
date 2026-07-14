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
