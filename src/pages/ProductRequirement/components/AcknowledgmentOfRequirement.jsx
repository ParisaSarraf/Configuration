import { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, Input, message, TreeSelect, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "../../../components/Modal";
import { useMyAxios } from "../../../hooks/useMyAxios";
import { useChildProductById, useChildProductByIdKey } from "../../../QueryServises/productQuery";
import { useCreatepProductRequirementExported } from "../../../QueryServises/productRequirementQuery";
import { canExportRequirementEdition } from "../utils/requirementTree";
import { buildExportEditionFormData, mapDestinationProducts, replaceDestinationChildren } from "../utils/exportEdition";

const AcknowledgmentOfRequirement = ({ isOpen, modalData, currentProduct, closeModal, refetch }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const submitLock = useRef(false);
  const queryClient = useQueryClient();
  const { myAxios } = useMyAxios();
  const productId = currentProduct?.id;
  const edition = modalData?.edition;
  const requirement = modalData?.product_requirements;
  const { data: children, isFetching, isError, refetch: refetchChildren } = useChildProductById(productId, {
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
        queryFn: () => myAxios.get(`/product/get-product-child-by-id/${node.id}`).then((response) => response.data),
      });
      if (!Array.isArray(data)) throw new Error("پاسخ زیرمحصولات معتبر نیست");
      const mapped = mapDestinationProducts(data, productId, [String(node.id)]);
      setTreeData((previous) => replaceDestinationChildren(previous, node.id, mapped));
    } catch (error) {
      message.error("دریافت زیرمجموعه‌های محصول ناموفق بود؛ دوباره تلاش کنید");
      throw error;
    }
  };

  const onFinish = async (values) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    try {
      if (!canExportRequirementEdition(requirement, edition)) throw new Error("صدور نسخه واردشده یا نسخه‌ای که هنوز به مرحله تأیید نرسیده است امکان‌پذیر نیست");
      if (String(values.to_product_id) === String(productId)) throw new Error("محصول مقصد باید زیرمجموعه محصول جاری باشد");
      await exportEdition(buildExportEditionFormData(edition?.id, values));
      message.success("نسخه الزام به محصول مقصد ارسال شد");
      // A failed refresh must not be reported as a failed POST or encourage a duplicate.
      try {
        const result = await refetch();
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["product-requirement-acceptor", requirement?.id] }),
          queryClient.invalidateQueries({ queryKey: ["product-requirement-tree", values.to_product_id] }),
        ]);
        if (result?.isError) message.warning("ارسال انجام شد، اما به‌روزرسانی فهرست ناموفق بود");
      } catch {
        message.warning("ارسال انجام شد، اما به‌روزرسانی فهرست ناموفق بود");
      }
      closeModal();
    } catch (error) {
      message.error(error?.response?.data?.detail || error?.response?.data?.message || error?.message || "ارسال نسخه ناموفق بود");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const invalidChildren = children != null && !Array.isArray(children);
  return (
    <Modal isOpen={isOpen} title="ارسال نسخه الزام به زیرمحصول" size={650}
      onClose={() => { if (!submitLock.current) closeModal(); }}
      onSubmit={() => { if (!submitLock.current) form.submit(); }}
      loading={submitting} closable={!submitting} maskClosable={!submitting} keyboard={!submitting}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="نسخه الزام">
          <Input disabled value={edition?.full_code || edition?.code || (edition?.id != null ? `نسخه ${edition.id}` : "انتخاب نشده")} />
        </Form.Item>
        {edition?.id == null && <Alert type="error" showIcon message="شناسه نسخه الزام موجود نیست" />}
        {productId == null && <Alert type="error" showIcon message="محصول جاری انتخاب نشده است" />}
        {(isError || invalidChildren) && <Alert type="error" showIcon message="دریافت زیرمجموعه‌های محصول ناموفق بود" action={<Button onClick={() => refetchChildren()}>تلاش دوباره</Button>} />}
        <Form.Item label="محصول مقصد" name="to_product_id" rules={[{ required: true, message: "لطفاً یک زیرمحصول انتخاب کنید" }]}
          extra="برای نمایش زیرمجموعه‌های بیشتر، شاخه محصول را باز کنید.">
          <TreeSelect treeData={treeData} loadData={loadChildren} loading={isFetching}
            disabled={productId == null || ((isError || invalidChildren) && !treeData.length)}
            placeholder="انتخاب زیرمجموعه محصول جاری" allowClear showSearch
            treeNodeFilterProp="title"
            notFoundContent={isFetching ? "در حال بارگذاری..." : "زیرمحصولی یافت نشد"} />
        </Form.Item>
        <Form.Item label="وضعیت اولیه"><Input disabled value="اجرا (10)" /></Form.Item>
        <Form.Item label="توضیحات" name="pass_comment"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item label="فایل ضمیمه" name="file_1" valuePropName="fileList" getValueFromEvent={(event) => Array.isArray(event) ? event : event?.fileList}>
          <Upload beforeUpload={() => false} maxCount={1}><Button icon={<UploadOutlined />}>انتخاب فایل</Button></Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default AcknowledgmentOfRequirement;
