/**
 * 빛고을장례119 — 무료 사전등록 접수
 *   홈페이지 폼 → (이 스크립트) → ① 사장님 휴대폰으로 문자 알림  ② 구글 시트에 명단 저장
 *
 * ▣ 보안 설계
 *   - 알리고 API 키는 이 스크립트의 "스크립트 속성"에만 저장됩니다. 브라우저에는 절대 내려가지 않습니다.
 *   - FORM_TOKEN 으로 1차 차단, 허니팟(company) 으로 봇 차단, 분당 전송량 제한으로 문자 폭탄을 막습니다.
 *
 * ▣ 설정해야 할 스크립트 속성 (확장 프로그램 > Apps Script > 프로젝트 설정 > 스크립트 속성)
 *   ALIGO_KEY      : 알리고 API Key
 *   ALIGO_USER_ID  : 알리고 아이디
 *   ALIGO_SENDER   : 사전 등록된 발신번호 (예: 1533-9657)
 *   NOTIFY_TO      : 알림 받을 사장님 휴대폰 (예: 010-0000-0000). 쉼표로 여러 명 가능
 *   FORM_TOKEN     : 홈페이지 script.js 의 PREREG_TOKEN 과 동일한 임의 문자열
 *   SHEET_ID       : (선택) 명단을 저장할 구글 시트 ID. 비워두면 저장하지 않고 문자만 발송
 */

var P = PropertiesService.getScriptProperties();

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');

    // 1) 허니팟 — 봇이 채우는 숨김 필드. 값이 있으면 조용히 무시
    if (data.company) return _json({ ok: true });

    // 2) 토큰 검증
    var token = P.getProperty('FORM_TOKEN');
    if (token && data.token !== token) return _json({ ok: false, error: 'unauthorized' });

    // 3) 입력 정제·검증
    var name   = String(data.name   || '').trim().slice(0, 20);
    var telRaw = String(data.tel    || '').replace(/[^0-9]/g, '').slice(0, 11);
    var region = String(data.region || '').trim().slice(0, 20);
    var source = String(data.source || '').trim().slice(0, 20);
    var page   = String(data.page   || '').trim().slice(0, 40);
    if (!name || telRaw.length < 10) return _json({ ok: false, error: 'invalid' });

    // 4) 속도 제한 — 1분에 10건 초과 시 차단
    if (!_rateOk()) return _json({ ok: false, error: 'rate' });

    _saveRow(name, telRaw, region, source, page);
    var sms = _sendSms(name, telRaw, region, source);

    return _json({ ok: true, sms: sms });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

/** 브라우저에서 주소를 눌러봤을 때 안내 */
function doGet() {
  return ContentService.createTextOutput('빛고을장례119 사전등록 접수 엔드포인트입니다.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/* ---------------- 내부 함수 ---------------- */

function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function _rateOk() {
  var cache = CacheService.getScriptCache();
  var k = 'rate_' + Math.floor(Date.now() / 60000);
  var n = Number(cache.get(k) || 0) + 1;
  cache.put(k, String(n), 120);
  return n <= 10;
}

function _fmtTel(t) {
  if (t.length === 11) return t.slice(0, 3) + '-' + t.slice(3, 7) + '-' + t.slice(7);
  if (t.length === 10) return t.slice(0, 3) + '-' + t.slice(3, 6) + '-' + t.slice(6);
  return t;
}

var SOURCE_LABEL = {
  all: '전체(홈)', simple: '무빈소250', hall: '장례식장',
  family: '가족장', burial: '수목장·봉안당', relo: '묘 이장·평장'
};

function _saveRow(name, tel, region, source, page) {
  var sheetId = P.getProperty('SHEET_ID');
  if (!sheetId) return;
  var sh = SpreadsheetApp.openById(sheetId).getSheets()[0];
  if (sh.getLastRow() === 0) {
    sh.appendRow(['접수일시', '성함', '연락처', '거주지역', '유입경로', '페이지']);
  }
  sh.appendRow([
    Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
    name, _fmtTel(tel), region, (SOURCE_LABEL[source] || source), page
  ]);
}

function _sendSms(name, tel, region, source) {
  var key = P.getProperty('ALIGO_KEY');
  var uid = P.getProperty('ALIGO_USER_ID');
  var sender = P.getProperty('ALIGO_SENDER');
  var to = P.getProperty('NOTIFY_TO');
  if (!key || !uid || !sender || !to) return 'skip(설정 없음)';

  var msg = '[빛고을장례119] 무료 사전등록\n'
          + '성함: ' + name + '\n'
          + '연락처: ' + _fmtTel(tel) + '\n'
          + '지역: ' + (region || '-') + '\n'
          + '경로: ' + (SOURCE_LABEL[source] || source || '-');

  var res = UrlFetchApp.fetch('https://apis.aligo.in/send/', {
    method: 'post',
    payload: {
      key: key, user_id: uid,
      sender: String(sender).replace(/[^0-9]/g, ''),
      receiver: String(to).replace(/[^0-9,]/g, ''),
      msg: msg,
      title: '사전등록 접수',
      msg_type: 'LMS'
    },
    muteHttpExceptions: true
  });
  return res.getContentText();
}

/* ---------------- 설치 후 1회 실행해서 확인 ---------------- */
function 테스트발송() {
  Logger.log(_sendSms('테스트', '01000000000', '광주', 'all'));
}
