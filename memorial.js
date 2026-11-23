/* ==========================================================
   빛고을장례119 — 온라인 추모관 (memorial.html)
   - memorial.html?id=코드  → 구글 시트(Apps Script)에서 해당 장례 정보를 불러와 표시
   - id 가 없거나 아래 주소가 비어 있으면 → 예시 화면으로 동작 (저장 안 됨)
   ========================================================== */

/* Apps Script 웹앱 배포 후 받은 주소(…/exec)를 넣으면 실제 저장이 시작됩니다 */
var MEMORIAL_API = '';

(function(){
  'use strict';
  var $ = function(id){ return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(location.search);
  var MID = (params.get('id') || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 16);
  var LIVE = !!(MEMORIAL_API && MID);

  /* ── 예시 데이터 (예시 화면에서만 사용) ── */
  var offerers = ['[예시] 김○○ 님 · 고교 동창', '[예시] 이○○ 님 · 회사 동료', '[예시] 박○○ 님 · 이웃', '[예시] 최○○ 님 · 교회 식구', '[예시] 정○○ 님 · 손녀 친구'];
  var msgs = [
    { who: '[예시] 고교 동창', when: '11.08 09:12', body: '멀리 있어 찾아뵙지 못하는 마음이 무겁습니다. 늘 넉넉하게 웃으시던 모습을 오래 기억하겠습니다.' },
    { who: '[예시] 회사 동료', when: '11.08 08:40', body: '삼가 고인의 명복을 빕니다. 유가족분들께 깊은 위로의 마음을 전합니다.' },
    { who: '[예시] 옛 이웃', when: '11.08 07:55', body: '골목에서 마주칠 때마다 먼저 인사해 주시던 분이셨습니다. 편히 쉬십시오.' },
    { who: '[예시] 손녀 친구', when: '11.07 23:18', body: '할아버지 이야기를 들을 때마다 따뜻했어요. 좋은 곳에서 평안하시길 기도합니다.' },
    { who: '[예시] 교회 식구', when: '11.07 21:02', body: '늘 앞자리에서 조용히 함께해 주셨지요. 그 자리가 오래 비어 있을 것 같습니다.' }
  ];

  /* ── 공통 도구 ── */
  function toast(t){
    var el = $('toast'); el.textContent = t; el.classList.add('on');
    clearTimeout(toast._t); toast._t = setTimeout(function(){ el.classList.remove('on'); }, 2400);
  }
  function copyText(text, okMsg){
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){ toast(okMsg); }, function(){ toast('복사가 되지 않았습니다. 길게 눌러 복사해 주세요.'); });
    } else { toast('복사가 되지 않았습니다. 길게 눌러 복사해 주세요.'); }
  }
  function stamp(){
    var d = new Date(), p = function(x){ return (x < 10 ? '0' : '') + x; };
    return p(d.getMonth() + 1) + '.' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function setText(id, v){ var el = $(id); if (el) el.textContent = v; }
  function hide(el){ if (typeof el === 'string') el = $(el); if (el) el.hidden = true, el.style.display = 'none'; }
  function api(method, body){
    var url = MEMORIAL_API + (method === 'GET' ? '?id=' + encodeURIComponent(MID) + '&t=' + Date.now() : '');
    var opt = method === 'GET' ? {} : { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) };
    return fetch(url, opt).then(function(r){ return r.json(); });
  }

  /* ── 제단 국화 ── */
  var flowerSvg = function(s){ return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="#E6DFD1" stroke-width="0.9"><circle cx="12" cy="12" r="2.4"/><ellipse cx="12" cy="5.5" rx="1.9" ry="4"/><ellipse cx="12" cy="18.5" rx="1.9" ry="4"/><ellipse cx="5.5" cy="12" rx="4" ry="1.9"/><ellipse cx="18.5" cy="12" rx="4" ry="1.9"/><ellipse cx="7.4" cy="7.4" rx="1.9" ry="4" transform="rotate(-45 7.4 7.4)"/><ellipse cx="16.6" cy="7.4" rx="1.9" ry="4" transform="rotate(45 16.6 7.4)"/><ellipse cx="7.4" cy="16.6" rx="1.9" ry="4" transform="rotate(45 7.4 16.6)"/><ellipse cx="16.6" cy="16.6" rx="1.9" ry="4" transform="rotate(-45 16.6 16.6)"/></svg>'; };
  $('altar').innerHTML = [16,20,24,28,24,20,16].map(flowerSvg).join('');

  /* ── 헌화 롤링 ── */
  var idx = 0;
  function at(k){ var n = offerers.length; return offerers[((idx + k) % n + n) % n]; }
  function paintRoll(){
    if (!offerers.length) { setText('rollPrev', ''); setText('rollCur', '가장 먼저 국화를 올려 주세요'); setText('rollNext', ''); return; }
    setText('rollPrev', offerers.length > 2 ? at(-1) : '');
    setText('rollCur', at(0) + '이 국화를 올리셨습니다');
    setText('rollNext', offerers.length > 1 ? at(1) : '');
  }
  function stepRoll(){
    if (offerers.length < 2) return;
    if (reduce) { idx = (idx + 1) % offerers.length; paintRoll(); return; }
    $('roll').classList.add('fade');
    setTimeout(function(){ idx = (idx + 1) % offerers.length; paintRoll(); $('roll').classList.remove('fade'); }, 400);
  }
  setInterval(stepRoll, 2800);

  $('giveBtn').addEventListener('click', function(){
    var raw = ($('fWho').value || '').trim();
    var name = raw || '익명의 조문객';
    offerers.splice(offerers.length ? idx : 0, 0, name + ' 님');
    paintRoll();
    $('giveForm').hidden = true;
    $('giveDone').hidden = false;
    if (LIVE) api('POST', { type: 'flower', id: MID, name: raw, company: $('hpCompany').value })
      .then(function(r){ if (!r.ok) toast('헌화가 저장되지 않았습니다. 잠시 후 다시 시도해 주세요.'); })
      .catch(function(){ toast('연결이 원활하지 않아 헌화가 저장되지 않았습니다.'); });
  });

  /* ── 추모의 글 카드 ── */
  var mi = 0, showAll = false, paused = false;
  function paintCard(){
    var n = msgs.length;
    $('toggleAll').hidden = n < 2;
    if (!n) {
      setText('cardBody', '가장 먼저 마음을 남겨 주세요.'); setText('cardWho', ''); setText('cardWhen', ''); setText('pos', '');
      $('dots').innerHTML = ''; return;
    }
    mi = ((mi % n) + n) % n;
    var m = msgs[mi];
    setText('cardBody', m.body);
    setText('cardWho', '— ' + m.who);
    setText('cardWhen', m.when);
    setText('pos', (mi + 1) + ' / ' + n);
    var shown = Math.min(n, 8), html = '';
    for (var k = 0; k < shown; k++) html += '<span' + (k === mi % shown ? ' class="on"' : '') + '></span>';
    $('dots').innerHTML = html;
    setText('toggleAll', showAll ? '접기' : '전체 ' + n + '개 모두 보기');
  }
  function go(d){
    if (msgs.length < 2) return;
    if (reduce) { mi += d; paintCard(); return; }
    var c = $('card'); c.classList.add('fade');
    setTimeout(function(){ mi += d; paintCard(); c.classList.remove('fade'); }, 350);
  }
  function paintAll(){
    var box = $('allList'); box.innerHTML = '';
    msgs.forEach(function(m){
      var d = document.createElement('div'), p = document.createElement('p'), s = document.createElement('span');
      p.textContent = m.body; s.textContent = '— ' + m.who + ' · ' + m.when;
      d.appendChild(p); d.appendChild(s); box.appendChild(d);
    });
  }
  $('card').addEventListener('mouseenter', function(){ paused = true; });
  $('card').addEventListener('mouseleave', function(){ paused = false; });
  setInterval(function(){ if (!showAll && !paused && !document.hidden) go(1); }, 5500);
  $('prevMsg').addEventListener('click', function(){ go(-1); });
  $('nextMsg').addEventListener('click', function(){ go(1); });
  $('toggleAll').addEventListener('click', function(){
    showAll = !showAll;
    if (showAll) paintAll();
    $('allList').hidden = !showAll;
    this.setAttribute('aria-expanded', String(showAll));
    paintCard();
  });

  $('quick').addEventListener('click', function(){ $('pMsg').value = '삼가 고인의 명복을 빕니다.'; $('pMsg').focus(); });
  var sending = false;
  $('submitMsg').addEventListener('click', function(){
    if (sending) return;
    var body = ($('pMsg').value || '').trim();
    if (!body) { setText('writeMsg', '추모의 말씀을 적어주세요.'); $('pMsg').focus(); return; }
    var who = ($('pWho').value || '').trim();
    var priv = $('pPriv').checked;
    var done = function(){
      if (!priv) { msgs.unshift({ who: who || '익명', when: stamp(), body: body }); mi = 0; if (showAll) paintAll(); paintCard(); }
      $('pWho').value = ''; $('pMsg').value = ''; $('pPriv').checked = false;
      setText('writeMsg', priv ? '유가족께만 전해드렸습니다.' : '추모의 글이 올라갔습니다.');
    };
    if (!LIVE) { done(); return; }
    sending = true; setText('writeMsg', '올리는 중입니다…');
    api('POST', { type: 'msg', id: MID, who: who, body: body, priv: priv, company: $('hpCompany').value })
      .then(function(r){
        if (r.ok) done();
        else setText('writeMsg', r.error === 'rate' ? '잠시 후 다시 올려 주세요.' : '글이 저장되지 않았습니다. 잠시 후 다시 시도해 주세요.');
      })
      .catch(function(){ setText('writeMsg', '연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.'); })
      .then(function(){ sending = false; });
  });

  /* ── 마음 전하기 · 공유 ── */
  $('heartToggle').addEventListener('click', function(){
    var open = $('heartBody').hidden;
    $('heartBody').hidden = !open;
    this.setAttribute('aria-expanded', String(open));
    setText('heartLabel', open ? '닫기' : '열기');
  });
  $('copyAcct').addEventListener('click', function(){ copyText($('acctText').textContent, '계좌번호를 복사했습니다.'); });
  $('shareBtn').addEventListener('click', function(){
    var data = { title: document.title, url: location.href };
    if (navigator.share) { navigator.share(data).catch(function(){}); }
    else { copyText(location.href, '추모관 링크를 복사했습니다.'); }
  });
  $('liveLink').addEventListener('click', function(e){
    if (this.getAttribute('href') === '#') { e.preventDefault(); toast('중계는 발인 시간에 시작됩니다.'); }
  });
  $('mapLink').addEventListener('click', function(e){ if (this.getAttribute('href') === '#') e.preventDefault(); });

  /* ── 실제 추모관 그리기 ── */
  function photo(el, url, alt){
    el.textContent = '';
    var img = document.createElement('img');
    img.src = url; img.alt = alt || ''; img.loading = 'lazy'; img.decoding = 'async';
    img.onerror = function(){ el.textContent = '사진을 불러오지 못했습니다'; };
    el.appendChild(img);
  }
  function caption(id, v, fallbackHide){
    if (v) setText(id, v); else if (fallbackHide) hide(id); else setText(id, '');
  }
  function renderMemorial(m){
    var name = m.name || '';
    m.photos = m.photos || [];
    document.title = '故 ' + name + ' 님 온라인 추모관 | 빛고을장례119';
    hide('sampleBar');
    setText('mName', '故 ' + name);
    setText('mWish', '故 ' + name + ' 님의 평안한 영면을 기원합니다');
    if (m.portrait) { photo($('portrait'), m.portrait, '故 ' + name + ' 님 영정'); $('portrait').setAttribute('aria-label', '故 ' + name + ' 님 영정'); }
    if (m.birth || m.death) setText('mDates', (m.birth || '') + ' — ' + (m.death || '')); else hide('mDates');
    if (m.age) setText('mAge', '향년 ' + String(m.age).replace(/세$/, '') + '세'); else hide('mAge');
    if (m.quote) setText('mQuote', '「 ' + m.quote + ' 」'); else hide('mQuote');
    setText('mGreet', m.greeting || '고인께서 가족의 곁에서 평안히 영면에 드셨습니다. 직접 찾아뵙고 인사드리지 못하는 점 너그러이 헤아려 주시기 바랍니다. 이곳에 남겨주시는 마음은 저희 가족이 오래도록 간직하겠습니다.');
    setText('mSign', m.sign || '유가족 일동 올림');

    /* 사진전: 빈 칸·빈 장(章)은 감추고, 사진이 하나도 없으면 사진전 전체를 감춤 */
    var slots = document.querySelectorAll('[data-slot]'), any = false;
    Array.prototype.forEach.call(slots, function(el){
      var url = (m.photos || [])[Number(el.getAttribute('data-slot')) - 1];
      if (url) { any = true; photo(el, url, '故 ' + name + ' 님의 사진'); } else hide(el);
    });
    var chapters = { ch1: [1], ch2: [2,3,4], ch3: [5,6,7,8], ch4: [9] };
    Object.keys(chapters).forEach(function(ch){
      var has = chapters[ch].some(function(n){ return (m.photos || [])[n - 1]; });
      if (!has) hide(ch);
      var lab = $(ch).querySelector('.no');
      if (lab) lab.textContent = { ch1: 'No. 01', ch2: 'No. 02 – 04', ch3: 'No. 05 – 08', ch4: 'No. 09' }[ch];
    });
    var g2 = $('ch2').querySelector('.grid2');
    if (g2 && !(m.photos[1] || m.photos[2])) hide(g2);
    var g3 = $('ch3').querySelector('.grid3');
    if (g3 && !(m.photos[5] || m.photos[6] || m.photos[7])) hide(g3);
    var cap = m.cap || {};
    caption('capYoung', cap.young); caption('capFamily', cap.family); caption('capSmile', cap.smile);
    if (cap.familyNote) setText('famNote', '— 가족의 한마디: ' + cap.familyNote); else hide('famNote');
    if (cap.last) setText('capLast', cap.last); else hide('capLast');
    if (!any) { hide('gallery'); hide('tocGallery'); $('tocGallery').parentNode.style.gridTemplateColumns = 'repeat(3,minmax(0,1fr))'; }

    if (m.liveUrl) { $('liveLink').href = m.liveUrl; $('liveLink').target = '_blank'; $('liveLink').rel = 'noopener'; setText('liveTime', (m.liveTime ? m.liveTime + ' · ' : '') + '중계 보기'); }
    else hide('liveSec');

    setText('sIpgwan', m.ipgwan || '-'); setText('sBalin', m.balin || '-'); setText('sHwa', m.hwajang || '-');
    setText('sPlace', m.place || '-'); setText('sAddr', m.addr || '');
    var q = m.addr || m.place;
    if (q) $('mapLink').href = 'https://map.naver.com/p/search/' + encodeURIComponent(q); else hide('mapLink');

    if (m.director) setText('mDirector', m.director + ' 장례지도사'); else hide('dirSec');
    if (m.account && m.account.no) {
      setText('acctHolder', '상주 ' + (m.account.holder || ''));
      setText('acctText', [m.account.bank, m.account.no].filter(Boolean).join(' '));
    } else hide('heartSec');
  }
  function renderClosed(kind){
    var wrap = document.querySelector('.wrap');
    var msg = kind === 'closed' ? '이 추모관은 유가족의 뜻에 따라 닫혔습니다.'
            : kind === 'notfound' ? '찾으시는 추모관이 없습니다.<br>받으신 링크를 다시 확인해 주세요.'
            : '추모관을 불러오지 못했습니다.<br>잠시 후 다시 열어 주세요.';
    wrap.innerHTML = '<section class="closing" style="min-height:70vh;justify-content:center">' +
      '<img src="logo-symbol.png" alt="" width="64" height="62">' +
      '<p class="condole" style="font-size:18px;line-height:1.8">' + msg + '</p></section>' +
      '<footer><img src="memorial-logo.png" alt="빛고을장례119" width="190" height="118"><span class="pledge">고인께 드리는 최대의 예우</span><div class="bar" aria-hidden="true"></div><a class="tel" href="tel:15339657"><small>상담</small>1533-9657</a></footer>';
  }
  function applyLists(d){
    offerers = d.flowers || []; msgs = d.msgs || [];
    if (idx >= offerers.length) idx = 0;
    paintRoll(); paintCard(); if (showAll) paintAll();
  }

  if (LIVE) {
    var wrap = document.querySelector('.wrap');
    wrap.classList.add('loading');
    offerers = []; msgs = [];
    api('GET').then(function(d){
      wrap.classList.remove('loading');
      if (!d.ok) { renderClosed(d.error); return; }
      renderMemorial(d.m);
      applyLists(d);
      /* 1분마다 새 헌화·글을 다시 불러옴 (화면이 보일 때만) */
      setInterval(function(){
        if (document.hidden || showAll) return;
        api('GET').then(function(n){ if (n.ok) { var keep = mi; applyLists(n); mi = keep; paintCard(); } }).catch(function(){});
      }, 60000);
    }).catch(function(){ wrap.classList.remove('loading'); renderClosed('error'); });
  } else {
    paintRoll();
    paintCard();
  }
})();
