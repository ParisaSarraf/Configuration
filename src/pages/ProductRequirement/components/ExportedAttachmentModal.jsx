import { useRef, useState } from "react";
import { Button, message, Modal, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateProductRequirementExported } from "../../../QueryServises/productRequirementQuery";
import { buildExportedAttachmentFormData } from "../utils/exportedAttachment";

export default function ExportedAttachmentModal({ assignment, editionId, refetch, onSaved, onClose }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const queryClient = useQueryClient();
  const { mutateAsync: updateExport } = useUpdateProductRequirementExported();

  const save = async () => {
    if (lock.current) return;
    let formData;
    try { formData = buildExportedAttachmentFormData(assignment?.id, files[0]?.originFileObj); }
    catch (error) { message.warning(error.message); return; }
    lock.current = true;
    setBusy(true);
    try {
      await updateExport({ productRequirementExportedId: assignment.id, formData });
    } catch (error) {
      const detail = error?.response?.data?.detail || error?.response?.data?.message;
      message.error(typeof detail === "string" ? detail : error?.message || "ذخیره فایل ناموفق بود");
      lock.current = false;
      setBusy(false);
      return;
    }

    message.success("فایل تخصیص با موفقیت ذخیره شد");
    // A successful PUT must not be repeated just because refreshing failed.
    // Refresh first: invalidating the destination tree concurrently could cancel
    // this refetch when the current view already belongs to that product.
    let refreshResult;
    try { refreshResult = await refetch(); } catch { /* Report below. */ }
    const refreshes = await Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: ["product-requirement-acceptor", editionId] }),
      ...(assignment?.to_product_id != null ? [queryClient.invalidateQueries({
        queryKey: ["product-requirement-tree", assignment.to_product_id],
      })] : []),
    ]);
    const freshData = !refreshResult?.isError ? refreshResult?.data : null;
    if (!freshData || refreshes.some((result) => result.status === "rejected" || result.value?.isError))
      message.warning("فایل ذخیره شد، اما به‌روزرسانی اطلاعات کامل نشد؛ صفحه را دوباره بارگذاری کنید");
    onSaved?.(freshData);
    lock.current = false;
    setBusy(false);
    onClose();
  };

  return <Modal open title="افزودن یا جایگزینی فایل تخصیص" onOk={save}
    okText="ذخیره فایل" cancelText="انصراف" confirmLoading={busy}
    okButtonProps={{ disabled: !files.length || busy }} closable={!busy}
    maskClosable={!busy} keyboard={!busy} onCancel={() => { if (!lock.current) onClose(); }} destroyOnClose>
    <p>تخصیص {assignment?.id} — محصول مقصد {assignment?.to_product_id ?? "نامشخص"}</p>
    <p className="text-xs text-slate-500">با انتخاب فایل جدید، فایل قبلی این تخصیص جایگزین می‌شود.</p>
    <Upload beforeUpload={() => false} maxCount={1} fileList={files} disabled={busy}
      onChange={({ fileList }) => setFiles(fileList.slice(-1))}>
      <Button icon={<UploadOutlined />} disabled={busy}>انتخاب فایل</Button>
    </Upload>
  </Modal>;
}
