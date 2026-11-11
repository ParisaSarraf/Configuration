import test from "node:test";
import assert from "node:assert/strict";
import { getRequirementDescription } from "../utils/requirementDescription.js";

test("shows the full description and preserves the existing description", () => {
  assert.equal(getRequirementDescription({ reason: "شرح کامل", description: "توضیح دیگر" }), "شرح کامل — توضیح دیگر");
  assert.equal(getRequirementDescription({ reason: " همان ", description: "همان" }), "همان");
});
test("handles API responses with just description or no description", () => {
  assert.equal(getRequirementDescription({ description: "توضیح درخت" }), "توضیح درخت");
  assert.equal(getRequirementDescription({ reason: "فقط شرح کامل" }), "فقط شرح کامل");
  assert.equal(getRequirementDescription({ reason: null, description: "  " }), "");
  assert.equal(getRequirementDescription(null), "");
});
