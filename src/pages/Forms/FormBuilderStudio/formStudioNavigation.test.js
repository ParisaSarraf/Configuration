import test from "node:test";
import assert from "node:assert/strict";
import { formStudioPath, openFormStudio } from "./formStudioNavigation.js";

test("opens Form Studio scoped to the selected definition", () => {
  const calls = [];
  assert.equal(openFormStudio((path) => calls.push(path), 42, "/forms"), true);
  assert.deepEqual(calls, ["/forms/42/studio"]);
});

test("does not open a duplicate when the scoped studio is already open", () => {
  const calls = [];
  assert.equal(openFormStudio((path) => calls.push(path), 42, "/forms/42/studio"), true);
  assert.deepEqual(calls, []);
});

test("ignores missing and invalid definition ids", () => {
  assert.equal(formStudioPath(undefined), null);
  assert.equal(formStudioPath("invalid"), null);
  assert.equal(openFormStudio(() => assert.fail("must not navigate"), 0), false);
});
