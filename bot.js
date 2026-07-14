/* ==========================================================
   빛고을장례119 — 상담봇
   버튼 선택형(시나리오) 방식. 서버·API 불필요.
   모든 경로의 끝은 "전화 상담"으로 연결됩니다.
   ========================================================== */
(function(){

const TEL = '1533-9657';

// ---------- 대화 시나리오 ----------
const BOT = {
  start: {
    msg: '안녕하세요. 빛고을장례119입니다.\n무엇을 도와드릴까요?',
    opts: [
      { t: '🚨 지금 임종하셨습니다',   go: 'urgent' },
      { t: '💰 비용이 궁금합니다',      go: 'cost' },
      { t: '🎁 어떤 혜택이 있나요',     go: 'benefit' },
      { t: '📋 장례 절차를 알고 싶어요', go: 'process' },
      { t: '🌳 장지(수목장·봉안당) 문의', go: 'burial' },
      { t: '🕊 조용히 치르고 싶어요',   go: 'simple' },
      { t: '⚱️ 묘 이장·개장 문의',      go: 'reloc' },
      { t: '📅 미리 준비하고 싶어요',   go: 'pre' },
    ]
  },

  /* ===== 긴급 ===== */
  urgent: {
    msg: '먼저 마음을 추스르세요.\n어디에서 임종하셨나요?',
    opts: [
      { t: '병원',            go: 'u_hospital' },
      { t: '요양병원 · 요양원', go: 'u_care' },
      { t: '자택',            go: 'u_home' },
      { t: '호스피스',        go: 'u_hospice' },
    ]
  },
  u_hospital: {
    msg: '병원이라면 절차가 비교적 간단합니다.\n\n① 담당 의사가 사망을 확인하고 사망진단서를 발급합니다\n② 진단서는 최소 5부 이상 받아두세요 (장례·화장·상속·보험에 각각 필요)\n③ 병원에서 장례식장을 권해도, 그곳으로 꼭 가셔야 하는 것은 아닙니다\n\n원하시는 장례식장으로 운구차를 보내드립니다.',
    link: 'emergency.html',
    linkT: '병원 임종 대처 자세히 보기',
    end: true
  },
  u_care: {
    msg: '요양병원은 의사가 있어 사망진단서가 바로 발급됩니다.\n(요양원은 의사가 없을 수 있어 시설에 먼저 확인하세요)\n\n시설에서 특정 장례식장을 연결하려 할 수 있는데,\n그 제안을 따르실 의무는 없습니다.\n최종 결정권은 가족에게 있습니다.\n\n원하시는 곳으로 모셔드립니다.',
    link: 'emergency.html',
    linkT: '요양시설 임종 대처 자세히 보기',
    end: true
  },
  u_home: {
    msg: '⚠️ 자택은 절차가 다릅니다. 순서를 꼭 지켜주세요.\n\n【절대 하지 마세요】\n· 시신을 옮기거나 자세를 바꾸지 마세요\n· 주변을 정리하지 마세요\n\n손을 대면 변사 처리되어 부검까지 갈 수 있습니다.\n\n【먼저 하실 일】\n· 평소 다니던 병원·호스피스가 있다면 → 주치의에게 먼저 연락\n· 없다면 → 119에 신고\n\n판단이 어려우시면 바로 전화 주세요.',
    link: 'emergency.html',
    linkT: '자택 임종 대처 자세히 보기',
    end: true,
    urgent: true
  },
  u_hospice: {
    msg: '호스피스는 24시간 연락 체계가 갖춰져 있습니다.\n등록된 번호로 연락하시면 의료진이 대응합니다.\n\n입원형이든 가정형이든 의료진이 사망을 확인하므로,\n119 신고나 경찰 출동 절차 없이 진행됩니다.\n\n급하게 서두르지 않으셔도 됩니다.\n가족과 마지막 인사를 나눌 시간을 충분히 가지세요.\n\n준비되시면 연락 주십시오.',
    link: 'emergency.html',
    linkT: '호스피스 임종 대처 자세히 보기',
    end: true
  },

  /* ===== 비용 ===== */
  cost: {
    msg: '비용은 조문객 규모, 장례식장, 장지 선택에 따라 크게 달라집니다.\n\n어떤 규모를 생각하고 계신가요?',
    opts: [
      { t: '가족끼리 조용히 (30명 이하)', go: 'c_small' },
      { t: '일반적인 규모 (30~100명)',    go: 'c_mid' },
      { t: '많은 조문객 (100명 이상)',     go: 'c_big' },
      { t: '빈소 없이 최소한으로',         go: 'simple' },
    ]
  },
  c_small: {
    msg: '가족장이라면 비용을 많이 줄이실 수 있습니다.\n\n【제휴 혜택으로 받으시는 것】\n· 수의 · 관 기본 제공\n· 소규모 빈소 1실\n· 리무진 1회 무료\n· 장례지도사 1:1 배정\n· 봉안당 표지석 무료\n\n정확한 금액은 시설과 상황에 따라 달라집니다.\n상담 시 예상 범위를 먼저 알려드립니다.',
    link: 'hall.html',
    linkT: '패키지 자세히 보기',
    end: true
  },
  c_mid: {
    msg: '가장 많은 분들이 선택하시는 규모입니다.\n\n【제휴 혜택으로 받으시는 것】\n· 수의 · 관 · 상복 최대 무료\n· 접객실 포함 빈소\n· 리무진 최대 무료 + 제단 장식 지원\n· 수목장 봉안함·표지석 무료 + 관리비 1년 지원\n\n※ 시설과 규모에 따라 혜택이 달라집니다.\n정확한 내용은 상담 시 확인해드립니다.',
    link: 'hall.html',
    linkT: '패키지 자세히 보기',
    end: true
  },
  c_big: {
    msg: '규모가 크실수록 혜택 범위도 넓어집니다.\n\n【제휴 혜택으로 받으시는 것】\n· 전 품목 최대 무료 제공\n· 대형 빈소 우선 배정\n· 제단 장식 고급형 지원\n· 프리미엄 표지석 무료 + 관리비 3년 지원\n· 사후행정 · 상속 안내 포함\n\n정확한 조건은 장례식장마다 다릅니다.\n어느 곳을 원하시는지 말씀해주시면 확인해드립니다.',
    link: 'hall.html',
    linkT: '패키지 자세히 보기',
    end: true
  },

  /* ===== 혜택 ===== */
  benefit: {
    msg: '저희를 통하시면, 소개나 부탁 없이도\n누구나 같은 혜택을 받으실 수 있습니다.\n\n어느 쪽이 궁금하신가요?',
    opts: [
      { t: '장례식장 혜택',       go: 'b_hall' },
      { t: '수목장 · 봉안당 혜택', go: 'b_burial' },
      { t: '왜 소개 없이도 되나요?', go: 'b_why' },
    ]
  },
  b_hall: {
    msg: '【장례식장 이용 시】\n\n· 접객실 · 분향소 이용료 최대 무료\n· 관 · 수의 · 상복 최대 무료\n· 운구 리무진 최대 무료\n· 제단 장식 비용 지원\n· 장례지도사 1:1 배정\n\n※ 시설과 조문객 규모에 따라 제공되는 혜택이 달라집니다.\n\n광주 21개 장례식장 어디든 문의 주시면,\n그곳에서 받으실 수 있는 혜택을 확인해 알려드립니다.',
    link: 'hall.html',
    linkT: '장례식장 자세히 보기',
    end: true
  },
  b_burial: {
    msg: '장례식장 연결에서 끝나지 않습니다.\n\n【수목장 · 봉안당 이용 시】\n\n· 봉안함 무료 제공\n· 표지석 무료 제공\n· 관리비 지원 (패키지에 따라 1~3년)\n· 화장장에서 장지까지 이동 안내\n\n※ 시설과 규모에 따라 혜택이 달라집니다.\n\n공설 추모관과 비교해서 장단점을 그대로 알려드립니다.',
    link: 'burial.html',
    linkT: '수목장·봉안당 자세히 보기',
    end: true
  },
  b_why: {
    msg: '지금까지는 지인이나 병원 관계자를 통해야\n장례식장 혜택을 받을 수 있었습니다.\n\n저희는 광주·전남 장례식장과 직접 제휴 채널을\n갖고 있습니다.\n\n그래서 누구나 전화 한 통으로 같은 혜택을\n받으실 수 있습니다.\n\n부탁하실 필요도, 눈치 보실 필요도 없습니다.\n혜택은 부탁이 아니라 당연한 권리입니다.',
    link: 'about.html',
    linkT: '빛고을장례119란? 자세히 보기',
    end: true
  },

  /* ===== 절차 ===== */
  process: {
    msg: '장례는 보통 3일장으로 치릅니다.\n\n법적으로 사망 시각으로부터 24시간이 지나야\n화장이 가능하기 때문입니다.\n\n【3일장 흐름】\n1일차 — 임종 · 안치 · 빈소 준비 · 부고\n2일차 — 조문 · 입관 · 성복\n3일차 — 발인 · 화장 · 장지 안치\n\n어느 단계가 궁금하신가요?',
    opts: [
      { t: '임종 직후 무엇부터?',  go: 'urgent' },
      { t: '서류는 뭘 준비하나요?', go: 'p_doc' },
      { t: '장례 후 행정 절차는?',  go: 'p_after' },
    ]
  },
  p_doc: {
    msg: '【사망진단서 (또는 시체검안서)】\n\n최소 5부 이상 발급받으세요.\n· 장례 절차용\n· 화장 신청용\n· 상속 처리용\n· 보험 청구용\n\n각각 원본이 필요합니다.\n나중에 다시 떼려면 병원에 또 가야 합니다.\n\n【영정 사진】\n고인의 평소 모습이 담긴 사진을 찾아두세요.\n\n나머지 서류는 저희가 안내해드립니다.',
    link: 'emergency.html',
    linkT: '임종 시 대처 자세히 보기',
    end: true
  },
  p_after: {
    msg: '급하게 하지 않으셔도 되는 것들입니다.\n\n【사망신고】\n법적으로 1개월 이내에만 하시면 됩니다.\n\n【보험 청구 · 상속】\n장례를 마친 뒤 천천히 처리하셔도 됩니다.\n\n지금은 고인과의 마지막 시간에 집중하셔도 괜찮습니다.\n\n필요하시면 사후 행정 절차도 안내해드립니다.',
    end: true
  },

  /* ===== 장지 ===== */
  burial: {
    msg: '장지는 크게 세 가지로 나뉩니다.\n\n어느 쪽을 생각하고 계신가요?',
    opts: [
      { t: '수목장 · 자연장',   go: 'bu_tree' },
      { t: '봉안당 (납골당)',   go: 'bu_col' },
      { t: '공설 추모관과 비교', go: 'bu_cmp' },
      { t: '아직 못 정했어요',   go: 'bu_undecided' },
    ]
  },
  bu_tree: {
    msg: '【수목장 · 자연장】\n\n나무 아래 자연으로 돌아가는 방식입니다.\n· 답답한 실내가 아닌 열린 자연\n· 관리 부담이 적음\n· 봉안함 · 표지석 무료 제공\n\n제휴 시설을 직접 보여드리고,\n원하시는 위치를 고르실 수 있습니다.',
    link: 'burial.html',
    linkT: '수목장 자세히 보기',
    end: true
  },
  bu_col: {
    msg: '【봉안당 (납골당)】\n\n실내에 안치하는 방식입니다.\n· 사찰 봉안당 포함 여러 시설 비교 가능\n· 위치와 층을 직접 선택\n· 봉안함 · 표지석 무료 + 관리비 지원\n\n원하시는 조건을 말씀해주시면\n맞는 곳을 찾아드립니다.',
    link: 'burial.html',
    linkT: '봉안당 자세히 보기',
    end: true
  },
  bu_cmp: {
    msg: '【공설 추모관】\n· 비용이 저렴함\n· 사용 기간 제한 (만기 후 재이장 필요)\n· 위치를 유가족이 정하기 어려움\n· 명절 교통 정체가 심함\n\n【제휴 수목장 · 봉안당】\n· 장기 안치 가능\n· 원하는 위치 선택 가능\n· 봉안함 · 표지석 무료 + 관리비 지원\n\n어느 쪽이 무조건 낫다고 말씀드리지 않습니다.\n가족 상황에 맞는 선택을 하실 수 있도록\n장단점을 그대로 알려드립니다.',
    link: 'burial.html',
    linkT: '비교표 자세히 보기',
    end: true
  },
  bu_undecided: {
    msg: '괜찮습니다. 대부분 그러십니다.\n\n다만 화장 당일 우왕좌왕하지 않으시려면\n미리 정해두시는 것이 좋습니다.\n\n가족 상황(예산, 접근성, 원하시는 분위기)을\n말씀해주시면 맞는 곳을 몇 군데 추려드립니다.\n\n직접 보시고 정하셔도 됩니다.',
    link: 'burial.html',
    linkT: '장지 종류 살펴보기',
    end: true
  },

  /* ===== 무빈소 ===== */
  simple: {
    msg: '【무빈소 장례】\n\n빈소를 차리지 않고, 가까운 가족만 모여\n화장과 안치를 진행하는 방식입니다.\n\n· 빈소 임대료 · 접객 음식 비용이 들지 않음\n· 조문객 응대 부담이 없음\n· 전체 비용이 크게 줄어듦\n\n【그래도 받으시는 혜택】\n· 관 · 수의 최대 무료\n· 운구 · 안치 서비스\n· 장례지도사 1:1 배정\n· 수목장 · 봉안당 봉안함 · 표지석 무료\n\n빈소를 차리지 않아도\n고인을 모시는 예우는 똑같이 갖춥니다.',
    link: 'simple.html',
    linkT: '무빈소 장례 자세히 보기',
    end: true
  },

  /* ===== 이장 ===== */
  reloc: {
    msg: '【묘 이장 · 개장】\n\n개장허가 서류부터 파묘, 화장,\n새 장지 안치까지 전 과정을 대행합니다.\n\n① 상담 및 현장 확인\n② 개장 신고 · 허가 서류 (저희가 대행)\n③ 택일 및 개장 준비\n④ 파묘 · 수습\n⑤ 화장\n⑥ 새 장지 안치\n\n유가족이 직접 뛰어다니지 않으셔도 됩니다.\n이때도 봉안함 · 표지석 무료 혜택을\n그대로 받으실 수 있습니다.',
    link: 'relocation.html',
    linkT: '묘 이장·개장 자세히 보기',
    end: true
  },

  /* ===== 사전 준비 ===== */
  pre: {
    msg: '미리 준비하시는 것, 정말 잘하신 선택입니다.\n\n임종이 임박한 상황에서는 경황이 없어\n제대로 비교하기 어렵습니다.\n\n미리 절차와 비용을 확인해두시면\n그 순간 훨씬 침착하게 대응하실 수 있습니다.\n\n【사전 상담에서 하는 것】\n· 장례식장 비교 및 혜택 확인\n· 장지(수목장 · 봉안당) 미리 둘러보기\n· 예상 비용 안내\n· 필요 서류 안내\n\n부담 없이 문의하셔도 됩니다.\n상담 후 반드시 이용하셔야 하는 것은 아닙니다.',
    end: true
  },
};

// ---------- 위젯 만들기 ----------
const wrap = document.createElement('div');
wrap.className = 'bot-wrap';
wrap.innerHTML = `
  <button class="bot-fab" id="botFab" aria-label="상담봇 열기">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <span class="bot-fab-dot"></span>
  </button>

  <div class="bot-win" id="botWin" role="dialog" aria-label="상담봇">
    <div class="bot-head">
      <div class="bot-head-l">
        <span class="bot-avatar">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="5" y="15" width="14" height="3" rx="1" fill="#3A3A3A"/>
            <path d="M7 15C7 9 9.5 5.5 12 5.5S17 9 17 15Z" fill="#D93025"/>
          </svg>
        </span>
        <div>
          <b>빛고을장례119 상담</b>
          <span class="bot-on">● 24시간 연결 가능</span>
        </div>
      </div>
      <button class="bot-x" id="botX" aria-label="닫기">✕</button>
    </div>

    <div class="bot-body" id="botBody"></div>

    <div class="bot-foot">
      <a href="tel:${TEL.replace('-','')}" class="bot-tel">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg>
        전화 상담 ${TEL}
      </a>
      <button class="bot-reset" id="botReset">처음으로</button>
    </div>
  </div>
`;
document.body.appendChild(wrap);

const win  = document.getElementById('botWin');
const body = document.getElementById('botBody');
const fab  = document.getElementById('botFab');

function scrollDown(){ setTimeout(function(){ body.scrollTop = body.scrollHeight; }, 60); }

function addBot(text){
  const d = document.createElement('div');
  d.className = 'bot-msg';
  d.innerHTML = '<span class="bot-bub">' + text.replace(/\n/g, '<br>') + '</span>';
  body.appendChild(d);
  scrollDown();
}

function addUser(text){
  const d = document.createElement('div');
  d.className = 'bot-msg me';
  d.innerHTML = '<span class="bot-bub">' + text + '</span>';
  body.appendChild(d);
  scrollDown();
}

function render(key){
  const node = BOT[key];
  if (!node) return;

  addBot(node.msg);

  // 선택지
  if (node.opts){
    const box = document.createElement('div');
    box.className = 'bot-opts';
    node.opts.forEach(function(o){
      const b = document.createElement('button');
      b.className = 'bot-opt';
      b.textContent = o.t;
      b.addEventListener('click', function(){
        box.remove();
        addUser(o.t);
        render(o.go);
      });
      box.appendChild(b);
    });
    body.appendChild(box);
    scrollDown();
  }

  // 종료 노드 — 전화 연결로 유도
  if (node.end){
    const box = document.createElement('div');
    box.className = 'bot-end';

    const cta = document.createElement('div');
    cta.className = 'bot-cta' + (node.urgent ? ' urgent' : '');
    cta.innerHTML =
      '<p>' + (node.urgent
        ? '<b>지금 바로 전화 주세요.</b><br>순서대로 알려드리고 운구차가 즉시 출동합니다.'
        : '더 자세한 내용은 전화로 안내해드립니다.<br>상담은 무료이며, 이용 의무는 없습니다.') + '</p>' +
      '<a href="tel:' + TEL.replace('-','') + '" class="bot-call">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg>' +
        TEL + ' 전화하기</a>';
    box.appendChild(cta);

    if (node.link){
      const a = document.createElement('a');
      a.className = 'bot-link';
      a.href = node.link;
      a.textContent = '📄 ' + node.linkT + ' →';
      box.appendChild(a);
    }

    const again = document.createElement('button');
    again.className = 'bot-again';
    again.textContent = '↩ 다른 것도 물어볼게요';
    again.addEventListener('click', function(){ reset(); });
    box.appendChild(again);

    body.appendChild(box);
    scrollDown();
  }
}

function reset(){
  body.innerHTML = '';
  render('start');
}

// ---------- 열고 닫기 ----------
fab.addEventListener('click', function(){
  win.classList.add('on');
  fab.classList.add('hide');
  if (!body.children.length) reset();
});
document.getElementById('botX').addEventListener('click', function(){
  win.classList.remove('on');
  fab.classList.remove('hide');
});
document.getElementById('botReset').addEventListener('click', reset);
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape' && win.classList.contains('on')){
    win.classList.remove('on');
    fab.classList.remove('hide');
  }
});

})();
