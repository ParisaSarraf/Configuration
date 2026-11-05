import test from "node:test";
import assert from "node:assert/strict";
import { buildRequirementTree, canDeleteRequirement, canAddRequirementEdition, canExportRequirementEdition, filterRequirementTree, getBranchKeys, countRequirements, getRequirementState, getAssignmentState } from "../utils/requirementTree.js";
const data = [{ id: 4, code: "PH", title: "فیزیکی", children: [{ id: 5, title: "استاندارد", children: [{ id: 6, title: "آزمون و تست", children: [{ id: 7, title: "بسته بندی و حمل ونقل", children: [], product_requirements: [{ id: 25, title: "hard test", product_id: 179, editions: [{ id: 3, full_code: "SY11-10-340-001/PHSTQCPT-222", code: "222", state: 10, assigned_to: [] }] }] }] }] }] }, { id: 10, title: "requiremet tree test", product_requirements: [{ id: 24, title: "TEST TITLE", imported: true, editions: [{ id: 2, full_code: "sy12/10-222", state: 10, assigned_to: [{ id: 7, to_product_id: 179, is_current_product: true }] }] }], children: [] }];
const flatten = (nodes) => nodes.flatMap((node) => [node, ...flatten(node.children)]);
test("all category, requirement and edition levels from supplied shape", () => {
 const tree = buildRequirementTree(data); const nodes = flatten(tree);
 assert.equal(nodes.length, 9); assert.equal(countRequirements(tree), 2);
 const edition = nodes.find((node) => node.edition?.id === 3);
 assert.equal(edition.requirement.id, 25); assert.equal(edition.category.id, 7);
 assert.equal(nodes.find((node) => node.edition?.id === 2).edition.assigned_to[0].to_product_id, 179);
 assert.equal(new Set(nodes.map((node) => node.key)).size, 9);
});
test("multiple requirements and versions are not truncated", () => {
 const tree = buildRequirementTree([{ id: 1, product_requirements: [{ id: 1, editions: [{ id: 1 }, { id: 2 }] }, { id: 2, editions: [{ id: 1 }] }] }]);
 assert.equal(tree[0].children.length, 2); assert.equal(flatten(tree).length, 6);
 assert.equal(new Set(flatten(tree).map((node) => node.key)).size, 6);
});
test("search retains ancestors and matching descendants", () => {
 const result = filterRequirementTree(buildRequirementTree(data), "SY11");
 assert.equal(result.length, 1); assert.equal(flatten(result).length, 6);
 assert.equal(filterRequirementTree(buildRequirementTree(data), "no-match").length, 0);
 assert.equal(countRequirements(filterRequirementTree(buildRequirementTree(data), "فیزیکی")), 1);
});
test("Persian character normalization and safe empty input", () => {
 assert.equal(filterRequirementTree(buildRequirementTree(data), "فيزيكي").length, 1);
 for (const value of [null, undefined, []]) assert.deepEqual(buildRequirementTree(value), []);
 assert.equal(buildRequirementTree({ id: 1, product_requirements: null, children: null }).length, 1);
 assert.equal(getBranchKeys(buildRequirementTree(data)).length, 7);
 assert.equal(getRequirementState(70).label, "وضعیت 70");
 assert.equal(getRequirementState(null).label, "وضعیت نامشخص");
});


test("import indicator is per edition and requires an assignment to the current product", () => {
 const response = [{ id: 10, title: "requiremet tree test", product_requirements: [{
   id: 24, product_id: 124, title: "TEST TITLE", imported: true,
   editions: [
     { id: 4, full_code: "sy12/10-TEST", assigned_to: [
       { id: 9, to_product_id: 7259, is_current_product: true },
       { id: 10, to_product_id: 7259, is_current_product: true },
     ] },
     { id: 5, assigned_to: [{ id: 11, is_current_product: false }] },
     { id: 6, assigned_to: [] },
     { id: 7 },
   ]
 }], children: [] }];
 const editions = flatten(buildRequirementTree(response)).filter((node) => node.kind === "edition");
 assert.deepEqual(editions.map((node) => node.isImported), [true, false, false, false]);
 response[0].product_requirements[0].imported = false;
 assert.equal(flatten(buildRequirementTree(response)).find((node) => node.edition?.id === 4).isImported, false);
});


test("only non-imported requirements with an id can be deleted", () => {
 assert.equal(canDeleteRequirement({ id: 24, imported: true }), false);
 assert.equal(canDeleteRequirement({ id: 25, imported: false }), true);
 assert.equal(canDeleteRequirement({ id: 26 }), true);
 assert.equal(canDeleteRequirement(null), false);
 assert.equal(canDeleteRequirement({ imported: false }), false);
});


test("imported requirements cannot be exported or have editions added", () => {
 const imported = { id: 24, imported: true };
 for (const state of [10,20,30,40,50,undefined]) assert.equal(canExportRequirementEdition(imported, { id: 4, state }), false);
 assert.equal(canAddRequirementEdition(imported), false);
 assert.equal(canDeleteRequirement(imported), false);
 assert.equal(canExportRequirementEdition({ id: 24, imported: false }, { id: 4, state: 10 }), false);
 for (const state of [20, 30, 40, 50, "20"]) assert.equal(canExportRequirementEdition({ id: 24, imported: false }, { id: 4, state }), true);
 for (const state of [null, undefined, "", 0, 70]) assert.equal(canExportRequirementEdition({ id: 24, imported: false }, { id: 4, state }), false);
 assert.equal(canAddRequirementEdition({ id: 24, imported: false }), true);
 assert.equal(canExportRequirementEdition({ id: 24 }, {}), false);
 assert.deepEqual([10, 20, 30].map(s => getAssignmentState(s).label), ["اجرا", "تصویب", "صحه‌گذاری"]);
 assert.equal(getAssignmentState(40).label, "وضعیت 40");
});
