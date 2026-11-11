import test from "node:test";
import assert from "node:assert/strict";
import { buildExportEditionPayload, exportFailureStatus, retryableDestinationIds, mapDestinationProducts, replaceDestinationChildren } from "../utils/exportEdition.js";
import { getRequirementState } from "../utils/requirementTree.js";

test("destination tree contains children, not the current product", () => {
  const products = [
    { id: 100, persian_title: "محصول جاری", has_children: true },
    { id: 101, persian_title: "زیرمحصول", code: "A", has_children: true,
      children: [{ id: 102, persian_title: "جزء", has_children: false }] },
  ];
  const tree = mapDestinationProducts(products, 100);
  assert.equal(tree.length, 1);
  assert.equal(tree[0].value, 101);
  assert.equal(tree[0].title, "زیرمحصول (A)");
  assert.equal(tree[0].children[0].value, 102);
  assert.equal(tree[0].children[0].isLeaf, true);
  const updated = replaceDestinationChildren(tree, 101, [{ id: 103, value: 103 }]);
  assert.equal(updated[0].children[0].id, 103);
  assert.equal(tree[0].children[0].id, 102);
  assert.deepEqual(mapDestinationProducts(null, 100), []);
});
test("export sends the new JSON schema for each destination", () => {
  assert.deepEqual(buildExportEditionPayload(14, 10843, "توضیح"), {
    product_requirement_edition_ids: ["14"], to_product_id: 10843,
    state: 10, pass_comment: "توضیح",
  });
  assert.deepEqual(buildExportEditionPayload("14", "7259"), {
    product_requirement_edition_ids: ["14"], to_product_id: 7259, state: 10,
  });
  assert.throws(() => buildExportEditionPayload(null, 2));
  assert.throws(() => buildExportEditionPayload(4, null));
  assert.throws(() => buildExportEditionPayload(4, "not an id"));
});
test("retry excludes successes and ambiguous outcomes", () => {
  const results = { 1: { status: "success" }, 2: { status: "failed" }, 3: { status: "unknown" } };
  assert.deepEqual(retryableDestinationIds([1, 2, 3, 4], results), [2, 4]);
  assert.equal(exportFailureStatus({ response: { status: 400 } }), "failed");
  assert.equal(exportFailureStatus({ response: { status: 408 } }), "unknown");
  assert.equal(exportFailureStatus({ response: { status: 500 } }), "unknown");
  assert.equal(exportFailureStatus({}), "unknown");
});
test("workflow status labels use the specified mapping", () => {
  assert.deepEqual([10, 20, 30, 40, 50].map((s) => getRequirementState(s).label), ["تهیه", "تایید", "اجرا", "تصویب", "صحه‌گذاری"]);
  assert.equal(getRequirementState(70).label, "وضعیت 70");
});
