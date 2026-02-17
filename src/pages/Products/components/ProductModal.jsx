import { Col, Form, Input, InputNumber, message, Row, Select } from "antd";
import { useEffect, useState } from "react";
import {
  useCreateProduct,
  useFinalCodeProductById,
  useProductList,
  useUpdateProduct,
} from "../../../QueryServises/productQuery";
import { useOneCoreSetting } from "../../../QueryServises/settingQuery";
import { useGenusProductList } from "../../../QueryServises/genusQuery";
import Modal from "../../../components/Modal";
import { usePersonalityProductList } from "@/QueryServises/personalityQuery/index.js";
import { SearchOutlined } from "@ant-design/icons";
import TS from "../../../components/TreeSelect";
import { useStandardCodePersonalityById } from "../../../QueryServises/StandardCodeQuery";

const ProductModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  refetch,
}) => {
  const [form] = Form.useForm();
  const { data: productData } = useProductList();

  const { isPending: isCreating, mutateAsync: createProduct } =
    useCreateProduct();
  const { isPending: isUpdating, mutateAsync: updateProduct } =
    useUpdateProduct();

  const [selectedPersonalityId, setSelectedPersonalityId] = useState(null);
  const [selectedParentCodeId, setSelectedParentCodeId] = useState(null);
  const [productCode, setProductCode] = useState("");
  const [finalCode, setFinalCode] = useState("");

  const { data: casingData } = useOneCoreSetting("casing");
  const { data: genusData } = useGenusProductList();
  const { data: personalityData } = usePersonalityProductList();
  const { data: parentCodeData } = useFinalCodeProductById(
    selectedParentCodeId?.value,
  );
  const { data: standardCodesResponse } = useStandardCodePersonalityById(
    selectedPersonalityId?.value,
  );

  const parentCodeId = parentCodeData?.code || "";

  useEffect(() => {
    if (!isOpen) return;
    form.resetFields();
    if (modalMode === "edit" && modalData) {
      form.setFieldsValue({
        persian_title: modalData.persian_title,
        code: modalData.code,
        quantity: modalData.quantity,
        store_code: modalData.store_code,
        status: modalData.status,
        weight: modalData.weight,
        height: modalData.height,
        width: modalData.width,
        warehouse_code: modalData.warehouse_code,
        warehouse_quantity: modalData.warehouse_quantity,

        // strandardCode
        standard_code_id: modalData.standard_code?.value, //1
        alternative_standard_code_id: modalData?.alternative_standard_code
          ? {
              value: modalData.alternative_standard_code.id,
              label: modalData.alternative_standard_code.full_ware_house_code,
            }
          : null, //2

        // storeCode
        store_code: modalData.store_code, //3
        alternative_store_code: modalData.alternative_store_code, //4

        length: modalData.length,
        price: modalData.price,
        external_diagonal: modalData.external_diagonal,
        internal_diagonal: modalData.internal_diagonal,
        parent_id: modalData.parent_code,
        parent_code_id: modalData.parent_code,
        casing_id: modalData.casing
          ? { value: modalData.casing.id, label: modalData.casing.name }
          : null,
        genus_id: modalData.genus?.id
          ? { value: modalData.genus.id, label: modalData.genus.name }
          : null,
        alternative_genus_id: modalData.alternative_genus?.id
          ? {
              value: modalData.alternative_genus.id,
              label: modalData.alternative_genus.name,
            }
          : null,
        pro_type: modalData.pro_type,
        description: modalData.description,
        personality_id: modalData.product_personalities?.map(
          (personality) => personality?.personality?.id,
        ),
        standard_code_id: modalData.standard_code?.id
          ? {
              value: modalData.standard_code.id,
              label: modalData.standard_code.name,
            }
          : null,

        // brand1: modalData.brand1,
        // brand1_desc: modalData.brand1_desc,
        // brand2: modalData.brand2,
        // brand2_desc: modalData.brand2_desc,
        employer_code: modalData.employer_code,
        final_code: modalData.final_code || "",
      });
      setProductCode(modalData.code || "");
    } else if (modalMode === "addToParent" && modalData) {
      const parentLabelInValueObject = {
        value: modalData.id,
        label: modalData.persian_title || modalData.code,
      };
      setSelectedParentCodeId(parentLabelInValueObject);
      form.setFieldsValue({
        parent_id: parentLabelInValueObject,
        parent_code_id: parentLabelInValueObject,
      });
    } else if (modalMode === "add") {
      form.setFieldsValue({
        parent_id: null,
        parent_code_id: null,
        final_code: parentCodeId || "",
      });
    }
  }, [modalMode, modalData, isOpen]);

  useEffect(() => {
    const newFinalCode = `${parentCodeId || ""}-${productCode || ""}`;
    setFinalCode(newFinalCode);
    form.setFieldsValue({ final_code: newFinalCode });
  }, [parentCodeId, productCode]);

  const handleParentChange = (value) => setSelectedParentCodeId(value);
  const onFinish = (values) => {
    const payload = {
      persian_title: values.persian_title,
      code: values.code,
      quantity: values.quantity,

      warehouse_code: values.warehouse_code,
      status: values.status,
      weight: values.weight,
      height: values.height,
      width: values.width,
      warehouse_quantity: values.warehouse_quantity,
      length: values.length,
      price: values.price,
      external_diagonal: values.external_diagonal,
      internal_diagonal: values.internal_diagonal,
      pro_type: values.pro_type,
      description: values.description,
      // brand1: values.brand1,
      // brand1_desc: values.brand1_desc,
      // brand2: values.brand2,
      // brand2_desc: values.brand2_desc,
      employer_code: values.employer_code,
      final_code: finalCode,

      parent_id: values.parent_id?.value,
      parent_code_id: values.parent_code_id?.value,

      standard_code_id: values.standard_code_id?.value, //1
      alternative_standard_code_id: values.alternative_standard_code_id, //2

      store_code: values.store_code, //3
      alternative_store_code: values.alternative_store_code, //4

      casing_id: values.casing_id?.value,

      genus_id: values.genus_id?.value,
      alternative_genus_id: values.alternative_genus_id?.value,

      personality_id: values.personality_id?.value,
    };

    const finalPayload = {};
    if (modalMode === "edit") {
      Object.keys(payload).forEach((key) => {
        const newVal = payload[key];
        const oldVal = modalData ? modalData[key] : undefined;
        if (
          JSON.stringify(newVal) !== JSON.stringify(oldVal) &&
          newVal !== undefined
        ) {
          finalPayload[key] = newVal;
        }
      });
      if (values.code === modalData?.code) {
        delete finalPayload.code;
      }
    }

    const actionPayload = modalMode === "edit" ? finalPayload : payload;

    const action =
      modalMode === "edit"
        ? updateProduct({ productId: modalData.id, ...actionPayload })
        : createProduct(actionPayload);

    action
      .then(() => {
        message.success(
          modalMode === "edit" ? "محصول ویرایش شد" : "محصول اضافه شد",
        );
        closeModal();
        modalMode !== "edit" && refetch();
      })
      .catch((error) => {
        message.error(error.response?.data?.message || "خطا در عملیات");
        console.error(error);
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} محصول`}
      size={1200}
      onClose={closeModal}
      onSubmit={() => form.submit()}
      mode={modalMode}
      loading={isCreating || isUpdating}
      className="scroll-modal"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="parent_id" label="شاخه والد">
              <TS
                labelInValue
                data={productData}
                placeholder="شاخه والد"
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="parent_code_id" label="ارث بری کد">
              <TS
                labelInValue
                data={productData}
                placeholder="ارث بری کد"
                onChange={handleParentChange}
                allowClear
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="عنوان فارسی"
              name="persian_title"
              rules={[
                { required: true, message: "لطفاً عنوان فارسی را وارد کنید" },
              ]}
            >
              <Input placeholder="عنوان فارسی" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="کد محصول"
              name="code"
              rules={[
                { required: true, message: "لطفاً کد محصول را وارد کنید" },
              ]}
            >
              <Input
                placeholder="کد محصول"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="تعداد"
              name="quantity"
              rules={[
                { required: true, message: "لطفاً تعداد محصول را وارد کنید" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="کد نهایی" name="final_code">
              <Input value={finalCode} disabled />
            </Form.Item>
          </Col>
          {/* <Col span={4}>
            <Form.Item label="نام تجاری 1" name="brand1">
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="شرح نام تجاری 1" name="brand1_desc">
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="نام تجاری 2" name="brand2">
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="شرح نام تجاری 2" name="brand2_desc">
              <Input />
            </Form.Item>
          </Col> */}
          <Col span={4}>
            <Form.Item label="کد کارفرما" name="employer_code">
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="وضعیت" name="status">
              <Select
                placeholder="وضعیت"
                style={{ width: "100%" }}
                options={[
                  { label: "فعال", value: "active" },
                  { label: "غیرفعال", value: "inactive" },
                  { label: "موقت", value: "temp" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="هویت"
              name="personality_id"
              rules={[{ required: true, message: "لطفاً هویت را انتخاب کنید" }]}
            >
              <TS
                labelInValue
                data={personalityData}
                placeholder="هویت"
                onChange={(selected) => {
                  setSelectedPersonalityId(selected);
                  const findPersonality = (list, id) => {
                    for (const item of list) {
                      if (item.id === id) return item;
                      if (item.children?.length) {
                        const found = findPersonality(item.children, id);
                        if (found) return found;
                      }
                    }
                    return null;
                  };
                  // const selectedItem = findPersonality(
                  //   personalityData,
                  //   selected?.value,
                  // );

                  // if (selectedItem) {
                  //   form.setFieldsValue({
                  //     // persian_title:
                  //     //   selectedItem.personality_codes?.[0]?.description,
                  //     store_code:
                  //       selectedItem?.personality_codes?.[0]
                  //         ?.full_ware_house_code,
                  //     alternative_store_code:
                  //       selectedItem?.personality_codes?.[0]
                  //         ?.full_ware_house_code,
                  //   });
                  // }
                }}
              />
            </Form.Item>
          </Col>

          {/* کد استاندارد */}
          <Col span={6}>
            <Form.Item label="کد استاندارد" name="standard_code_id">
              <Select
                allowClear
                labelInValue
                placeholder="کد استاندارد"
                showSearch
                style={{ width: "100%" }}
                options={
                  standardCodesResponse?.personality_codes?.map((item) => ({
                    value: item.id,
                    label: item.name,
                    description: item.description,
                  })) || []
                }
                disabled={!standardCodesResponse?.personality_codes?.length}
                onChange={(selected) => {
                  if (selected) {
                    const selectedOption =
                      standardCodesResponse?.personality_codes?.find(
                        (item) => item.id === selected.value,
                      );

                    if (selectedOption) {
                      form.setFieldsValue({
                        persian_title: selectedOption.description,
                      });
                    }
                    if (selectedOption) {
                      form.setFieldsValue({
                        // persian_title:
                        //   selectedItem.personality_codes?.[0]?.description,
                        store_code: selectedOption?.full_ware_house_code,
                      });
                    }
                  } else {
                    form.setFieldsValue({ persian_title: "" });
                  }
                }}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                suffixIcon={<SearchOutlined />}
              />
            </Form.Item>
          </Col>

          {/* کد انبار */}
          <Col span={6}>
            <Form.Item label="کد انبار" name="store_code">
              <Input />
            </Form.Item>
          </Col>

          {/* کد استاندارد جایگزین */}
          <Col span={6}>
            <Form.Item
              label="کد استاندارد جایگزین "
              name="alternative_standard_code_id"
            >
              <Select
                allowClear
                labelInValue
                placeholder="کد استاندارد جایگزین "
                showSearch
                style={{ width: "100%" }}
                options={
                  standardCodesResponse?.personality_codes?.map((item) => ({
                    value: item.id,
                    label: item.name,
                    description: item.description,
                  })) || []
                }
                disabled={!standardCodesResponse?.personality_codes?.length}
                onChange={(selected) => {
                  if (selected) {
                    const selectedOption =
                      standardCodesResponse?.personality_codes?.find(
                        (item) => item.id === selected.value,
                      );

                    if (selectedOption) {
                      form.setFieldsValue({
                        persian_title: selectedOption.description,
                      });
                    }
                    if (selectedOption) {
                      form.setFieldsValue({
                        alternative_store_code:
                          selectedOption?.full_ware_house_code,
                      });
                    }
                  } else {
                    form.setFieldsValue({ persian_title: "" });
                  }
                }}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                suffixIcon={<SearchOutlined />}
              />
            </Form.Item>
          </Col>

          {/* کد انبار جایگزین */}
          <Col span={6}>
            <Form.Item label="کد انبار جایگزین" name="alternative_store_code">
              <Input />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="ماده اولیه" name="genus_id">
              <TS labelInValue data={genusData} placeholder="ماده اولیه" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="ماده اولیه جایگزین" name="alternative_genus_id">
              <TS
                labelInValue
                data={genusData}
                placeholder="ماده اولیه جایگزین"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="پوشش" name="casing_id">
              <TS labelInValue data={casingData} placeholder="پوشش" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="قیمت" name="price">
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, "،")
                }
                parser={(value) => value.replace(/\$\s?|(،*)/g, "")}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="تعداد انبار" name="warehouse_quantity">
              <Input />
            </Form.Item>
          </Col>

          <Col span={2}>
            <Form.Item label="طول" name="length">
              <InputNumber style={{ width: "100%" }} stringMode />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="عرض" name="width">
              <InputNumber style={{ width: "100%" }} stringMode />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="ارتفاع" name="height">
              <InputNumber style={{ width: "100%" }} stringMode />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="قطر داخل" name="internal_diagonal">
              <InputNumber style={{ width: "100%" }} stringMode />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="قطر خارجی" name="external_diagonal">
              <InputNumber style={{ width: "100%" }} stringMode />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="وزن" name="weight">
              <InputNumber style={{ width: "100%" }} stringMode />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="توضیحات" name="description">
              <Input.TextArea rows={1} placeholder="توضیحات محصول" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ProductModal;
