#!/usr/bin/env python3
# Cutoff Math oracle - independent mirror of engine.js; writes expected.json.
import json

MN = ["January","February","March","April","May","June","July","August","September","October","November","December"]

def gday(y, m, d):
    y -= 1 if m <= 2 else 0
    era = (y if y >= 0 else y - 399) // 400
    yoe = y - era * 400
    doy = (153 * (m - 3 if m > 2 else m + 9) + 2) // 5 + d - 1
    doe = yoe * 365 + yoe // 4 - yoe // 100 + doy
    return era * 146097 + doe - 719468

def civil(z):
    z += 719468
    era = (z if z >= 0 else z - 146096) // 146097
    doe = z - era * 146097
    yoe = (doe - doe // 1460 + doe // 36524 - doe // 146096) // 365
    y = yoe + era * 400
    doy = doe - (365 * yoe + yoe // 4 - yoe // 100)
    mp = (5 * doy + 2) // 153
    d = doy - (153 * mp + 2) // 5 + 1
    m = mp + (3 if mp < 10 else -9)
    return [y + (1 if m <= 2 else 0), m, d]

def iso(c): return f"{c[0]}-{str(c[1]).zfill(2)}-{str(c[2]).zfill(2)}"
def pl(n, one, many): return f"{n}{one if n == 1 else many}"

def bdate(s):
    y, m, d = int(s[:4]), int(s[5:7]), int(s[8:10])
    assert 2000 <= y <= 2100 and civil(gday(y, m, d)) == [y, m, d]
    return [y, m, d]

def rule(cm, cd, age):
    mo, dy, a = int(cm), int(cd), int(age)
    assert 1 <= mo <= 12 and 1 <= dy <= 31 and 3 <= a <= 7
    assert civil(gday(2026, mo, dy)) == [2026, mo, dy]
    return mo, dy, a

def entry(b, mo, dy, a):
    t = gday(b[0] + a, b[1], b[2])
    cy = gday(b[0] + a, mo, dy)
    return b[0] + a if t <= cy else b[0] + a + 1

def age_at(b, y, m, d):
    y2, m2, d2 = y, m, d
    if d2 < b[2]:
        pm = 12 if m2 == 1 else m2 - 1
        py = y2 - 1 if m2 == 1 else y2
        d2 += gday(py + 1 if pm == 12 else py, 1 if pm == 12 else pm + 1, 1) - gday(py, pm, 1)
        m2 -= 1
        if m2 == 0: m2, y2 = 12, y2 - 1
    if m2 < b[1]: m2, y2 = m2 + 12, y2 - 1
    return [y2 - b[0], m2 - b[1], d2 - b[2]]

def entry_t(birth, cm, cd, age):
    b = bdate(birth); mo, dy, a = rule(cm, cd, age)
    y = entry(b, mo, dy, a)
    return f"Born {birth.strip()} under the rule of turning {a} by the {MN[mo-1]} {dy} cutoff, the child enters school in {y}."

def age_t(birth, cm, cd, age):
    b = bdate(birth); mo, dy, a = rule(cm, cd, age)
    y = entry(b, mo, dy, a)
    ag = age_at(b, y, mo, dy)
    return f"On the {y}-{str(mo).zfill(2)}-{str(dy).zfill(2)} cutoff the child is {pl(ag[0],' year',' years')}, {pl(ag[1],' month',' months')} and {pl(ag[2],' day',' days')} old."

def margin_t(birth, cm, cd, age):
    b = bdate(birth); mo, dy, a = rule(cm, cd, age)
    t = gday(b[0] + a, b[1], b[2]); cy = gday(b[0] + a, mo, dy)
    cs = f"{b[0]+a}-{str(mo).zfill(2)}-{str(dy).zfill(2)}"
    if t <= cy:
        return f"Turning {a} on {iso(civil(t))}, the child clears the {cs} cutoff by {pl(cy-t,' day',' days')}."
    return f"Turning {a} on {iso(civil(t))}, the child misses the {cs} cutoff by {pl(t-cy,' day',' days')}, so entry waits for {b[0]+a+1}."

def spread_t(birth, cm, cd, age):
    b = bdate(birth); mo, dy, a = rule(cm, cd, age)
    y = entry(b, mo, dy, a)
    lo = gday(y - a - 1, mo, dy) + 1; hi = gday(y - a, mo, dy)
    bd = gday(b[0], b[1], b[2])
    return f"The class spans births from {iso(civil(lo))} to {iso(civil(hi))}, {pl(hi-lo,' day',' days')}; the child sits {pl(bd-lo,' day',' days')} from the oldest edge and {pl(hi-bd,' day',' days')} from the youngest."

cases, errors = [], []
def C(fn, *args): cases.append({"fn": fn, "args": [str(a) for a in args], "expect": globals()[fn + "_t"](*[str(a) for a in args])})

births = ["2021-06-14","2021-09-03","2021-09-01","2021-09-02","2020-02-29","2019-12-25","2022-01-01",
          "2020-08-31","2021-03-31","2020-05-01","2021-10-31","2019-07-04","2022-06-30","2020-11-15"]
rules = [("9","1","5"),("9","1","6"),("8","1","5"),("7","1","4"),("1","1","5"),("12","31","5"),("3","1","6"),("6","15","3")]
for b in births[:8]: C("entry", b, *rules[0])
for r in rules[1:5]: C("entry", "2021-06-14", *r)
for b in births: C("age", b, *rules[0])
for r in [rules[1],rules[3],rules[5],rules[7]]: C("age", "2020-02-29", *r)
for b in births: C("margin", b, *rules[0])
for r in rules[2:]: C("margin", "2021-06-14", *r)
C("margin","2021-08-31","9","1","5"); C("margin","2021-09-02","8","31","5")
for b in births: C("spread", b, *rules[0])
for r in [rules[1],rules[2],rules[4],rules[6]]: C("spread", "2021-06-14", *r)
C("spread","2020-09-01","9","1","5"); C("spread","2020-09-02","9","1","5")

bad = [("entry",["2021-13-14","9","1","5"]),("entry",["2021-06-14","13","1","5"]),
       ("entry",["2021-06-14","9","32","5"]),("entry",["2021-06-14","2","30","5"]),
       ("entry",["2021-02-30","9","1","5"]),("entry",["1999-06-14","9","1","5"]),
       ("entry",["2021-06-14","9","1","8"]),("entry",["2021-06-14","9","1","2"]),
       ("age",["2021-6-14","9","1","5"]),("margin",["2021-06-14","9","1","5.5"]),
       ("spread",["abc","9","1","5"]),("age",["2021-06-14","0","1","5"]),
       ("margin",["2021-06-14","9","0","5"]),("spread",["2021-06-14","4","31","5"]),
       ("entry",["2021-06-14","","1","5"]),("age",["","9","1","5"]),
       ("margin",["2021-06-14","09","01","5x"]),("spread",["2101-01-01","9","1","5"])]
for fn, args in bad: errors.append([fn, args])

json.dump({"cases": cases, "errors": errors}, open("expected.json", "w"), indent=1)
print(len(cases), "cases,", len(errors), "errcases")
