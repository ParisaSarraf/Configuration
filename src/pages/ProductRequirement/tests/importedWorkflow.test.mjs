import test from "node:test";
import assert from "node:assert/strict";
import { IMPORTED_WORKFLOW_STEPS, getCurrentProductAssignments, getImportedWorkflowIndex, getImportedTransitionTarget, buildImportedTransition } from "../utils/importedRequirementWorkflow.js";
const imported = { id: 27, imported: true };
const edition = { id: 9, state: 20, assigned_to: [
  { id: 14, to_product_id: 7259, is_current_product: true, state: 10 },
  { id: 15, to_product_id: 88, is_current_product: false, state: 30 },
] };
test("imported assignments use their own three stages", () => {
  assert.deepEqual(IMPORTED_WORKFLOW_STEPS.map((s) => [s.value, s.label]), [[10, "اجرا"], [20, "تصویب"], [30, "صحه‌گذاری"]]);
  assert.deepEqual(getCurrentProductAssignments(edition).map((a) => a.id), [14]);
  assert.equal(getImportedWorkflowIndex(10), 0);
  assert.equal(getImportedWorkflowIndex(30), 2);
  assert.equal(getImportedWorkflowIndex(50), -1);
});
test("transitions use assignment id and adjacent states", () => {
  const assignment = getCurrentProductAssignments(edition)[0];
  assert.deepEqual(buildImportedTransition(imported, assignment, 1, "  توضیح  "), { id: 14, state: 20, comment: "توضیح" });
  assert.equal(getImportedTransitionTarget(10, -1), null);
  assert.equal(getImportedTransitionTarget(20, -1).value, 10);
  assert.equal(getImportedTransitionTarget(20, 1).value, 30);
  assert.equal(getImportedTransitionTarget(30, 1), null);
  assert.equal(getImportedTransitionTarget(40, -1), null);
  assert.equal(getImportedTransitionTarget(null, 1), null);
  assert.throws(() => buildImportedTransition(imported, edition.assigned_to[1], 1, "توضیح"));
  assert.throws(() => buildImportedTransition({ imported: false }, assignment, 1, "توضیح"));
  assert.throws(() => buildImportedTransition(imported, assignment, 1, "  "));
});
