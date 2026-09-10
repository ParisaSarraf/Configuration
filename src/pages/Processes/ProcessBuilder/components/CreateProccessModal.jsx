import { Col, Form, Input, message, Row, Select } from "antd";
import Modal from "../../../../components/Modal";
import { useEffect, useMemo } from "react";
import {
  useCreateProcess,
  useUpdateProcess,
} from "../../../../QueryServises/workflowQuery";
import { useFormDefinitions } from "../../../../QueryServises/formsQuery";

const CreateProccessModal = ({
  isOpen,
  closeModal,
  modalMode,
  modalData,
  listQuery,
}) => {
  const [form] = Form.useForm();
  const createMutation = useCreateProcess();
  const updateMutation = useUpdateProcess();
  const FormDefinitionData = useFormDefinitions();

  useEffect(() => {
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        name: modalData.name,
        form_definition: modalData.form_definition?.name,
      });
    }
  }, [modalMode, modalData]);

  const groupedOptions = useMemo(() => {
    const data = FormDefinitionData.data || [];
    const groupsMap = new Map();
    const UNCATEGORIZED_KEY = "uncategorized";

    data.forEach((item) => {
      const key = item.category ? item.category.id : UNCATEGORIZED_KEY;
      const label = item.category ? item.category.name : "بدون دسته‌بندی";

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          label,
          order: item.category ? item.category.order : Infinity,
          options: [],
        });
      }

      groupsMap.get(key).options.push({
        label: item.name,
        value: item.id,
      });
    });

    return Array.from(groupsMap.values()).sort((a, b) => a.order - b.order);
  }, [FormDefinitionData.data]);

  const onFinish = async (values) => {
    const payload = {
      name: values.name,
      form_definition: values.form_definition,
    };
    try {
      if (modalMode === "edit") {
        await updateMutation.mutateAsync({
          processId: modalData.id,
          ...payload,
        });
        message.success("فرایند با موفقیت ویرایش شد");
      } else {
        await createMutation.mutateAsync(payload);
        message.success("فرایند با موفقیت ایجاد شد");
      }
      closeModal();
      listQuery.refetch();
    } catch (error) {
      console.log(error);
      message.error("خطا در ایجاد فرایند");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      destroyOnClose
      onClose={closeModal}
      title="مرحله ۱ — ثبت فرایند"
      okText="ثبت فرایند"
      cancelText="انصراف"
      onSubmit={() => form.submit()}
      onCancel={closeModal}
    >
      <div className="flex flex-col gap-2">
        <p className="m-0 text-xs leading-7 text-slate-500">
          فقط نام فرایند را وارد کنید. طراحی ایستگاه‌ها و عملیات در مرحله‌ی بعد
          و داخل فرایندساز انجام می‌شود.
        </p>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Row gutter={16}>
            <Col span={modalMode === "create" ? 12 : 24}>
              <Form.Item
                name="name"
                label="نام فرایند"
                rules={[
                  { required: true, message: "لطفا نام فرایند را وارد کنید" },
                ]}
              >
                <Input
                  maxLength={255}
                  autoFocus
                  placeholder="مانند: درخواست خرید"
                />
              </Form.Item>
            </Col>
            {modalMode === "create" && (
              <Col span={12}>
                <Form.Item
                  name="form_definition"
                  label="تعریف فرم"
                  
                >
                  <Select
                    showSearch
                    placeholder="یک فرم را انتخاب کنید"
                    optionFilterProp="label"
                    loading={FormDefinitionData.isLoading}
                    options={groupedOptions}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default CreateProccessModal;
