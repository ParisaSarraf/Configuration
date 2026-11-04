import test from "node:test";
import assert from "node:assert/strict";
import { getSourceEditionOptions, normalizeEditionSearch, buildEditionFormData } from "../utils/editionForm.js";

const sourceTree = [{ id: 1, title: "فیزیکی", children: [{ id: 2, title: "استاندارد", product_requirements: [
  { id: 10, title: "استحکام", editions: [{ id: 31, full_code: "R-001", code: "001", description: "تست فولاد" }, { id: 32, code: "002" }] },
  { id: 11, title: "ایمنی", editions: [{ id: 31, code: "001" }] },
] }] }];
test("source list shows categories and requirements and selects only real editions", () => {
  const options = getSourceEditionOptions(sourceTree);
  const editions = options.filter((o) => !o.disabled);
  assert.deepEqual(editions.map((o) => o.value), [31, 32]);
  assert.ok(options.some((o) => o.label.includes("فیزیکی")));
  assert.ok(options.some((o) => o.label.includes("استاندارد")));
  assert.ok(options.some((o) => o.label.includes("استحکام") && o.disabled));
  assert.match(editions[0].searchText, /فیزیکی.*استاندارد.*استحکام.*R-001.*تست فولاد/);
  assert.equal(normalizeEditionSearch("  فيزيكي  "), "فیزیکی");
  assert.deepEqual(getSourceEditionOptions(null), []);
});
test("a requirement with an empty editions array is still visible but not selectable", () => {
  const options = getSourceEditionOptions([{ id: 9, code: "OT", title: "سایر", english_title: "Other", is_definable: true, product_requirements: [{ id: 28, product_id: 10139, title: "2345678", imported: false, editions: [] }], children: [] }]);
  assert.equal(options.length, 2);
  assert.match(options[0].label, /سایر.*OT/);
  assert.match(options[1].label, /2345678.*بدون نسخه/);
  assert.equal(options[1].disabled, true);
  assert.ok(options.every((o) => o.disabled));
});
test("multipart payload contains specified fields and omits pass_comment and empty fields", async () => {
  const file = new File(["test"], "test.txt", { type: "text/plain" });
  const form = buildEditionFormData(12, { trustee_id: 4, source_requirement_edition_id: 31, code: "001", reason: "دلیل", description: "شرح", file_description: "پیوست", file: [{ originFileObj: file }], pass_comment: "must not be sent" });
  assert.deepEqual([...form.keys()], ["product_requirement_id", "trustee_id", "source_requirement_edition_id", "code", "reason", "description", "file_description", "file"]);
  assert.equal(form.get("product_requirement_id"), "12");
  assert.equal(form.get("trustee_id"), "4");
  assert.equal(form.get("source_requirement_edition_id"), "31");
  assert.equal(form.get("file").name, "test.txt");
  assert.equal(await form.get("file").text(), "test");
  assert.equal(form.has("pass_comment"), false);
  const minimal = buildEditionFormData(12, { code: "", trustee_id: null });
  assert.deepEqual([...minimal.keys()], ["product_requirement_id"]);
  assert.throws(() => buildEditionFormData(undefined, {}));
});
