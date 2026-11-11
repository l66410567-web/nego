/**
 * 빛고을장례119 — 온라인 추모관 저장소
 *   memorial.html?id=코드  ←→  (이 스크립트)  ←→  구글 시트
 *
 * ▣ 시트 구성 (처음설정 을 한 번 실행하면 자동으로 만들어집니다)
 *   추모관  : 장례 한 건당 한 줄. 고인 정보·일정·사진·계좌 등 (담당자가 입력)
 *   헌화    : 조문객이 헌화할 때마다 한 줄씩 쌓임
 *   조문글  : 조문객이 글을 올릴 때마다 한 줄씩 쌓임
 *   → 부적절한 헌화·글은 해당 줄의 '숨김' 칸에 Y 를 적으면 바로 내려갑니다.
 *
 * ▣ 보안 설계
 *   - 추모관 코드는 추측하기 어려운 8자리 임의 문자열 → 링크를 받은 사람만 들어올 수 있음
 *   - '공개' 칸이 Y 가 아니면 아무 정보도 내보내지 않음 (장례 후 닫기)
 *   - '유가족에게만' 표시된 글은 절대 홈페이지로 내보내지 않음
 *   - 계좌는 '계좌공개' 가 Y 일 때만 내보냄
 *   - 허니팟(company) 봇 차단 + 추모관별 분당 30건 제한 + 글자 수 제한
 *
 * ▣ 스크립트 속성 (선택)
 *   SITE_URL : 추모관 페이지 주소 (기본: https://xn--119-hd8l686b5tiiiqgwa.com/memorial.html)
 */

var SITE_URL_DEFAULT = 'https://xn--119-hd8l686b5tiiiqgwa.com/memorial.html';

var MEMORIAL_HEADERS = [
  '코드', '공개', '고인성함', '생년월일', '별세일', '향년', '고인의한마디',
  '상주인사말', '상주서명', '입관', '발인', '화장', '장지명', '장지주소',
  '중계시간', '중계링크', '계좌공개', '은행', '계좌번호', '예금주', '담당지도사', '이름가림',
  '영정사진', '사진1', '사진2', '사진3', '사진4', '사진5', '사진6', '사진7', '사진8', '사진9',
  '젊은날설명', '가족설명', '가족한마디', '웃음설명', '마지막인사', '만든날짜', '메모(비공개)'
];
var FLOWER_HEADERS = ['시각', '코드', '이름', '숨김'];
var MSG_HEADERS = ['시각', '코드', '성함·관계', '내용', '유가족에게만', '숨김'];

/* ======================= 웹앱 ======================= */

function doGet(e) {
  var id = _cleanId(e && e.parameter && e.parameter.id);
  if (!id) return _json({ ok: false, error: 'noid' });

  var cache = CacheService.getScriptCache();
  var hit = cache.get('m_' + id);
  if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);

  var ss = _ss();
  var m = _findMemorial(ss, id);
  if (!m) return _json({ ok: false, error: 'notfound' });
  if (String(m['공개']).trim().toUpperCase() !== 'Y') return _json({ ok: false, error: 'closed' });

  var mask = String(m['이름가림'] || 'Y').trim().toUpperCase() !== 'N';
  var photos = [];
  for (var i = 1; i <= 9; i++) photos.push(_img(m['사진' + i]));

  var out = {
    ok: true,
    m: {
      name: _s(m['고인성함'], 20),
      birth: _d(m['생년월일']), death: _d(m['별세일']), age: _s(m['향년'], 5),
      quote: _s(m['고인의한마디'], 120),
      greeting: _s(m['상주인사말'], 800), sign: _s(m['상주서명'], 60),
      ipgwan: _s(m['입관'], 40), balin: _s(m['발인'], 40), hwajang: _s(m['화장'], 40),
      place: _s(m['장지명'], 40), addr: _s(m['장지주소'], 80),
      liveTime: _s(m['중계시간'], 40), liveUrl: _url(m['중계링크']),
      account: String(m['계좌공개']).trim().toUpperCase() === 'Y'
        ? { bank: _s(m['은행'], 20), no: _s(m['계좌번호'], 30), holder: _s(m['예금주'], 30) } : null,
      director: _s(m['담당지도사'], 20),
      portrait: _img(m['영정사진']),
      photos: photos,
      cap: {
        young: _s(m['젊은날설명'], 80), family: _s(m['가족설명'], 80), familyNote: _s(m['가족한마디'], 120),
        smile: _s(m['웃음설명'], 80), last: _s(m['마지막인사'], 120)
      }
    },
    flowers: _flowers(ss, id, mask),
    msgs: _msgs(ss, id, mask)
  };
  var txt = JSON.stringify(out);
  try { cache.put('m_' + id, txt, 20); } catch (err) {}
  return ContentService.createTextOutput(txt).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = {};
  try {
    var raw = (e.parameter && e.parameter.payload) ? e.parameter.payload
            : ((e.postData && e.postData.contents) || '{}');
    data = JSON.parse(raw);
    if (data.company) return _json({ ok: true });                 // 허니팟

    var id = _cleanId(data.id);
    if (!id) return _json({ ok: false, error: 'noid' });
    if (!_rateOk(id)) return _json({ ok: false, error: 'rate' });

    var ss = _ss();
    var m = _findMemorial(ss, id);
    if (!m || String(m['공개']).trim().toUpperCase() !== 'Y') return _json({ ok: false, error: 'closed' });

    // 앞의 ' 는 구글 시트가 날짜로 바꾸지 않고 글자 그대로 두게 하는 표시
    var now = "'" + Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    if (data.type === 'flower') {
      var nm = _s(data.name, 30) || '익명의 조문객';
      _sheet(ss, '헌화', FLOWER_HEADERS).appendRow([now, id, _noFormula(nm), '']);
    } else if (data.type === 'msg') {
      var body = _s(data.body, 500);
      if (!body) return _json({ ok: false, error: 'empty' });
      var who = _s(data.who, 30) || '익명';
      _sheet(ss, '조문글', MSG_HEADERS).appendRow([now, id, _noFormula(who), _noFormula(body), data.priv ? 'Y' : '', '']);
    } else {
      return _json({ ok: false, error: 'type' });
    }
    CacheService.getScriptCache().remove('m_' + id);
    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

/* ======================= 시트 메뉴 ======================= */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('추모관')
    .addItem('새 추모관 만들기', '새추모관만들기')
    .addItem('선택한 줄의 링크 보기', '링크보기')
    .addSeparator()
    .addItem('처음설정 (최초 1회)', '처음설정')
    .addToUi();
}

/** 최초 1회: 시트 탭과 머리글을 만든다 */
function 처음설정() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  var sh = _sheet(ss, '추모관', MEMORIAL_HEADERS);
  sh.setFrozenRows(1); sh.setFrozenColumns(3);
  _sheet(ss, '헌화', FLOWER_HEADERS).setFrozenRows(1);
  _sheet(ss, '조문글', MSG_HEADERS).setFrozenRows(1);
  var first = ss.getSheets()[0];
  if (first.getName() !== '추모관' && first.getLastRow() === 0 && ss.getSheets().length > 3) ss.deleteSheet(first);
  SpreadsheetApp.getUi().alert('설정이 끝났습니다. 이제 [추모관 → 새 추모관 만들기]로 장례마다 하나씩 만드세요.');
}

/** 장례 한 건 = 한 줄. 고인 성함만 넣으면 코드와 링크를 만들어 준다 */
function 새추모관만들기() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt('새 추모관', '고인 성함을 입력하세요 (예: 홍길동)', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var name = String(r.getResponseText() || '').trim();
  if (!name) return;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = _sheet(ss, '추모관', MEMORIAL_HEADERS);
  var code = _newCode(sh);
  var row = MEMORIAL_HEADERS.map(function (h) {
    if (h === '코드') return code;
    if (h === '공개') return 'N';
    if (h === '고인성함') return name;
    if (h === '계좌공개') return 'N';
    if (h === '이름가림') return 'Y';
    if (h === '만든날짜') return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    return '';
  });
  sh.appendRow(row);
  sh.getRange(sh.getLastRow(), 1, 1, MEMORIAL_HEADERS.length).setNumberFormat('@');
  sh.setActiveRange(sh.getRange(sh.getLastRow(), 3));
  ui.alert('추모관이 만들어졌습니다',
    '고인: ' + name + '\n코드: ' + code + '\n\n링크:\n' + _siteUrl() + '?id=' + code +
    '\n\n※ 지금은 [공개]가 N 입니다. 내용을 채우고 유가족 확인을 받은 뒤 Y 로 바꾸면 열립니다.',
    ui.ButtonSet.OK);
}

function 링크보기() {
  var ui = SpreadsheetApp.getUi();
  var sh = SpreadsheetApp.getActiveSheet();
  if (sh.getName() !== '추모관') { ui.alert('추모관 탭에서 줄을 선택한 뒤 실행하세요.'); return; }
  var r = sh.getActiveRange().getRow();
  if (r < 2) { ui.alert('머리글이 아닌 줄을 선택하세요.'); return; }
  var code = sh.getRange(r, 1).getValue();
  ui.alert('추모관 링크', _siteUrl() + '?id=' + code, ui.ButtonSet.OK);
}

/* ======================= 내부 함수 ======================= */

function _ss() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}
function _siteUrl() {
  return PropertiesService.getScriptProperties().getProperty('SITE_URL') || SITE_URL_DEFAULT;
}
function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function _sheet(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#EFEBE3');
  }
  return sh;
}
function _cleanId(v) {
  var s = String(v || '').trim();
  return /^[A-Za-z0-9]{6,16}$/.test(s) ? s : '';
}
function _newCode(sh) {
  var chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  var used = {};
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().forEach(function (r) { used[r[0]] = 1; });
  var c;
  do { c = ''; for (var i = 0; i < 8; i++) c += chars.charAt(Math.floor(Math.random() * chars.length)); } while (used[c]);
  return c;
}
function _rows(sh) {
  if (!sh || sh.getLastRow() < 2) return [];
  var v = sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getDisplayValues();
  var h = v.shift();
  return v.map(function (r) { var o = {}; h.forEach(function (k, i) { o[String(k).trim()] = r[i]; }); return o; });
}
function _findMemorial(ss, id) {
  var list = _rows(ss.getSheetByName('추모관'));
  for (var i = 0; i < list.length; i++) if (String(list[i]['코드']).trim() === id) return list[i];
  return null;
}
function _flowers(ss, id, mask) {
  return _rows(ss.getSheetByName('헌화'))
    .filter(function (r) { return r['코드'] === id && String(r['숨김']).toUpperCase() !== 'Y'; })
    .slice(-200).reverse()
    .map(function (r) { return (mask ? _mask(r['이름']) : r['이름']) + ' 님'; });
}
function _msgs(ss, id, mask) {
  return _rows(ss.getSheetByName('조문글'))
    .filter(function (r) {
      return r['코드'] === id && String(r['숨김']).toUpperCase() !== 'Y' && String(r['유가족에게만']).toUpperCase() !== 'Y';
    })
    .slice(-200).reverse()
    .map(function (r) {
      return { who: mask ? _mask(r['성함·관계']) : r['성함·관계'], when: String(r['시각']).slice(5, 16).replace('-', '.'), body: r['내용'] };
    });
}
/** '홍길동 · 회사 동료' → '홍○○ · 회사 동료' */
function _mask(s) {
  s = String(s || '');
  var parts = s.split(/\s*[·(]\s*/);
  var name = parts[0], rest = s.slice(name.length);
  if (name === '익명' || name === '익명의 조문객' || name.length < 2) return s;
  return name.charAt(0) + new Array(name.length).join('○') + rest;
}
function _s(v, max) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max); }
function _d(v) { return _s(v, 20).replace(/-/g, '. '); }
function _noFormula(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }
function _url(v) {
  var s = _s(v, 300);
  return /^https:\/\//i.test(s) ? s : '';
}
/** 구글 드라이브 공유 링크·파일ID·일반 https 주소를 이미지 주소로 바꾼다 */
function _img(v) {
  var s = _s(v, 300);
  if (!s) return '';
  var m = s.match(/\/d\/([A-Za-z0-9_-]{20,})/) || s.match(/[?&]id=([A-Za-z0-9_-]{20,})/);
  if (m) return 'https://lh3.googleusercontent.com/d/' + m[1];
  if (/^[A-Za-z0-9_-]{20,}$/.test(s)) return 'https://lh3.googleusercontent.com/d/' + s;
  return /^https:\/\//i.test(s) ? s : '';
}
function _rateOk(id) {
  var cache = CacheService.getScriptCache();
  var k = 'r_' + id + '_' + Math.floor(Date.now() / 60000);
  var n = Number(cache.get(k) || 0) + 1;
  cache.put(k, String(n), 120);
  return n <= 30;
}
