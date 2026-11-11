import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Input, message, TreeSelect } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../../../components/Modal";
import { useMyAxios } from "../../../hooks/useMyAxios";
import {
  useChildProductById,
  useChildProductByIdKey,
} from "../../../QueryServises/productQuery";
import { useCreatepProductRequirementExported } from "../../../QueryServises/productRequirementQuery";
import { canExportRequirementEdition } from "../utils/requirementTree";
import {
  buildExportEditionPayload,
  exportFailureStatus,
  retryableDestinationIds,
  mapDestinationProducts,
  replaceDestinationChildren,
} from "../utils/exportEdition";

const AcknowledgmentOfRequirement = ({
  isOpen,
  modalData,
  currentProduct,
  closeModal,
  refetch,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [results, setResults] = useState({});
  const submitLock = useRef(false);
  const queryClient = useQueryClient();
  const { myAxios } = useMyAxios();
  const productId = currentProduct?.id;
  const edition = modalData?.edition;
  const requirement = modalData?.product_requirements;
  const {
    data: children,
    isFetching,
    isError,
    refetch: refetchChildren,
  } = useChildProductById(productId, {
    enabled: isOpen && productId != null,
    placeholderData: undefined,
  });
  const { mutateAsync: exportEdition } = useCreatepProductRequirementExported();

  useEffect(() => {
    setTreeData(mapDestinationProducts(children, productId));
  }, [children, productId]);

  const loadChildren = async (node) => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: useChildProductByIdKey(node.id),
        queryFn: () =>
          myAxios
            .get(`/product/get-product-child-by-id/${node.id}`)
            .then((response) => response.data),
      });
      if (!Array.isArray(data)) throw new Error("پاسخ زیرمحصولات معتبر نیست");
      const mapped = mapDestinationProducts(data, productId, [String(node.id)]);
      setTreeData((previous) =>
        replaceDestinationChildren(previous, node.id, mapped),
      );
    } catch (error) {
      message.error("دریافت زیرمجموعه‌های محصول ناموفق بود؛ دوباره تلاش کنید");
      throw error;
    }
  };

  const onFinish = async (values) => {
    if (submitLock.current) return;
    const ids = [...new Map((values.to_product_ids || []).map((id) => [String(id), id])).values()];
    if (!canExportRequirementEdition(requirement, edition)) {
      message.error("صدور نسخه واردشده یا نسخه‌ای که هنوز به مرحله تأیید نرسیده است امکان‌پذیر نیست");
      return;
    }
    if (!ids.length || ids.some((id) => String(id) === String(productId))) {
      message.error("حداقل یک زیرمحصول معتبر انتخاب کنید");
      return;
    }
    let requests;
    try {
      requests = retryableDestinationIds(ids, results).map((id) => ({
        id, payload: buildExportEditionPayload(edition?.id, id, values.pass_comment),
      }));
    } catch (error) {
      message.error(error.message);
      return;
    }
    if (!requests.length) return;

    const findTitle = (nodes, id) => {
      for (const node of nodes) {
        if (String(node.id) === String(id)) return node.title;
        const child = findTitle(node.children || [], id);
        if (child) return child;
      }
      return null;
    };
    submitLock.current = true;
    setSubmitting(true);
    const next = { ...results };
    try {
      // The API accepts one to_product_id, so issue one request per product.
      for (const { id, payload } of requests) {
        const key = String(id);
        const title = findTitle(treeData, id) || `محصول ${id}`;
        try {
          await exportEdition(payload);
          next[key] = { status: "success", title };
        } catch (error) {
          const detail = error?.response?.data?.detail || error?.response?.data?.message;
          next[key] = {
            status: exportFailureStatus(error),
            title,
            error: typeof detail === "string" ? detail : "پاسخ معتبر از سرور دریافت نشد",
          };
        }
        setResults({ ...next });
      }
      // An ambiguous response may still have changed server state: refresh it too.
      const refreshes = await Promise.allSettled([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ["product-requirement-acceptor", edition?.id] }),
        ...requests.map(({ id }) => queryClient.invalidateQueries({ queryKey: ["product-requirement-tree", id] })),
      ]);
      if (refreshes.some((result) => result.status === "rejected" || result.value?.isError))
        message.warning("به‌روزرسانی فهرست‌ها کامل نشد؛ در صورت نیاز دوباره بارگذاری کنید");
      if (ids.every((id) => next[String(id)]?.status === "success")) {
        message.success("نسخه الزام به همه محصولات انتخاب‌شده ارسال شد");
        closeModal();
      } else {
        message.warning("نتیجه ارسال برای هر محصول را بررسی کنید");
      }
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const invalidChildren = children != null && !Array.isArray(children);
  const hasResults = Object.keys(results).length > 0;
  const hasFailures = Object.values(results).some((result) => result.status === "failed");
  return (
    <Modal
      isOpen={isOpen}
      title="ارسال نسخه الزام به زیرمحصول"
      size={650}
      onClose={() => {
        if (!submitLock.current) closeModal();
      }}
      onSubmit={() => {
        if (!submitLock.current) form.submit();
      }}
      loading={submitting}
      closable={!submitting}
      maskClosable={!submitting}
      keyboard={!submitting}
      okText={hasResults ? "تلاش دوباره برای موارد ناموفق" : "ارسال"}
      cancelText="بستن"
      okButtonProps={{ disabled: hasResults && !hasFailures }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="نسخه الزام">
          <Input
            disabled
            value={
              edition?.full_code ||
              edition?.code ||
              (edition?.id != null ? `نسخه ${edition.id}` : "انتخاب نشده")
            }
          />
        </Form.Item>
        {edition?.id == null && (
          <Alert type="error" showIcon message="شناسه نسخه الزام موجود نیست" />
        )}
        {productId == null && (
          <Alert type="error" showIcon message="محصول جاری انتخاب نشده است" />
        )}
        {(isError || invalidChildren) && (
          <Alert
            type="error"
            showIcon
            message="دریافت زیرمجموعه‌های محصول ناموفق بود"
            action={
              <Button onClick={() => refetchChildren()}>تلاش دوباره</Button>
            }
          />
        )}
        <Form.Item
          label="محصولات مقصد"
          name="to_product_ids"
          rules={[{ required: true, type: "array", min: 1, message: "لطفاً حداقل یک زیرمحصول انتخاب کنید" }]}
          extra="برای نمایش زیرمجموعه‌های بیشتر، شاخه محصول را باز کنید."
        >
          <TreeSelect
            treeData={treeData}
            multiple
            maxTagCount="responsive"
            loadData={loadChildren}
            loading={isFetching}
            disabled={
              submitting || hasResults || productId == null ||
              ((isError || invalidChildren) && !treeData.length)
            }
            placeholder="انتخاب یک یا چند زیرمحصول"
            allowClear
            showSearch
            treeNodeFilterProp="title"
            notFoundContent={
              isFetching ? "در حال بارگذاری..." : "زیرمحصولی یافت نشد"
            }
          />
        </Form.Item>
        <Form.Item label="وضعیت اولیه">
          <Input disabled value="اجرا (10)" />
        </Form.Item>
        <Form.Item label="توضیحات" name="pass_comment">
          <Input.TextArea rows={3} disabled={submitting || hasResults} />
        </Form.Item>
        <p className="text-xs text-slate-500">پس از ارسال، برای افزودن فایل به هر محصول از «جزئیات نسخه» و ویرایش فایل تخصیص استفاده کنید.</p>
        {hasResults && <div className="mt-4 space-y-2" aria-live="polite">
          {Object.entries(results).map(([id, result]) => <Alert key={id} showIcon
            type={result.status === "success" ? "success" : result.status === "failed" ? "error" : "warning"}
            message={`${result.title}: ${result.status === "success" ? "ارسال شد" : result.status === "failed" ? "ارسال ناموفق" : "نتیجه نامشخص"}`}
            description={result.status === "unknown"
              ? "پیش از تلاش مجدد، ثبت شدن این محصول را در فهرست محصولات پذیرنده بررسی کنید؛ ممکن است درخواست در سرور ثبت شده باشد."
              : result.status === "failed" ? result.error : undefined} />)}
          {hasFailures && <p className="text-xs text-slate-500">تلاش دوباره فقط برای موارد ناموفق انجام می‌شود؛ موارد موفق یا نامشخص دوباره ارسال نمی‌شوند.</p>}
        </div>}
      </Form>
    </Modal>
  );
};
export default AcknowledgmentOfRequirement;
