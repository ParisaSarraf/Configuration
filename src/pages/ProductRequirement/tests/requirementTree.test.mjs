import test from "node:test";
import assert from "node:assert/strict";
import { buildRequirementTree, filterRequirementTree, getBranchKeys, countRequirements, getRequirementState } from "../utils/requirementTree.js";
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
