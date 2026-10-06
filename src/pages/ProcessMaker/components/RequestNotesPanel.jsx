import { useMemo, useState } from "react";
import { Alert, App, Button, Empty, Input, Popconfirm, Skeleton } from "antd";
import {
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from "@ant-design/icons";

import {
  useCreateRequestNote,
  useDeleteRequestNote,
  useRequestNotesByRequestId,
  useUpdateRequestNote,
} from "@/QueryServises/workflowQuery";
import { getApiErrorMessage } from "@/Services/forms/formUtils";
import { normalizeRequestNotes } from "@/Services/workflow/workflowPayloads";
import { getUserFromToken } from "@/utils/ExportFromToken";
import { georgianDateTimeToJalaliDateTime } from "@utils/timeTool.jsx";

const jalali = (value) => {
  if (!value) return "—";
  const text = georgianDateTimeToJalaliDateTime(String(value));
  return text && !String(text).includes("Invalid") ? text : "—";
};

const fullName = (user) => {
  if (!user) return "نامشخص";
  return (
    [user.name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.username ||
    "نامشخص"
  );
};

const noteIdOf = (note) => {
  const parsed = Number(note?.id ?? note?.pk);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const noteOwnerIdOf = (note) =>
  Number(
    note?.created_by?.id ??
      note?.created_by_id ??
      (typeof note?.created_by === "number" ? note.created_by : NaN),
  ) || null;

/**
 * بخش «یادداشت‌های درخواست» بر پایه APIهای بک‌اند:
 * GET    /workflow/get-notes-by-request-id/<id>
 * POST   /workflow/add-request-note/
 * PUT    /workflow/update-request-note/<id>
 * DELETE /workflow/delete-request-note/<id>
 */
const RequestNotesPanel = ({
  requestId,
  className = "",
  compact = false,
  title = "یادداشت‌های درخواست",
}) => {
  const { message } = App.useApp();
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");

  const query = useRequestNotesByRequestId(requestId, {
    enabled: Boolean(requestId),
    staleTime: 30 * 1000,
  });
  const createNote = useCreateRequestNote();
  const updateNote = useUpdateRequestNote();
  const deleteNote = useDeleteRequestNote();

  const currentUserId = useMemo(() => {
    const user = getUserFromToken();
    return Number(user?.user_id ?? user?.id) || null;
  }, []);

  const notes = useMemo(() => normalizeRequestNotes(query.data), [query.data]);

  const resetDraft = () => {
    setDraftTitle("");
    setDraftNote("");
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditNote("");
  };

  const submitDraft = async () => {
    if (!requestId) return;
    const note = draftNote.trim();
    if (!note) {
      message.warning("متن یادداشت نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await createNote.mutateAsync({
        requestId,
        title: draftTitle.trim(),
        note,
      });
      resetDraft();
      message.success("یادداشت ثبت شد.");
    } catch (error) {
      message.error(getApiErrorMessage(error, "ثبت یادداشت انجام نشد."));
    }
  };

  const submitEdit = async (note) => {
    const id = noteIdOf(note);
    const body = editNote.trim();
    if (!id) return;
    if (!body) {
      message.warning("متن یادداشت نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await updateNote.mutateAsync({
        noteId: id,
        requestId,
        title: editTitle.trim(),
        note: body,
      });
      stopEditing();
      message.success("یادداشت به‌روزرسانی شد.");
    } catch (error) {
      message.error(getApiErrorMessage(error, "ویرایش یادداشت انجام نشد."));
    }
  };

  const removeNote = async (note) => {
    const id = noteIdOf(note);
    if (!id) return;
    try {
      await deleteNote.mutateAsync({ noteId: id, requestId });
      if (editingId === id) stopEditing();
      message.success("یادداشت حذف شد.");
    } catch (error) {
      message.error(getApiErrorMessage(error, "حذف یادداشت انجام نشد."));
    }
  };

  const busy =
    createNote.isPending || updateNote.isPending || deleteNote.isPending;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-white">
          <CommentOutlined className="text-blue-500" />
          <span>{title}</span>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {notes.length.toLocaleString("fa-IR")} مورد
        </span>
      </div>

      {!requestId ? (
        <Alert
          type="info"
          showIcon
          message="برای ثبت یادداشت، ابتدا درخواست باید ایجاد شده باشد."
        />
      ) : (
        <>
          <div className="mb-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <Input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="عنوان یادداشت (اختیاری)"
              maxLength={255}
              disabled={busy}
            />
            <Input.TextArea
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              placeholder="متن یادداشت برای این درخواست..."
              autoSize={{ minRows: compact ? 2 : 3, maxRows: 8 }}
              disabled={busy}
            />
            <div className="flex justify-end">
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                loading={createNote.isPending}
                disabled={busy}
                onClick={submitDraft}
              >
                افزودن یادداشت
              </Button>
            </div>
          </div>

          {query.isLoading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : query.isError ? (
            <Alert
              type="error"
              showIcon
              message={getApiErrorMessage(
                query.error,
                "دریافت یادداشت‌های درخواست انجام نشد.",
              )}
              action={
                <Button size="small" onClick={() => query.refetch()}>
                  تلاش مجدد
                </Button>
              }
            />
          ) : notes.length ? (
            <div className="space-y-2">
              {notes.map((note, index) => {
                const id = noteIdOf(note);
                const editing = editingId != null && editingId === id;
                const mine =
                  currentUserId != null &&
                  noteOwnerIdOf(note) === currentUserId;
                return (
                  <article
                    key={id ?? `note-${index}`}
                    className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                  >
                    {editing ? (
                      <div className="space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          placeholder="عنوان یادداشت (اختیاری)"
                          maxLength={255}
                          disabled={busy}
                        />
                        <Input.TextArea
                          value={editNote}
                          onChange={(event) => setEditNote(event.target.value)}
                          autoSize={{ minRows: 2, maxRows: 8 }}
                          disabled={busy}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="small"
                            onClick={stopEditing}
                            disabled={busy}
                          >
                            انصراف
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            loading={updateNote.isPending}
                            disabled={busy}
                            onClick={() => submitEdit(note)}
                          >
                            ذخیره
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {note?.title ? (
                          <div className="mb-1 text-xs font-bold text-slate-800 dark:text-slate-100">
                            {note.title}
                          </div>
                        ) : null}
                        <p className="mb-2 whitespace-pre-wrap text-xs leading-6 text-slate-600 dark:text-slate-300">
                          {note?.note || "—"}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800">
                          <span className="flex items-center gap-1.5">
                            <UserOutlined />
                            <span>{fullName(note?.created_by)}</span>
                            {mine ? (
                              <span className="rounded bg-blue-50 px-1.5 py-0.5 font-semibold text-blue-500 dark:bg-blue-950/40">
                                شما
                              </span>
                            ) : null}
                          </span>
                          <span className="flex items-center gap-2">
                            <span>{jalali(note?.created_at)}</span>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              disabled={busy}
                              onClick={() => {
                                setEditingId(id);
                                setEditTitle(note?.title ?? "");
                                setEditNote(note?.note ?? "");
                              }}
                            />
                            <Popconfirm
                              title="این یادداشت حذف شود؟"
                              okText="حذف"
                              cancelText="انصراف"
                              okButtonProps={{ danger: true }}
                              onConfirm={() => removeNote(note)}
                            >
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                disabled={busy}
                              />
                            </Popconfirm>
                          </span>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="هنوز یادداشتی برای این درخواست ثبت نشده است."
            />
          )}
        </>
      )}
    </div>
  );
};

export default RequestNotesPanel;
