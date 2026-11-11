import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");
const table = read("../components/ProductDocumentListSerial/ProductDocumentListSerial.jsx");
const detail = read("../components/ProductDocumentListSerial/components/EditionDetailViewModal.jsx");
const edit = read("../components/ProductDocumentListSerial/components/AddProductDocumentListSerialLogModal.jsx");

test("history files do not use edition access flags or the edition tree hook", () => {
  for (const source of [table, detail, edit])
    assert.doesNotMatch(source, /useDocumentFileAccess|canViewEdition|documentFileAccess|documentState/);
  assert.match(table, /dataIndex:\s*\["logData",\s*"file"\]/);
  assert.match(table, /render:\s*\(fileUrl\)\s*=>\s*fileUrl\s*\?/);
  assert.match(detail, /renderFileButton\("فایل بررسی",\s*specificLog\?\.file\)/);
  assert.match(edit, /<FileUploader\s+maxFiles=\{1\}\s*\/>/);
});

test("document edition file checks remain in other document views", () => {
  const workflow = read("../components/CombineFiles/CombineFiles.jsx");
  const details = read("../../../components/DetailModal/DetailModal.jsx");
  assert.match(workflow, /useDocumentFileAccess/);
  assert.match(workflow, /documentFileAccess=\{canOpenEditionFiles\}/);
  assert.match(details, /useDocumentFileAccess/);
});
