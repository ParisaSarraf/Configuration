import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeFields,
  readLayout,
  reorderFields,
  stripLayout,
  widthSpan,
  writeLayout,
} from "./formStudioLayout.js";

test("layout metadata round-trips while preserving existing CSS classes", () => {
  const stored = writeLayout("custom highlighted", "row-2", "1/3");
  assert.deepEqual(readLayout(stored), { rowId: "row-2", width: "1/3" });
  assert.equal(stripLayout(stored), "custom highlighted");
  assert.equal(widthSpan("1/3"), 8);
});

test("invalid or missing layout configuration falls back safely", () => {
  assert.deepEqual(readLayout("form-studio-width:invalid", 4), {
    rowId: "4",
    width: "1/1",
  });
  assert.deepEqual(normalizeFields(null), []);
  assert.equal(widthSpan("not-a-width"), 24);
});

test("reorder can group a field beside an existing field", () => {
  const fields = normalizeFields([
    { id: 1, order: 0, css_class: "form-studio-row:a form-studio-width:1/2" },
    { id: 2, order: 1, css_class: "form-studio-row:b form-studio-width:1/2" },
    { id: 3, order: 2, css_class: "form-studio-row:c form-studio-width:1/1" },
  ]);
  const next = reorderFields(fields, 3, 1, true);
  assert.equal(next.find((field) => field.id === 3).rowId, "a");
  assert.deepEqual(next.map((field) => field.order), [0, 1, 2]);
});
