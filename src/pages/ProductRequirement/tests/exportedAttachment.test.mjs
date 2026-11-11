import test from "node:test";
import assert from "node:assert/strict";
import { buildExportedAttachmentFormData } from "../utils/exportedAttachment.js";

test("attachment update sends a file without overwriting workflow or destination", async () => {
  const file = new File(["contents"], "test.txt", { type: "text/plain" });
  const form = buildExportedAttachmentFormData(20, file);
  assert.deepEqual([...form.keys()], ["file_1"]);
  assert.equal(form.get("file_1").name, "test.txt");
  assert.equal(await form.get("file_1").text(), "contents");
  assert.equal(form.has("state"), false);
  assert.equal(form.has("to_product_id"), false);
  assert.equal(form.has("pass_comment"), false);
});
test("requires assignment and real file", () => {
  assert.throws(() => buildExportedAttachmentFormData(null, new Blob(["x"])));
  assert.throws(() => buildExportedAttachmentFormData(20, null));
  assert.throws(() => buildExportedAttachmentFormData(20, "name.txt"));
});
