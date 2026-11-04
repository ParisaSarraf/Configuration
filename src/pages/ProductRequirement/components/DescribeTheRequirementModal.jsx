import { useMemo, useRef, useState } from "react";
import { Alert, Button, Col, Form, Input, message, Row, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Modal from "../../../components/Modal";
import { useProductContext } from "../../../Services/Context/ProductContext";
import { useCreateProductRequirementEdition, useProductRequirementList } from "../../../QueryServises/productRequirementQuery";
import { useRoleList } from "../../../QueryServises/roleQuery";
import { buildEditionFormData, getSourceEditionOptions, normalizeEditionSearch } from "../utils/editionForm";

const DescribeTheRequirementModal = ({ isOpen, closeModal, modalData, refetch }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  // activeProducts is ordered by opening time; do not silently substitute the current product.
  const { activeProducts } = useProductContext();
  const rootProduct = activeProducts?.[0];
  const rootProductId = rootProduct?.id;
  const requirement = modalData?.product_requirements;
  const { data: sourceData, isFetching: sourcesFetching, isError: sourcesError, refetch: refetchSources } =
    useProductRequirementList(rootProductId, { enabled: isOpen && rootProductId != null });
  const { data: roles, isFetching: rolesFetching, isError: rolesError, refetch: refetchRoles } =
    useRoleList({ enabled: isOpen, placeholderData: undefined });
  const { mutateAsync: createEdition } = useCreateProductRequirementEdition();
  const sourceOptions = useMemo(() => getSourceEditionOptions(sourceData), [sourceData]);

  const onFinish = async (values) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);
    try {
      const payload = buildEditionFormData(requirement?.id, values);
      await createEdition(payload);
      message.success("نسخه الزام با موفقیت ثبت شد");
      // The POST succeeded even if reloading the list fails: do not invite a duplicate submission.
      try {
        const result = await refetch();
        if (result?.isError) message.warning("نسخه ثبت شد، اما به‌روزرسانی فهرست ناموفق بود");
      } catch {
        message.warning("نسخه ثبت شد، اما به‌روزرسانی فهرست ناموفق بود");
      }
      closeModal();
    } catch (error) {
      message.error(error?.response?.data?.detail || error?.response?.data?.message || error?.message || "ثبت نسخه الزام ناموفق بود");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen} title="تعریف نسخه الزام" size={700}
      onClose={() => { if (!submitLock.current) closeModal(); }}
      onSubmit={() => { if (!submitLock.current) form.submit(); }}
      loading={submitting} closable={!submitting} maskClosable={!submitting}
      keyboard={!submitting} className="scroll-modal" destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="الزام محصول">
          <Input value={requirement?.title || (requirement?.id != null ? `الزام ${requirement.id}` : "انتخاب نشده")} disabled />
        </Form.Item>
        {requirement?.id == null && <Alert type="error" showIcon message="شناسه الزام محصول موجود نیست" />}
        {rootProductId == null && <Alert type="warning" showIcon message="محصول سرشاخه در فهرست محصولات باز موجود نیست؛ انتخاب منبع در دسترس نیست." />}
        {sourcesError && <Alert type="error" showIcon message="دریافت نسخه‌های محصول سرشاخه ناموفق بود" action={<Button onClick={() => refetchSources()}>تلاش دوباره</Button>} />}
        <Form.Item label="نسخه منبع الزام" name="source_requirement_edition_id" extra={rootProductId != null ? `محصول سرشاخه: ${rootProduct?.name || rootProduct?.persian_title || rootProductId} — فقط نسخه‌ها قابل انتخاب‌اند.` : undefined}>
          <Select
            showSearch allowClear loading={sourcesFetching}
            disabled={rootProductId == null || (sourcesError && sourceData == null)}
            placeholder="جستجو و انتخاب نسخه منبع"
            options={sourceOptions}
            filterOption={(input, option) => normalizeEditionSearch(option?.searchText).includes(normalizeEditionSearch(input))}
            notFoundContent={sourcesFetching ? "در حال بارگذاری..." : "موردی یافت نشد"}
          />
        </Form.Item>
        {rolesError && <Alert type="error" showIcon message="دریافت لیست سمت‌ها ناموفق بود" action={<Button onClick={() => refetchRoles()}>تلاش دوباره</Button>} />}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="متولی الزام (سمت)" name="trustee_id">
              <Select showSearch allowClear optionFilterProp="label" loading={rolesFetching}
                disabled={rolesError && !roles} placeholder="انتخاب سمت"
                options={(Array.isArray(roles) ? roles : []).map((role) => ({ value: role.id, label: role.name }))} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}><Form.Item label="کد نسخه" name="code"><Input /></Form.Item></Col>
        </Row>
        <Form.Item label="دلیل" name="reason"><Input.TextArea rows={2} /></Form.Item>
        <Form.Item label="توضیحات" name="description"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item label="فایل" name="file" valuePropName="fileList" getValueFromEvent={(event) => Array.isArray(event) ? event : event?.fileList}>
          <Upload beforeUpload={() => false} maxCount={1}><Button icon={<UploadOutlined />}>انتخاب فایل</Button></Upload>
        </Form.Item>
        <Form.Item label="توضیح فایل" name="file_description"><Input.TextArea rows={2} /></Form.Item>
      </Form>
    </Modal>
  );
};
export default DescribeTheRequirementModal;
