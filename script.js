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
  if(window.__qwizStart) window.__qwizStart();
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

// 상담 신청 마법사 (모달) — 카테고리 → 시급도 → 핵심 문의 → 신청
(function(){
  var TEL = '15339657', TELD = '1533-9657';
  var CATS = [
    {id:'hall', label:'장례식장', desc:'빈소를 갖춘 장례', q:{t:'예상 조문 규모는요?', o:['30명 이하','30~100명','100명 이상']}},
    {id:'simple', label:'무빈소 장례', desc:'조문 없이 가족끼리 조용히', q:{t:'유골은 어떻게 모실 계획이세요?', o:['봉안당 안치','자연장·수목장','아직 미정']}},
    {id:'family', label:'가족장', desc:'작은 빈소·가까운 분만', q:{t:'예상 조문 규모는요?', o:['가족끼리','30명 이하','30~100명']}},
    {id:'burial', label:'수목장·봉안당', desc:'장지·안치 상담', q:{t:'어떻게 모실 계획이세요?', o:['개인단','부부단','아직 미정']}},
    {id:'relo', label:'묘 이장·평장', desc:'개장·이장·평장', q:{t:'현재 묘는 어떤 형태인가요?', o:['봉분(매장)','납골·봉안','아직 미정']}},
    {id:'pre', label:'사전 상담', desc:'미리 준비하고 싶어요', q:{t:'예상 시기는 어떻게 되세요?', o:['가까운 시일','1년 이내','여유 있게']}}
  ];
  var URG = [
    {v:'urgent', t:'지금 임종하셨어요', s:'긴급'},
    {v:'soon',   t:'임종이 임박했어요', s:''},
    {v:'plan',   t:'미리 알아보고 있어요', s:''}
  ];
  var REG = ['광주','전남','기타 지역'];
  var TIMES = ['지금 바로','오전','오후','저녁','아무때나'];
  var STEPS = 6; // 선택 5단계 + 신청 1
  var st = {cat:null, urg:null, det:null, reg:null, time:null, step:0};

  function box(){ return document.getElementById('qwiz'); }
  function catObj(){ for(var i=0;i<CATS.length;i++){ if(CATS[i].id===st.cat) return CATS[i]; } return CATS[0]; }
  function urgObj(){ for(var i=0;i<URG.length;i++){ if(URG[i].v===st.urg) return URG[i]; } return null; }
  var chev = '<svg class="qw-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

  function head(step){
    var dots='';
    for(var i=0;i<STEPS;i++){ dots += '<i class="'+(i<=step?'on':'')+'"></i>'; }
    var b = step>0 ? '<button type="button" class="qw-back" data-act="back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' : '<span class="qw-back-sp"></span>';
    return '<div class="qw-top">'+b+'<span class="qw-badge">24시간 무료 상담</span><span class="qw-step">'+(step+1)+'/'+STEPS+'</span></div><div class="qw-prog">'+dots+'</div>';
  }
  function opt(act,val,title,sub,extra){
    return '<button type="button" class="qw-opt'+(extra||'')+'" data-act="'+act+'" data-val="'+val+'"><span class="qw-opt-tx"><b>'+title+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span>'+chev+'</button>';
  }
  function optC(act,val){
    return '<button type="button" class="qw-chip" data-act="'+act+'" data-val="'+esc(val)+'">'+esc(val)+'</button>';
  }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  function render(){
    var q = box(); if(!q) return;
    var s = st.step, h = head(s), i;
    if(s===0){
      h += '<h3 class="qw-q">어떤 상담이 필요하세요?</h3><div class="qw-opts">';
      for(i=0;i<CATS.length;i++){ h += opt('cat', CATS[i].id, CATS[i].label, CATS[i].desc); }
      h += '</div>';
    } else if(s===1){
      h += '<h3 class="qw-q">시급하신 상황인가요?</h3><div class="qw-opts">';
      for(i=0;i<URG.length;i++){ h += opt('urg', URG[i].v, URG[i].t, URG[i].s?('<span class=\"qw-urg-tag\">'+URG[i].s+'</span>'):'', URG[i].v==='urgent'?' qw-red':''); }
      h += '</div>';
    } else if(s===2){
      var c = catObj();
      h += '<h3 class="qw-q">'+esc(c.q.t)+'</h3><div class="qw-opts">';
      for(i=0;i<c.q.o.length;i++){ h += opt('det', c.q.o[i], c.q.o[i], ''); }
      h += '</div>';
    } else if(s===3){
      h += '<h3 class="qw-q">어느 지역에서 모시나요?</h3><div class="qw-opts qw-grid">';
      for(i=0;i<REG.length;i++){ h += optC('reg', REG[i]); }
      h += '</div>';
    } else if(s===4){
      h += '<h3 class="qw-q">언제 상담이 편하세요?</h3><div class="qw-opts qw-grid">';
      for(i=0;i<TIMES.length;i++){ h += optC('time', TIMES[i]); }
      h += '</div>';
    } else {
      h += finalHtml();
    }
    q.innerHTML = h;
  }

  function finalHtml(){
    var c = catObj(), u = urgObj();
    var parts = [c.label]; if(u) parts.push(u.t); if(st.det) parts.push(st.det); if(st.reg) parts.push(st.reg); if(st.time) parts.push(st.time);
    var sum = '<div class="qw-sum">';
    for(var k=0;k<parts.length;k++){ sum += '<span>'+esc(parts[k])+'</span>'; }
    sum += '</div>';
    var urgentBlock = '';
    if(st.urg==='urgent' || st.urg==='soon'){
      urgentBlock = '<p class="qf-urgent-msg">긴급 상황은 <b>전화가 가장 빠릅니다.</b> 24시간 상담사가 바로 받습니다.</p>'+
        '<a href="tel:'+TEL+'" class="btn qf-call"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg><span>지금 바로 전화 연결<b>'+TELD+'</b></span></a>'+
        '<div class="qw-or">또는 번호를 남겨주시면 저희가 연락드립니다</div>';
    } else {
      urgentBlock = '<p class="qf-urgent-msg">번호만 남겨주시면 <b>상담사가 바로 연락</b>드립니다.</p>';
    }
    return '<h3 class="qw-q">거의 다 됐어요!</h3>'+sum+urgentBlock+
      '<div class="qw-form">'+
      '<div class="qf-row"><div><label>성함</label><input type="text" id="qwName" placeholder="예) 홍길동"></div><div><label>연락처</label><input type="tel" id="qwTel" placeholder="010-0000-0000"></div></div>'+
      '<label class="agree"><input type="checkbox" id="qwAgree"> 상담을 위한 개인정보 수집·이용에 동의합니다</label>'+
      '<button type="button" class="btn qf-submit" data-act="submit">무료 상담 신청하기</button>'+
      '<p class="qf-trust">급하시면 지금 전화 <a href="tel:'+TEL+'">'+TELD+'</a></p>'+
      '</div>';
  }

  function submit(){
    var q = box(); if(!q) return;
    var name = (q.querySelector('#qwName')||{}).value || '';
    var tel = (q.querySelector('#qwTel')||{}).value || '';
    var agree = (q.querySelector('#qwAgree')||{}).checked;
    if(!name.trim()){ alert('성함을 입력해 주세요.'); return; }
    if(!tel.trim()){ alert('연락처를 입력해 주세요.'); return; }
    if(!agree){ alert('개인정보 수집·이용에 동의해 주세요.'); return; }
    // 시안 — 실제 오픈 시 문자/메일/시트 연동
    alert('상담 신청이 접수되었습니다.\n확인 후 빠르게 연락드리겠습니다.\n\n(시안 단계 — 실제 오픈 시 연동 예정)');
    if(typeof closeModal==='function') closeModal();
    start();
  }

  function onClick(e){
    var btn = e.target.closest ? e.target.closest('[data-act]') : null;
    if(!btn || !box() || !box().contains(btn)) return;
    var act = btn.getAttribute('data-act'), val = btn.getAttribute('data-val');
    if(act==='back'){ if(st.step>0) st.step--; render(); }
    else if(act==='cat'){ st.cat=val; st.step=1; render(); }
    else if(act==='urg'){ st.urg=val; st.step=2; render(); }
    else if(act==='det'){ st.det=val; st.step=3; render(); }
    else if(act==='reg'){ st.reg=val; st.step=4; render(); }
    else if(act==='time'){ st.time=val; st.step=5; render(); }
    else if(act==='submit'){ submit(); }
  }
  document.addEventListener('click', onClick);

  function start(){ st={cat:null,urg:null,det:null,reg:null,time:null,step:0}; render(); }
  window.__qwizStart = start;
  document.addEventListener('DOMContentLoaded', function(){ if(box()) render(); });
  setTimeout(function(){ if(box()) render(); }, 0);
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

/* ---------- 메인 히어로 슬라이더 (3슬라이드) ---------- */
(function(){
  var slider = document.getElementById('heroSlider');
  var track = document.getElementById('hsTrack');
  if(!slider || !track) return;
  var slides = track.children;
  var dots = slider.querySelectorAll('.hs-dot');
  var prevBtn = slider.querySelector('.hs-prev');
  var nextBtn = slider.querySelector('.hs-next');
  var n = slides.length;
  var idx = 0;
  var dir = 1; // 자동재생 진행 방향(1=정방향, -1=역방향) — 1→2→3→2→1 핑퐁 순환용
  var AUTOPLAY_MS = 9000;
  var timer = null;

  // 높이는 CSS 통일 규격(--hsH)이 담당 — JS 높이 조작 없음
  function go(i, user){
    idx = (i + n) % n;
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';
    for(var k=0;k<dots.length;k++){
      var on = k===idx;
      dots[k].classList.toggle('on', on);
      dots[k].setAttribute('aria-selected', on ? 'true' : 'false');
    }
    if(idx >= n-1) dir = -1;
    else if(idx <= 0) dir = 1;
    if(user) restart();
  }
  function next(){ go(idx+dir); }
  function prev(){ go(idx-1); }
  function restart(){
    if(timer) clearInterval(timer);
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stop(){
    if(timer){ clearInterval(timer); timer = null; }
  }

  if(nextBtn) nextBtn.addEventListener('click', function(){ go(idx+1, true); });
  if(prevBtn) prevBtn.addEventListener('click', function(){ go(idx-1, true); });
  dots.forEach(function(d){
    d.addEventListener('click', function(){ go(parseInt(d.getAttribute('data-i'),10), true); });
  });

  // PC: 마우스 호버 시 자동전환 일시정지
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', restart);

  // 모바일: 좌우 스와이프
  var touchX = null, touchY = null;
  slider.addEventListener('touchstart', function(e){
    var t = e.touches[0]; touchX = t.clientX; touchY = t.clientY; stop();
  }, {passive:true});
  slider.addEventListener('touchend', function(e){
    if(touchX===null){ restart(); return; }
    var t = e.changedTouches[0];
    var dx = t.clientX - touchX, dy = t.clientY - touchY;
    if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) go(idx+1); else go(idx-1);
    }
    touchX = null; touchY = null;
    restart();
  });

  go(0);
  restart();
})();

/* ==========================================================
   무료 사전등록 — 컨텍스트별 모달 + 문자(SMS) 알림 연동
   ========================================================== */

/* 연동 설정 — Google Apps Script 웹앱 배포 후 아래 두 값만 채우면 활성화됩니다.
   (비워두면 화면 동작은 그대로, 문자 발송만 건너뜁니다) */
var PREREG_ENDPOINT = '';   // 예) https://script.google.com/macros/s/AKfycb..../exec
var PREREG_TOKEN    = '';   // Apps Script에 설정한 FORM_TOKEN 과 동일한 값

/* 등록 경로별 안내 문구 — 유골함 업그레이드는 '무빈소250 이용 시'에만 해당 */
var PG_MODES = {
  all:    {t:'빛고을장례119 무료 사전등록', s:'등록만 해두시면 <b>빛고을장례119가 제공하는 모든 지원과 제휴 혜택</b>을 이용하실 수 있습니다.', hi:-1},
  simple: {t:'무빈소250 무료 사전등록',   s:'실제 무빈소250 이용 시 <b>고급 진공유골함 업그레이드</b>(62만원 상당)를 받으실 수 있습니다.', hi:1},
  hall:   {t:'빛고을장례119 무료 사전등록', s:'등록만 해두시면 <b>제휴 장례식장 지원</b>을 비롯해 모든 혜택을 이용하실 수 있습니다.', hi:0},
  family: {t:'빛고을장례119 무료 사전등록', s:'등록만 해두시면 <b>가족장 제휴 할인</b>을 비롯해 모든 지원과 혜택을 이용하실 수 있습니다.', hi:0},
  burial: {t:'빛고을장례119 무료 사전등록', s:'등록만 해두시면 <b>수목장·봉안당 제휴 혜택</b>을 비롯해 모든 지원을 이용하실 수 있습니다.', hi:2},
  relo:   {t:'빛고을장례119 무료 사전등록', s:'등록만 해두시면 <b>묘 이장·평장 제휴 혜택</b>을 비롯해 모든 지원을 이용하실 수 있습니다.', hi:3}
};
var PG_BENEFITS = [
  ['제휴 장례식장 지원', '접객실·분향소 · 관·수의·리무진 · 상복·제단장식'],
  ['고급 진공유골함 업그레이드', '62만원 상당 · <b>무빈소250 이용 시</b> 제공'],
  ['수목장·봉안당 제휴 혜택', '봉안함·표지석·관리비 지원'],
  ['묘 이장·평장 제휴 할인', '개장·파묘·이장 절차 지원'],
  ['24시간 전담 연결', '등록 정보가 있어 그날 바로 진행됩니다']
];
var __pgMode = 'all';

function pgBenefitHtml(hi){
  var h = '<ul class="pgm-benefits">';
  for(var i=0;i<PG_BENEFITS.length;i++){
    h += '<li'+(i===hi?' class="on"':'')+'><span class="pgm-chk" aria-hidden="true"></span>'+
         '<span class="pgm-tx"><b>'+PG_BENEFITS[i][0]+'</b><small>'+PG_BENEFITS[i][1]+'</small></span></li>';
  }
  return h + '</ul>';
}
function pgFormHtml(m){
  return '<span class="preg-badge">가입비 0원 · 월 납입금 0원 · 예약금 0원</span>'+
    '<h3 class="preg-title">'+m.t+'</h3>'+
    '<p class="preg-sub">'+m.s+'</p>'+
    pgBenefitHtml(m.hi)+
    '<form class="form" id="pregisterForm" style="padding:0" onsubmit="return submitPreregister(event)">'+
    '<label>성함</label><input type="text" id="pgName" placeholder="예) 홍길동" required>'+
    '<label>휴대전화번호</label><input type="tel" id="pgTel" placeholder="010-0000-0000" required>'+
    '<label>거주지역</label>'+
    '<select id="pgRegion" required><option value="" disabled selected>선택해 주세요</option>'+
    '<option>광주</option><option>전남</option><option>기타 지역</option></select>'+
    '<div class="pg-hp" aria-hidden="true"><label>회사명</label><input type="text" id="pgCompany" tabindex="-1" autocomplete="off"></div>'+
    '<label class="agree"><input type="checkbox" id="pgAgree" required> <span>개인정보 수집·이용에 동의합니다 <a href="privacy.html" target="_blank" rel="noopener">[내용 보기]</a></span></label>'+
    '<p class="preg-consent">수집항목: 성함·휴대전화번호·거주지역 &nbsp;|&nbsp; 목적: 사전등록 접수 및 장례 서비스 안내 &nbsp;|&nbsp; 보유기간: 등록일로부터 5년 또는 삭제 요청 시까지. 동의를 거부하실 수 있으나, 거부 시 사전등록이 불가합니다.</p>'+
    '<button type="submit" class="btn btn-brass" id="pgSubmit">0원 사전등록하기</button>'+
    '<p class="preg-note">※ 사전등록은 상조 가입이 아니며, 어떠한 비용도 발생하지 않습니다.<br>※ 혜택은 광주·전남 제휴 시설 이용 시 적용되며 시설·조건에 따라 범위가 달라질 수 있습니다.</p>'+
    '</form>';
}

function openPreregister(mode){
  var m = document.getElementById('pregisterModal');
  if(!m) return;
  __pgMode = (mode && PG_MODES[mode]) ? mode : 'all';
  var body = document.getElementById('pregisterBody');
  if(body) body.innerHTML = pgFormHtml(PG_MODES[__pgMode]);
  m.classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closePreregister(){
  var m = document.getElementById('pregisterModal');
  if(!m) return;
  m.classList.remove('on');
  document.body.style.overflow = '';
}
(function(){
  var m = document.getElementById('pregisterModal');
  if(!m) return;
  m.addEventListener('click', function(e){ if(e.target.id === 'pregisterModal') closePreregister(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closePreregister(); });
})();

function pgDoneHtml(mode){
  var extra = (mode==='simple')
    ? '사전등록 고객은 실제 무빈소250 이용 시 <b class="preg-hl">고급 진공유골함 업그레이드</b> 혜택을 받으실 수 있습니다.'
    : '사전등록 고객은 <b class="preg-hl">빛고을장례119가 제공하는 모든 지원과 제휴 혜택</b>을 이용하실 수 있습니다.';
  return '<div class="preg-done">'+
    '<span class="preg-done-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>'+
    '<h3>무료 사전등록이<br>완료되었습니다</h3>'+
    '<p>가입비와 월 납입금은 없습니다.<br>장례가 필요하실 때 빛고을장례119로 연락해 주세요.</p>'+
    '<p class="preg-extra">'+extra+'</p>'+
    '<a href="tel:15339657" class="preg-tel"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg>1533-9657</a>'+
    '</div>';
}

function submitPreregister(e){
  e.preventDefault();
  var g = function(id){ return document.getElementById(id); };
  var name = (g('pgName')||{}).value || '';
  var tel  = (g('pgTel')||{}).value || '';
  var region = (g('pgRegion')||{}).value || '';
  var agree = (g('pgAgree')||{}).checked;
  var hp = (g('pgCompany')||{}).value || '';   // 허니팟(봇 차단)
  name = name.trim(); tel = tel.trim();

  if(!name){ alert('성함을 입력해 주세요.'); return false; }
  if(tel.replace(/[^0-9]/g,'').length < 10){ alert('휴대전화번호를 정확히 입력해 주세요.'); return false; }
  if(!region){ alert('거주지역을 선택해 주세요.'); return false; }
  if(!agree){ alert('개인정보 수집·이용에 동의해 주세요.'); return false; }

  var btn = g('pgSubmit');
  if(btn){ btn.disabled = true; btn.textContent = '등록 중...'; }

  var payload = {
    token: PREREG_TOKEN,
    name: name,
    tel: tel,
    region: region,
    source: __pgMode,
    page: (location.pathname.split('/').pop() || 'index.html'),
    company: hp
  };

  var done = function(){
    var body = document.getElementById('pregisterBody');
    if(body) body.innerHTML = pgDoneHtml(__pgMode);
  };

  if(!PREREG_ENDPOINT){
    // 미연동 상태 — 화면만 완료 처리 (콘솔로 확인 가능)
    if(window.console) console.warn('[사전등록] PREREG_ENDPOINT 미설정 — 문자 발송 건너뜀', payload);
    done();
    return false;
  }

  fetch(PREREG_ENDPOINT, {
    method: 'POST',
    // 단순 요청으로 보내 CORS 사전요청(preflight)을 피함
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  }).then(function(r){ return r.json(); })
    .catch(function(){ return {ok:false}; })
    .then(function(res){
      if(!res || !res.ok){
        if(window.console) console.warn('[사전등록] 전송 실패', res);
      }
      // 전송 실패해도 이용자에게는 접수 안내 (전화 CTA 제공)
      done();
    });
  return false;
}
