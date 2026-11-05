import test from "node:test";
import assert from "node:assert/strict";
import { buildExportEditionFormData, mapDestinationProducts, replaceDestinationChildren } from "../utils/exportEdition.js";
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
test("export sends edition id, destination id, state 10 and optional fields", async () => {
  const file = new File(["contents"], "test.txt", { type: "text/plain" });
  const form = buildExportEditionFormData(4, { to_product_id: 7259, pass_comment: "توضیح", file_1: [{ originFileObj: file }] });
  assert.deepEqual([...form.keys()], ["product_requirement_edition_id", "to_product_id", "state", "pass_comment", "file_1"]);
  assert.equal(form.get("product_requirement_edition_id"), "4");
  assert.equal(form.get("to_product_id"), "7259");
  assert.equal(form.get("state"), "10");
  assert.equal(form.get("file_1").name, "test.txt");
  assert.equal(await form.get("file_1").text(), "contents");
  assert.equal(form.has("product_requirement_id"), false);
  assert.deepEqual([...buildExportEditionFormData(4, { to_product_id: 7259 }).keys()], ["product_requirement_edition_id", "to_product_id", "state"]);
  assert.throws(() => buildExportEditionFormData(null, { to_product_id: 2 }));
  assert.throws(() => buildExportEditionFormData(4, {}));
});
test("workflow status labels use the specified mapping", () => {
  assert.deepEqual([10, 20, 30, 40, 50].map((s) => getRequirementState(s).label), ["تهیه", "تایید", "اجرا", "تصویب", "صحه‌گذاری"]);
  assert.equal(getRequirementState(70).label, "وضعیت 70");
});
