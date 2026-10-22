/**
 * 빛고을장례119 — 무료 사전등록 접수
 *   홈페이지 폼 → (이 스크립트) → ① 사장님 휴대폰으로 문자 알림  ② 구글 시트에 명단 저장
 *
 * ▣ 보안 설계
 *   - 솔라피 API Key/Secret은 이 스크립트의 "스크립트 속성"에만 저장됩니다. 브라우저에는 절대 내려가지 않습니다.
 *   - FORM_TOKEN 으로 1차 차단, 허니팟(company) 으로 봇 차단, 분당 전송량 제한으로 문자 폭탄을 막습니다.
 *
 * ▣ 설정해야 할 스크립트 속성 (프로젝트 설정 > 스크립트 속성)
 *   SOLAPI_API_KEY    : 솔라피 API Key
 *   SOLAPI_API_SECRET : 솔라피 API Secret
 *   SENDER            : 사전 등록된 발신번호 (예: 1533-9657)
 *   NOTIFY_TO         : 알림 받을 사장님 휴대폰 (예: 010-0000-0000). 쉼표로 여러 명 가능
 *   CUSTOMER_SMS      : (선택) 'off' 로 설정하면 고객 접수확인 문자를 보내지 않음 (기본: 발송)
 *   FORM_TOKEN        : 홈페이지 script.js 의 PREREG_TOKEN 과 동일한 임의 문자열
 *   SHEET_ID          : (선택) 명단을 저장할 구글 시트 ID. 비워두면 저장하지 않고 문자만 발송
 */

var P = PropertiesService.getScriptProperties();

function doPost(e) {
  var data = {};
  try {
    // fetch 는 본문(JSON)으로, 폼 폴백(CORS 우회)은 payload 파라미터로 들어온다
    var raw = (e.parameter && e.parameter.payload) ? e.parameter.payload
            : ((e.postData && e.postData.contents) || '{}');
    data = JSON.parse(raw);

    // 1) 허니팟 — 봇이 채우는 숨김 필드. 값이 있으면 조용히 무시
    if (data.company) { _log('bot', data); return _json({ ok: true }); }

    // 2) 토큰 검증
    var token = P.getProperty('FORM_TOKEN');
    if (token && data.token !== token) { _log('unauthorized', data); return _json({ ok: false, error: 'unauthorized' }); }

    // 3) 입력 정제·검증
    var name   = String(data.name   || '').trim().slice(0, 20);
    var telRaw = String(data.tel    || '').replace(/[^0-9]/g, '').slice(0, 11);
    var region = String(data.region || '').trim().slice(0, 20);
    var source = String(data.source || '').trim().slice(0, 20);
    var page   = String(data.page   || '').trim().slice(0, 40);
    var memo   = String(data.memo   || '').trim().slice(0, 60);   // 상담신청: 선택 내용 요약
    if (!name || telRaw.length < 10) { _log('invalid', data); return _json({ ok: false, error: 'invalid' }); }

    // 4) 속도 제한 — 1분에 10건 초과 시 차단
    if (!_rateOk()) { _log('rate', data); return _json({ ok: false, error: 'rate' }); }

    // 5) 중복 방지 — 전송 폴백 때문에 같은 접수가 두 번 들어와도 한 번만 처리 (3분)
    if (_isDup(telRaw, source)) { _log('dup', data); return _json({ ok: true, dup: true }); }

    var row = _saveRow(name, telRaw, region, source, page, memo);
    var sms = _sendSms(name, telRaw, region, source, memo);
    _markSms(row, sms);
    _log('ok', data);

    return _json({ ok: true, sms: sms });
  } catch (err) {
    _log('error', data, String(err));
    return _json({ ok: false, error: String(err) });
  }
}

/** 같은 번호·같은 경로의 접수가 3분 안에 또 오면 중복으로 본다 */
function _isDup(tel, source) {
  var cache = CacheService.getScriptCache();
  var k = 'dup_' + tel + '_' + source;
  if (cache.get(k)) return true;
  cache.put(k, '1', 180);
  return false;
}

/** 모든 접수 시도를 '접수로그' 시트에 남긴다(성공·거절·오류 모두) — 접수가 안 됐다는 문의가 오면 여기서 원인을 본다 */
function _log(status, data, note) {
  try {
    var sheetId = P.getProperty('SHEET_ID');
    if (!sheetId) return;
    var ss = SpreadsheetApp.openById(sheetId);
    var sh = ss.getSheetByName('접수로그') || ss.insertSheet('접수로그', ss.getNumSheets());
    if (sh.getLastRow() === 0) sh.appendRow(['시각', '결과', '유입경로', '페이지', '연락처 끝4자리', '비고']);
    var d = data || {};
    sh.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
      status, String(d.source || ''), String(d.page || ''),
      String(d.tel || '').replace(/[^0-9]/g, '').slice(-4), note || ''
    ]);
  } catch (err) { /* 로그 실패가 접수를 막으면 안 됨 */ }
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
  family: '가족장', burial: '수목장·봉안당', relo: '묘 이장·평장',
  consult: '상담신청'
};

function _saveRow(name, tel, region, source, page, memo) {
  var sheetId = P.getProperty('SHEET_ID');
  if (!sheetId) return null;
  var sh = SpreadsheetApp.openById(sheetId).getSheets()[0];
  if (sh.getLastRow() === 0) {
    sh.appendRow(['접수일시', '성함', '연락처', '거주지역', '유입경로', '페이지', '문자결과', '메모']);
  } else if (!sh.getRange(1, 8).getValue()) {
    sh.getRange(1, 8).setValue('메모');
  }
  sh.appendRow([
    Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
    name, _fmtTel(tel), region, (SOURCE_LABEL[source] || source), page, '', memo || ''
  ]);
  return { sh: sh, r: sh.getLastRow() };
}

/** 시트 마지막 열에 문자 발송 결과(성공/실패 사유)를 남김 — 문자가 안 왔을 때 원인 추적용 */
function _markSms(row, sms) {
  if (!row) return;
  var txt = String(sms);
  try {
    var j = JSON.parse(txt);
    if (j.failedMessageList && j.failedMessageList.length) {
      txt = '실패: ' + JSON.stringify(j.failedMessageList).slice(0, 150);
    } else if (j.groupInfo && j.groupInfo.count) {
      txt = '접수 ' + j.groupInfo.count.registeredSuccess + '건 (발송그룹 ' + j.groupInfo._id + ')';
    } else if (j.errorCode || j.errorMessage) {
      txt = '오류: ' + (j.errorCode || '') + ' ' + (j.errorMessage || '');
    }
  } catch (e) {}
  row.sh.getRange(row.r, 7).setValue(txt.slice(0, 200));
}

function _hex(bytes) {
  return bytes.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

/** 문자 길이(바이트) — 한글 등 2바이트, 영문·숫자·기호 1바이트. 90바이트 이하면 단문(SMS) 요금 */
function _bytes(str) {
  var n = 0;
  for (var i = 0; i < str.length; i++) n += (str.charCodeAt(i) > 127) ? 2 : 1;
  return n;
}

/** 이름이 길어 90바이트를 넘으면 이름을 잘라서 단문 유지 */
function _fitName(build, name) {
  var nm = name;
  while (nm.length > 1 && _bytes(build(nm)) > 90) nm = nm.slice(0, -1);
  return build(nm);
}

/** 사장님 알림 문구 — 90바이트를 넘으면 메모 → 이름 순으로 줄여 단문 유지 */
function _fitOwner(kind, name, tel, region, memo) {
  var nm = name, mm = memo;
  var build = function () { return '[빛고을119] ' + kind + '\n' + nm + ' ' + tel + '\n' + region + '/' + mm; };
  while (mm.length > 1 && _bytes(build()) > 90) mm = mm.slice(0, -1);
  while (nm.length > 1 && _bytes(build()) > 90) nm = nm.slice(0, -1);
  return build();
}

function _sendSms(name, tel, region, source, memo) {
  var apiKey = P.getProperty('SOLAPI_API_KEY');
  var apiSecret = P.getProperty('SOLAPI_API_SECRET');
  var sender = P.getProperty('SENDER');
  var to = P.getProperty('NOTIFY_TO');
  if (!apiKey || !apiSecret || !sender || !to) return 'skip(설정 없음)';

  var src = SOURCE_LABEL[source] || source || '-';
  var isConsult = (source === 'consult');

  // 사장님 알림 — 90바이트 이내(단문 18원). 상담신청은 선택 내용(memo)을 줄여서 함께 표시
  var ownerMsg = _fitOwner(isConsult ? '상담신청' : '사전등록', name, _fmtTel(tel), region || '-',
                           isConsult ? (memo || src) : src);

  // 고객 접수확인 — 고객에게 가는 거래성 안내 (광고성 문구 없음).
  // 90바이트 이하 단문(18원) 고정 문구 — 이름 등을 넣으면 장문(45원)으로 바뀌므로 넣지 말 것
  var custMsg = isConsult
    ? '[빛고을장례119] 상담신청이 접수되었습니다. 담당 의전지도사가 추후 연락드립니다. 감사합니다'
    : '[빛고을장례119] 사전등록이 접수되었습니다. 담당 의전지도사가 추후 연락드립니다. 감사합니다';

  var fromNum = String(sender).replace(/[^0-9]/g, '');
  var toList = String(to).split(',')
    .map(function (s) { return s.trim().replace(/[^0-9]/g, ''); })
    .filter(function (s) { return s; });
  var messages = toList.map(function (t) { return { to: t, from: fromNum, text: ownerMsg }; });

  var sendCust = String(P.getProperty('CUSTOMER_SMS') || '').toLowerCase() !== 'off';
  if (sendCust && tel && toList.indexOf(tel) === -1) {
    messages.push({ to: tel, from: fromNum, text: custMsg });
  }

  var date = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  var salt = Utilities.getUuid().replace(/-/g, '');
  var signature = _hex(Utilities.computeHmacSha256Signature(date + salt, apiSecret));
  var authHeader = 'HMAC-SHA256 apiKey=' + apiKey + ', date=' + date + ', salt=' + salt + ', signature=' + signature;

  var res = UrlFetchApp.fetch('https://api.solapi.com/messages/v4/send-many/detail', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: authHeader },
    payload: JSON.stringify({ messages: messages }),
    muteHttpExceptions: true
  });
  return res.getContentText();
}

/* ---------------- 설치 후 1회 실행해서 확인 ---------------- */
function 테스트발송() {
  // 주의: 고객 접수확인 문자도 같이 나가므로, 본인 번호로 시험하세요 (예: '010-1234-5678' 대신 본인 번호)
  Logger.log(_sendSms('테스트', '01000000000', '광주', 'all'));
}
