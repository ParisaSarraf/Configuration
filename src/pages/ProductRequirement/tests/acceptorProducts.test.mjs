import test from "node:test";
import assert from "node:assert/strict";
import { mapAcceptorProducts } from "../utils/acceptorProducts.js";

test("maps flat server products without confusing product id with edition id", () => {
  const data = [
    { id: 7647, code: "60", persian_title: "مصرفی", parent: 124 },
    { id: 7259, code: "10", persian_title: "کانتینر پرتاب دومنظوره", parent: 124 },
  ];
  const rows = mapAcceptorProducts(data);
  assert.deepEqual(rows.map(({id,code,title}) => ({id,code,title})), data.map(({id,code,persian_title}) => ({id,code,title:persian_title})));
  assert.notEqual(rows[0].key, rows[1].key);
});
test("handles empty, duplicate, and invalid responses safely", () => {
  assert.deepEqual(mapAcceptorProducts([]), []);
  assert.equal(mapAcceptorProducts(null), null);
  assert.equal(mapAcceptorProducts({id: 1}), null);
  const rows = mapAcceptorProducts([{id: 1}, {id: 1}]);
  assert.notEqual(rows[0].key, rows[1].key);
  assert.equal(rows[0].title, "محصول بدون عنوان");
});

test("maps the nested acceptor response without confusing product and requirement IDs", () => {
  const requirementTree = [{ id: 9, title: "سایر", product_requirements: [
    { id: 28, product_id: 10139, title: "الزام واردشده", imported: true,
      editions: [{ id: 14, state: 30, assigned_to: [{ id: 20, to_product_id: 10843, is_current_product: true, state: 10 }] }] },
    { id: 30, product_id: 10843, title: "الزام محصول", imported: false, editions: [] },
  ], children: [] }];
  const [item] = mapAcceptorProducts([{ product: { id: 10843, persian_title: "برد نمایشگر" }, requirement_tree: requirementTree }]);
  assert.equal(item.id, 10843);
  assert.equal(item.product.id, 10843);
  assert.equal(item.title, "برد نمایشگر");
  assert.strictEqual(item.requirementTree, requirementTree);
  assert.equal(item.requirementTree[0].product_requirements[0].editions[0].assigned_to[0].state, 10);
});

test("rejects malformed nested results rather than presenting them as an empty list", () => {
  assert.equal(mapAcceptorProducts([{ product: null, requirement_tree: [] }]), null);
  assert.equal(mapAcceptorProducts([{ product: { id: 10843 }, requirement_tree: null }]), null);
  assert.equal(mapAcceptorProducts([{ product: { id: 10843 } }]), null);
});
