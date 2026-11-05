import test from "node:test";
import assert from "node:assert/strict";
import { REQUIREMENT_WORKFLOW_STEPS, buildRequirementTransition, canRunRequirementWorkflow, getWorkflowIndex, allAssignmentsCompleted, findEditionInTree } from "../utils/requirementWorkflow.js";
const local = { id: 24, imported: false };
const imported = { id: 24, imported: true };
const edition = { id: 4, state: 10 };

test("local edition workflow has five ordered stages", () => {
  assert.deepEqual(REQUIREMENT_WORKFLOW_STEPS.map((s) => s.value), [10, 20, 30, 40, 50]);
  assert.deepEqual(REQUIREMENT_WORKFLOW_STEPS.map((s) => s.label), ["تهیه", "تایید", "اجرا", "تصویب", "صحه‌گذاری"]);
  assert.equal(canRunRequirementWorkflow(local, edition), true);
  assert.equal(canRunRequirementWorkflow(imported, edition), false);
  assert.equal(canRunRequirementWorkflow({ id: 24 }, edition), false);
  assert.equal(canRunRequirementWorkflow(local, {}), false);
});
test("only adjacent transitions with a comment produce correct request payload", () => {
  assert.deepEqual(buildRequirementTransition(local, edition, 10, 1, "  توضیح  "), { id: 4, state: 20, comment: "توضیح" });
  assert.deepEqual(buildRequirementTransition(local, edition, "30", -1, "بازگشت"), { id: 4, state: 20, comment: "بازگشت" });
  assert.equal(buildRequirementTransition(local, edition, 40, 1, "توضیح").state, 50);
  assert.equal(buildRequirementTransition(local, edition, 50, -1, "رد").state, 40);
  assert.throws(() => buildRequirementTransition(imported, edition, 10, 1, "توضیح"));
  assert.throws(() => buildRequirementTransition(local, edition, 10, -1, "توضیح"));
  assert.throws(() => buildRequirementTransition(local, edition, 50, 1, "توضیح"));
  assert.throws(() => buildRequirementTransition(local, edition, 30, 2, "توضیح"));
  assert.throws(() => buildRequirementTransition(local, edition, 10, 1, "  "));
  assert.throws(() => buildRequirementTransition(local, edition, 70, 1, "توضیح"));
  assert.equal(getWorkflowIndex(null), -1);
  assert.equal(getWorkflowIndex(""), -1);
});

test("source edition can reach 30 only after all assignments finish", () => {
  const make = (states) => ({ id: 4, assigned_to: states.map(state => ({ state })) });
  assert.equal(allAssignmentsCompleted(make([])), true);
  assert.equal(allAssignmentsCompleted(make([30, "30"])), true);
  for (const states of [[30, 20], [10], [null], [40]]) assert.equal(allAssignmentsCompleted(make(states)), false);
  assert.equal(allAssignmentsCompleted({ id: 4 }), false);
  assert.throws(() => buildRequirementTransition(local, make([30, 20]), 20, 1, "توضیح"));
  assert.throws(() => buildRequirementTransition(local, { id: 4 }, 20, 1, "توضیح"));
  assert.equal(buildRequirementTransition(local, make([30, 30]), 20, 1, "توضیح").state, 30);
  assert.equal(buildRequirementTransition(local, make([]), 20, 1, "توضیح").state, 30);
  assert.throws(() => buildRequirementTransition(local, make([20]), 40, -1, "توضیح"));
  assert.equal(buildRequirementTransition(local, make([20]), 10, 1, "توضیح").state, 20);
});
test("fresh lookup follows nested categories and matches requirement and edition", () => {
 const tree = [{children:[{product_requirements:[{id:24, imported:false, editions:[{id:4, state:20, assigned_to:[{state:30}]}]}]}]}];
 assert.equal(findEditionInTree(tree, 24, 4).edition.assigned_to[0].state, 30);
 assert.equal(findEditionInTree(tree, 25, 4), null);
 assert.equal(findEditionInTree(tree, 24, 5), null);
});
