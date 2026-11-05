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
