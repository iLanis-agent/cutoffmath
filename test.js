const fs = require("fs");
eval(fs.readFileSync("engine.js", "utf8"));
const exp = JSON.parse(fs.readFileSync("expected.json", "utf8"));
const fns = { entry: entryTruth, age: ageTruth, margin: marginTruth, spread: spreadTruth };
let fail = 0;
for (const c of exp.cases) {
  const got = JSON.stringify(fns[c.fn](...c.args));
  if (got !== JSON.stringify(c.expect)) { fail++; console.log("MISMATCH", c.fn, c.args, "\n got:", got, "\n exp:", JSON.stringify(c.expect)); }
}
const ERRS = ["the birth date must be a real date as YYYY-MM-DD between 2000 and 2100",
  "the cutoff month must be from 1 to 12 with no decimal places",
  "the cutoff day must be from 1 to 31 with no decimal places",
  "the cutoff must be a real date, so the day must exist in the month",
  "the entry age must be from 3 to 7 years with no decimal places"];
for (const [fn, args] of exp.errors) {
  let threw = null;
  try { fns[fn](...args); } catch (e) { threw = e.message; }
  if (!threw || !ERRS.includes(threw)) { fail++; console.log("ERRCASE FAIL", fn, args, "->", threw); }
}
console.log(fail ? `${fail} FAILURES` : "all green");
process.exit(fail ? 1 : 0);
