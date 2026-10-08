import assert from "node:assert/strict";
import test from "node:test";

import { curseFor, fortuneFor } from "../src/fortunes.js";

test("fortune tone follows the score tier", () => {
  assert.equal(fortuneFor(90, 1).tier, "blessed");
  assert.equal(fortuneFor(75, 1).tier, "promising");
  assert.equal(fortuneFor(45, 1).tier, "scrappy");
});

test("high-score fortunes avoid low-score onboarding insults", () => {
  for (let seed = 0; seed < 50; seed += 1) {
    const fortune = fortuneFor(95, seed);
    assert.doesNotMatch(fortune.personality, /forgot strangers|locked front door/i);
    assert.doesNotMatch(fortune.roast, /trust me bro|locked door/i);
  }
});

test("curse names the highest-impact missing signal", () => {
  assert.match(curseFor("Visual proof"), /No visual proof/);
  assert.match(curseFor("Copy-paste command"), /first command/);
  assert.match(curseFor(null), /no structural curse/i);
});
