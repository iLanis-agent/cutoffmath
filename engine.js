// Cutoff Math engine: school entry cutoff honesty - birth date against the district's own rule (turn N by the cutoff): the entry year, the exact age on the cutoff day, the days the child clears or misses by, and where the birthday sits in the class age spread. Exact integers, civil-date arithmetic with no library. No named constants; the cutoff and the entry age are the owner's own entries.
function _i(t, err, digits, lo, hi) {
  t = typeof t === "string" ? t.trim() : "";
  if (!new RegExp("^[0-9]{1," + digits + "}$").test(t)) throw new Error(err);
  var v = parseInt(t, 10);
  if (v < lo || v > hi) throw new Error(err);
  return v;
}
function _pl(n, one, many) { return n + (n === 1 ? one : many); }
function _v(n, one, many) { return n === 1 ? one : many; }
var _B = "the birth date must be a real date as YYYY-MM-DD between 2000 and 2100";
var _M = "the cutoff month must be from 1 to 12 with no decimal places";
var _Y = "the cutoff day must be from 1 to 31 with no decimal places";
var _C = "the cutoff must be a real date, so the day must exist in the month";
var _A = "the entry age must be from 3 to 7 years with no decimal places";
var _MN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function _days(y, m, d) {
  y -= m <= 2 ? 1 : 0;
  var era = Math.floor((y >= 0 ? y : y - 399) / 400);
  var yoe = y - era * 400;
  var doy = Math.floor((153 * (m > 2 ? m - 3 : m + 9) + 2) / 5) + d - 1;
  var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}
function _civil(z) {
  z += 719468;
  var era = Math.floor((z >= 0 ? z : z - 146096) / 146097);
  var doe = z - era * 146097;
  var yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  var y = yoe + era * 400;
  var doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  var mp = Math.floor((5 * doy + 2) / 153);
  var d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  var m = mp + (mp < 10 ? 3 : -9);
  return [y + (m <= 2 ? 1 : 0), m, d];
}
function _date(t, err) {
  t = typeof t === "string" ? t.trim() : "";
  var m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(t);
  if (!m) throw new Error(err);
  var y = +m[1], mo = +m[2], d = +m[3];
  if (y < 2000 || y > 2100) throw new Error(err);
  var c = _civil(_days(y, mo, d));
  if (c[0] !== y || c[1] !== mo || c[2] !== d) throw new Error(err);
  return [y, mo, d];
}
function _p2(x) { return String(x).padStart(2, "0"); }
function _iso(c) { return c[0] + "-" + _p2(c[1]) + "-" + _p2(c[2]); }
function _rule(cm, cd, age) {
  var mo = _i(cm, _M, 2, 1, 12), dy = _i(cd, _Y, 2, 1, 31), a = _i(age, _A, 1, 3, 7);
  var c = _civil(_days(2026, mo, dy));
  if (c[0] !== 2026 || c[1] !== mo || c[2] !== dy) throw new Error(_C);
  return [mo, dy, a];
}
function _entry(b, mo, dy, a) {
  var t = _days(b[0] + a, b[1], b[2]);
  var cy = _days(b[0] + a, mo, dy);
  return t <= cy ? b[0] + a : b[0] + a + 1;
}
function _age(b, y, m, d) {
  var y2 = y, m2 = m, d2 = d;
  if (d2 < b[2]) {
    var pm = m2 === 1 ? 12 : m2 - 1, py = m2 === 1 ? y2 - 1 : y2;
    d2 += _days(pm === 12 ? py + 1 : py, pm === 12 ? 1 : pm + 1, 1) - _days(py, pm, 1);
    m2 -= 1; if (m2 === 0) { m2 = 12; y2 -= 1; }
  }
  if (m2 < b[1]) { m2 += 12; y2 -= 1; }
  return [y2 - b[0], m2 - b[1], d2 - b[2]];
}
function entryTruth(birth, cm, cd, age) {
  var b = _date(birth, _B), r = _rule(cm, cd, age);
  var y = _entry(b, r[0], r[1], r[2]);
  return "Born " + b.join("-").replace(/-([0-9])(?=-|$)/g, "-0$1") + " under the rule of turning " + r[2] + " by the " + _MN[r[0] - 1] + " " + r[1] + " cutoff, the child enters school in " + y + ".";
}
function ageTruth(birth, cm, cd, age) {
  var b = _date(birth, _B), r = _rule(cm, cd, age);
  var y = _entry(b, r[0], r[1], r[2]);
  var a = _age(b, y, r[0], r[1]);
  return "On the " + y + "-" + _p2(r[0]) + "-" + _p2(r[1]) + " cutoff the child is " + _pl(a[0], " year", " years") + ", " + _pl(a[1], " month", " months") + " and " + _pl(a[2], " day", " days") + " old.";
}
function marginTruth(birth, cm, cd, age) {
  var b = _date(birth, _B), r = _rule(cm, cd, age), mo = r[0], dy = r[1], a = r[2];
  var t = _days(b[0] + a, b[1], b[2]), cy = _days(b[0] + a, mo, dy);
  var cs = b[0] + a + "-" + _p2(mo) + "-" + _p2(dy);
  if (t <= cy) return "Turning " + a + " on " + _iso(_civil(t)) + ", the child clears the " + cs + " cutoff by " + _pl(cy - t, " day", " days") + ".";
  return "Turning " + a + " on " + _iso(_civil(t)) + ", the child misses the " + cs + " cutoff by " + _pl(t - cy, " day", " days") + ", so entry waits for " + (b[0] + a + 1) + ".";
}
function spreadTruth(birth, cm, cd, age) {
  var b = _date(birth, _B), r = _rule(cm, cd, age);
  var y = _entry(b, r[0], r[1], r[2]);
  var lo = _days(y - r[2] - 1, r[0], r[1]) + 1, hi = _days(y - r[2], r[0], r[1]);
  var bd = _days(b[0], b[1], b[2]);
  return "The class spans births from " + _iso(_civil(lo)) + " to " + _iso(_civil(hi)) + ", " + _pl(hi - lo, " day", " days") + "; the child sits " + _pl(bd - lo, " day", " days") + " from the oldest edge and " + _pl(hi - bd, " day", " days") + " from the youngest.";
}
