// Only send the replacement file: the update API exposes the other fields as
// optional, and resending cached workflow state could overwrite a newer change.
export function buildExportedAttachmentFormData(assignmentId, file) {
  if (assignmentId == null || String(assignmentId).trim() === "")
    throw new Error("شناسه تخصیص موجود نیست");
  if (!(file instanceof Blob)) throw new Error("لطفاً فایل ضمیمه را انتخاب کنید");
  const form = new FormData();
  form.append("file_1", file);
  return form;
}
