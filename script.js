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
