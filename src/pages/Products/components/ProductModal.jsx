import {
  Alert,
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal as AntModal,
  Row,
  Select,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  useCreateProduct,
  useFinalCodeProductById,
  useUpdateProduct,
} from "../../../QueryServises/productQuery";
import {
  useCreateCoreSetting,
  useOneCoreSetting,
} from "../../../QueryServises/settingQuery";
import {
  useCreateGenusProduct,
  useGenusProductList,
} from "../../../QueryServises/genusQuery";
import Modal from "../../../components/Modal";
import {
  useCreatePersonalityProduct,
  usePersonalityProductList,
  usePersonalityWarehouseList,
} from "@/QueryServises/personalityQuery/index.js";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import TS from "../../../components/TreeSelect";
import {
  useCreateStandardCode,
  useFetchPersonalityStandardWarehouseCodes,
  useFetchGenusStandardWarehouseCodes,
  useStandardCodePersonalityById,
} from "../../../QueryServises/StandardCodeQuery";
import TsLazy from "../../../components/LazyTreeSelect/LazyTreeSelect";
import { useLazyProductTreeSelect } from "../../../hooks/useLazyProductTreeSelect";
import {
  getPersonalityWarehouseProposal,
  normalizePersonalityWarehouseCode,
  personalityWarehouseCodeExists,
} from "../../../Services/personalityWarehouseCodes";
import {
  getServerFullWarehouseCode,
  getStandardWarehouseProposal,
  readPersonalityStandardCodes,
  readGenusStandardCodes,
  standardWarehouseCodeExists,
} from "../../../Services/standardWarehouseCodes";

const flattenLookupItems = (items = []) =>
  items.flatMap((item) => [item, ...flattenLookupItems(item.children || [])]);

const getCreatedRecord = (payload) => payload?.data ?? payload?.result ?? payload;

const codesForIdentity = (payload, id) => {
  if (id == null || !payload) return [];
  try {
    return readPersonalityStandardCodes(payload, id).codes;
  } catch {
    return [];
  }
};

const ProductModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  refetch,
  productData,
}) => {
  const [form] = Form.useForm();
  const [quickForm] = Form.useForm();
  const [quickCreate, setQuickCreate] = useState(null);
  const [quickSearch, setQuickSearch] = useState({});
  const [warehouseProposal, setWarehouseProposal] = useState(null);
  const [checkingWarehouseCode, setCheckingWarehouseCode] = useState(false);
  const warehouseRequestId = useRef(0);
  const quickSubmitPending = useRef(false);
  const { refetch: fetchWarehouseIdentities } = usePersonalityWarehouseList();
  const fetchPersonalityStandards = useFetchPersonalityStandardWarehouseCodes();
  const fetchGenusStandards = useFetchGenusStandardWarehouseCodes();
  const fetchStandardScope = (config) => config.parentKey === "genus"
    ? fetchGenusStandards(config.parentId)
    : fetchPersonalityStandards(config.parentId);
  const { treeData, loadChildren } = useLazyProductTreeSelect(productData);

  const { isPending: isCreating, mutateAsync: createProduct } =
    useCreateProduct();
  const { isPending: isUpdating, mutateAsync: updateProduct } =
    useUpdateProduct();

  const [selectedPersonalityId, setSelectedPersonalityId] = useState(null);
  const [
    selectedAlternativePersonalityId,
    setSelectedAlternativePersonalityId,
  ] = useState(null);
  const [selectedParentCodeId, setSelectedParentCodeId] = useState(null);
  const [genusStandardOptions, setGenusStandardOptions] = useState([]);
  const [alterNativeGenusStandardOptions, setAlterNativeGenusStandardOptions] =
    useState([]);

  const [productCode, setProductCode] = useState("");
  const [finalCode, setFinalCode] = useState("");

  const { data: casingData, refetch: refetchCasing } =
    useOneCoreSetting("casing");
  const { data: genusData, refetch: refetchGenus } = useGenusProductList();
  const { data: personalityData, refetch: refetchPersonality } =
    usePersonalityProductList();
  const { mutateAsync: createPersonality, isPending: isCreatingPersonality } =
    useCreatePersonalityProduct();
  const { mutateAsync: createGenus, isPending: isCreatingGenus } =
    useCreateGenusProduct();
  const { mutateAsync: createCasing, isPending: isCreatingCasing } =
    useCreateCoreSetting();
  const { mutateAsync: createStandardCode, isPending: isCreatingStandard } =
    useCreateStandardCode();
  const { data: parentCodeData } = useFinalCodeProductById(
    selectedParentCodeId?.value,
  );
  const {
    data: standardCodesResponse,
    refetch: refetchStandardCodes,
  } = useStandardCodePersonalityById(selectedPersonalityId?.value);

  const {
    data: alternativeStandardCodesResponse,
    refetch: refetchAlternativeStandardCodes,
  } = useStandardCodePersonalityById(selectedAlternativePersonalityId?.value);

  const selectedGenusValue = Form.useWatch("genus_id", form);
  const selectedAlternativeGenusValue = Form.useWatch(
    "alternative_genus_id",
    form,
  );
  const quickWarehouseCode = Form.useWatch("warehouse_code", quickForm);
  const selectedIdentityCodes = codesForIdentity(
    standardCodesResponse, selectedPersonalityId?.value,
  );
  const selectedAlternativeIdentityCodes = codesForIdentity(
    alternativeStandardCodesResponse, selectedAlternativePersonalityId?.value,
  );
  const identityStandardQuickCreate =
    quickCreate?.type === "standard" && quickCreate.parentKey === "personality";
  const genusStandardQuickCreate =
    quickCreate?.type === "standard" && quickCreate.parentKey === "genus";
  const scopedStandardQuickCreate = identityStandardQuickCreate || genusStandardQuickCreate;
  const standardScopeLabel = genusStandardQuickCreate ? "ماده اولیه" : "هویت";
  const hasWarehouseSuggestion =
    quickCreate?.type === "personality" || scopedStandardQuickCreate;
  const matchingStandard = scopedStandardQuickCreate
    ? warehouseProposal?.codes?.find(
        (code) => normalizePersonalityWarehouseCode(code.warehouse_code) ===
          normalizePersonalityWarehouseCode(quickWarehouseCode),
      )
    : null;
  const quickFullWarehouseCode = getServerFullWarehouseCode(matchingStandard);

  const parentCodeId = parentCodeData?.code || "";

  useEffect(() => {
    if (!isOpen) return;
    form.resetFields();

    const statusMap = {
      active: "فعال",
      inactive: "غیرفعال",
      temp: "موقت",
    };

    // ===== EDIT MODE =====
    if (modalMode === "edit" && modalData) {
      // status
      const statusValue = modalData.status
        ? {
            value: modalData.status,
            label: statusMap[modalData.status],
          }
        : null;

      // personality
      const personalityValue = modalData.product_personalities?.[0]
        ? {
            value: modalData.product_personalities[0].personality.id,
            label: modalData.product_personalities[0].personality.name,
          }
        : null;

      // Alternative Personality
      const AlternativePersonalityValue = modalData
        .product_alternative_personalities?.[0]
        ? {
            value:
              modalData.product_alternative_personalities[0].personality.id,
            label:
              modalData.product_alternative_personalities[0].personality.name,
          }
        : null;

      // parent
      const parentValue = modalData.parent_code
        ? {
            value: modalData.parent_code.id,
            label:
              modalData.parent_code.persian_title || modalData.parent_code.code,
          }
        : null;

      // casing
      const casingValue = modalData.casing
        ? { value: modalData.casing.id, label: modalData.casing.name }
        : null;

      // genus
      const genusValue = modalData.genus
        ? { value: modalData.genus.id, label: modalData.genus.name }
        : null;

      const alternativeGenusValue = modalData.alternative_genus
        ? {
            value: modalData.alternative_genus.id,
            label: modalData.alternative_genus.name,
          }
        : null;

      // standard code
      const standardCodeValue = modalData.standard_code
        ? {
            value: modalData.standard_code.id,
            label: modalData.standard_code.name,
          }
        : null;

      const alternativeStandardCodeValue = modalData.alternative_standard_code
        ? {
            value: modalData.alternative_standard_code.id,
            label: modalData.alternative_standard_code.full_ware_house_code,
          }
        : null;
      const genusStandardCodeValue = modalData.genus_standard_code
        ? {
            value: modalData.genus_standard_code.id,
            label: modalData.genus_standard_code.full_ware_house_code,
          }
        : null;
      const alternativeGenusStandardCodeValue =
        modalData.alternative_genus_standard_code
          ? {
              value: modalData.alternative_genus_standard_code.id,
              label:
                modalData.alternative_genus_standard_code.full_ware_house_code,
            }
          : null;

      form.setFieldsValue({
        persian_title: modalData.persian_title,
        code: modalData.code,
        quantity: modalData.quantity,
        employer_code: modalData.employer_code,
        final_code: modalData.final_code,

        status: statusValue,
        personality_id: personalityValue,
        alternative_personality_id: AlternativePersonalityValue,

        parent_id: parentValue,
        parent_code_id: parentValue,

        casing_id: casingValue,
        genus_id: genusValue,
        alternative_genus_id: alternativeGenusValue,
        genus_standard_code_id: genusStandardCodeValue,
        alternative_genus_standard_code_id: alternativeGenusStandardCodeValue,

        standard_code_id: standardCodeValue,
        alternative_standard_code_id: alternativeStandardCodeValue,

        store_code: modalData.store_code,
        alternative_store_code: modalData.alternative_store_code,

        price: modalData.price,
        warehouse_quantity: modalData.warehouse_quantity,
        warehouse_code: modalData.warehouse_code,

        length: modalData.length,
        width: modalData.width,
        height: modalData.height,
        weight: modalData.weight,
        internal_diagonal: modalData.internal_diagonal,
        external_diagonal: modalData.external_diagonal,

        description: modalData.description,

        genus_warehouse_code: modalData?.genus_warehouse_code,
        alternative_genus_warehouse_code:
          modalData?.alternative_genus_warehouse_code,
      });

      // sync states
      setProductCode(modalData.code || "");
      setSelectedPersonalityId(personalityValue);
      setSelectedAlternativePersonalityId(AlternativePersonalityValue);
      setSelectedParentCodeId(parentValue);
    }

    // ===== ADD TO PARENT =====
    else if (modalMode === "addToParent" && modalData) {
      const parentValue = {
        value: modalData.id,
        label: modalData.persian_title || modalData.code,
      };

      setSelectedParentCodeId(parentValue);

      form.setFieldsValue({
        parent_id: parentValue,
        parent_code_id: parentValue,
      });
    }

    // ===== ADD MODE =====
    else if (modalMode === "add") {
      setProductCode("");
      setSelectedPersonalityId(null);
      setSelectedAlternativePersonalityId(null);
      setSelectedParentCodeId(null);

      form.setFieldsValue({
        parent_id: null,
        parent_code_id: null,
        final_code: "",
      });
    }
  }, [isOpen, modalMode, modalData]);

  useEffect(() => {
    const newFinalCode = `${parentCodeId || ""}-${productCode || ""}`;
    setFinalCode(newFinalCode);
    form.setFieldsValue({ final_code: newFinalCode });
  }, [parentCodeId, productCode]);

  const suggestWarehouseCode = async (requestId, config) => {
    setWarehouseProposal({ status: "loading" });
    try {
      let proposal;
      if (config.type === "standard" && ["personality", "genus"].includes(config.parentKey)) {
        const result = await fetchStandardScope(config);
        proposal = {
          ...getStandardWarehouseProposal(result.codes),
          codes: result.codes,
          parent: result.parent,
        };
      } else {
        const result = await fetchWarehouseIdentities({ throwOnError: true });
        if (result.isError) throw result.error;
        proposal = getPersonalityWarehouseProposal(result.data);
      }
      if (requestId !== warehouseRequestId.current) return;
      setWarehouseProposal({ ...proposal, status: "ready" });
      if (
        proposal.nextCode !== null &&
        !quickForm.isFieldTouched("warehouse_code")
      ) {
        quickForm.setFieldValue("warehouse_code", proposal.nextCode);
      }
    } catch {
      if (requestId !== warehouseRequestId.current) return;
      setWarehouseProposal({
        status: "error",
        message: config.type === "standard"
          ? `استانداردهای ${config.parentLabel} دریافت نشد؛ کد انبار خودکار پیشنهاد نشد.`
          : "فهرست هویت‌ها دریافت نشد؛ کد طبقه‌بندی خودکار پیشنهاد نشد.",
      });
    }
  };

  const openQuickCreate = (config) => {
    const requestId = ++warehouseRequestId.current;
    const suggestedName = String(quickSearch[config.targetField] || "").trim();
    quickForm.resetFields();
    quickForm.setFieldsValue({
      name: suggestedName,
      order: config.type === "genus" || config.type === "casing" ? 0 : undefined,
      parent_id: config.parentId,
    });
    setQuickCreate(config);
    setWarehouseProposal(null);
    if (
      config.type === "personality" ||
      (config.type === "standard" && ["personality", "genus"].includes(config.parentKey))
    ) suggestWarehouseCode(requestId, config);
  };

  const closeQuickCreate = () => {
    warehouseRequestId.current += 1;
    setQuickCreate(null);
    setWarehouseProposal(null);
    quickForm.resetFields();
  };

  const resolveCreatedOption = async ({ created, refetchResult, name }) => {
    const record = getCreatedRecord(created);
    if (record?.id != null) {
      return {
        value: record.id,
        label: record.name || record.title || name,
        warehouse_code: record.warehouse_code,
      };
    }
    const refreshed = refetchResult?.data ?? [];
    const match = flattenLookupItems(Array.isArray(refreshed) ? refreshed : []).find(
      (item) => String(item?.name || item?.title || "").trim() === name.trim(),
    );
    return match ? { value: match.id, label: match.name || match.title } : null;
  };

  const submitQuickCreate = async (values) => {
    if (!quickCreate || quickSubmitPending.current) return;
    if (
      hasWarehouseSuggestion &&
      warehouseProposal?.status === "loading"
    ) {
      return;
    }
    const name = values.name?.trim();
    if (!name) return;

    quickSubmitPending.current = true;
    try {
      let created;
      let refetchResult;
      let option;
      let standardRecord;

      if (quickCreate.type === "personality") {
        setCheckingWarehouseCode(true);
        // پیش از ثبت دوباره از سرور بخوانیم تا پیشنهادِ زمان بازشدن کهنه نباشد.
        const result = await fetchWarehouseIdentities({ throwOnError: true });
        if (result.isError) throw result.error;
        const proposal = getPersonalityWarehouseProposal(result.data);
        setWarehouseProposal({ ...proposal, status: "ready" });
        const warehouseCode = normalizePersonalityWarehouseCode(
          values.warehouse_code,
        );
        if (personalityWarehouseCodeExists(result.data, warehouseCode)) {
          if (proposal.nextCode !== null)
            quickForm.setFieldValue("warehouse_code", proposal.nextCode);
          message.warning(
            proposal.nextCode !== null
              ? `این کد طبقه‌بندی برای یک هویت ثبت شده است. کد ${proposal.nextCode} جایگزین شد؛ دوباره تأیید کنید.`
              : "این کد طبقه‌بندی برای یک هویت ثبت شده است؛ کد دیگری وارد کنید.",
          );
          return;
        }
        created = await createPersonality({
          name,
          warehouse_code: warehouseCode,
          ...(values.parent_id != null && { parent_id: values.parent_id }),
        });
        // id پاسخ ساخت معتبر است؛ شکست تازه‌سازی لیست نباید ثبت را تکرار کند.
        option = await resolveCreatedOption({ created, name });
        try {
          refetchResult = await refetchPersonality({ throwOnError: true });
        } catch {
          message.warning("هویت ثبت شد، اما تازه‌سازی فهرست انجام نشد.");
        }
        option = option || await resolveCreatedOption({ created, refetchResult, name });
      } else if (quickCreate.type === "genus") {
        created = await createGenus({
          name,
          order: Number(values.order ?? 0),
          material: values.material,
          internal_code: values.internal_code,
          ...(values.parent_id != null && {
            parent_id: Number(values.parent_id?.value ?? values.parent_id),
          }),
        });
        option = await resolveCreatedOption({ created, name });
        try {
          refetchResult = await refetchGenus({ throwOnError: true });
        } catch {
          message.warning("ماده اولیه ثبت شد، اما تازه‌سازی فهرست انجام نشد.");
        }
        option = option || await resolveCreatedOption({ created, refetchResult, name });
      } else if (quickCreate.type === "casing") {
        created = await createCasing({
          name,
          type: "casing",
          order: Number(values.order ?? 0),
        });
        refetchResult = await refetchCasing();
        option = await resolveCreatedOption({ created, refetchResult, name });
      } else if (quickCreate.type === "standard") {
        if (!quickCreate.parentId) {
          message.warning(`ابتدا ${quickCreate.parentLabel} را انتخاب کنید`);
          return;
        }
        const warehouseCode = normalizePersonalityWarehouseCode(values.warehouse_code);
        if (scopedStandardQuickCreate) {
          setCheckingWarehouseCode(true);
          const fresh = await fetchStandardScope(quickCreate);
          const proposal = getStandardWarehouseProposal(fresh.codes);
          setWarehouseProposal({
            ...proposal, codes: fresh.codes, parent: fresh.parent, status: "ready",
          });
          if (standardWarehouseCodeExists(fresh.codes, warehouseCode)) {
            if (proposal.nextCode !== null)
              quickForm.setFieldValue("warehouse_code", proposal.nextCode);
            message.warning(
              proposal.nextCode !== null
                ? `این کد انبار در همین ${standardScopeLabel} ثبت شده است. کد ${proposal.nextCode} جایگزین شد؛ دوباره تأیید کنید.`
                : `این کد انبار در همین ${standardScopeLabel} ثبت شده است؛ کد دیگری وارد کنید.`,
            );
            return;
          }
        }
        created = await createStandardCode({
          name,
          [quickCreate.parentKey]: quickCreate.parentId,
          warehouse_code: warehouseCode,
          description: values.description,
        });
        const record = getCreatedRecord(created);
        try {
          if (quickCreate.parentKey === "genus") {
            const refreshed = await fetchGenusStandards(quickCreate.parentId);
            refetchResult = { data: { ...refreshed.parent, genus_codes: refreshed.codes } };
          } else {
            refetchResult = await quickCreate.refetch?.({ throwOnError: true });
          }
        } catch {
          message.warning("کد استاندارد ثبت شد، اما تازه‌سازی فهرست انجام نشد.");
        }
        const refreshedPayload = refetchResult?.data;
        let refreshedCodes = [];
        if (refreshedPayload) {
          try {
            refreshedCodes = (quickCreate.parentKey === "genus"
              ? readGenusStandardCodes : readPersonalityStandardCodes)(
                refreshedPayload, quickCreate.parentId,
              ).codes;
          } catch {
            refreshedCodes = [];
          }
        }
        const match = refreshedCodes.find(
          (item) => record?.id != null
            ? String(item.id) === String(record.id)
            : String(item?.name || "").trim() === name,
        );
        const finalRecord = record?.id != null ? record : match;
        standardRecord = finalRecord
          ? {
              ...match, ...finalRecord,
              full_ware_house_code:
                getServerFullWarehouseCode(finalRecord) || getServerFullWarehouseCode(match),
            }
          : null;
        option = finalRecord
          ? { value: finalRecord.id, label: finalRecord.name || name }
          : null;
      }

      if (!option) {
        message.warning("مورد ساخته شد؛ برای مشاهده، فهرست را دوباره باز کنید");
        closeQuickCreate();
        return;
      }

      form.setFieldValue(quickCreate.targetField, option);
      if (quickCreate.targetField === "personality_id") {
        setSelectedPersonalityId(option);
        form.setFieldsValue({ standard_code_id: undefined, store_code: undefined });
      }
      if (quickCreate.targetField === "alternative_personality_id") {
        setSelectedAlternativePersonalityId(option);
        form.setFieldsValue({
          alternative_standard_code_id: undefined, alternative_store_code: undefined,
        });
      }
      if (quickCreate.targetField === "genus_id") {
        setGenusStandardOptions([]);
        form.setFieldsValue({
          genus_standard_code_id: undefined,
          genus_warehouse_code: undefined,
        });
      }
      if (quickCreate.targetField === "alternative_genus_id") {
        setAlterNativeGenusStandardOptions([]);
        form.setFieldsValue({
          alternative_genus_standard_code_id: undefined,
          alternative_genus_warehouse_code: undefined,
        });
      }
      if (quickCreate.warehouseField) {
        // کد کامل فقط از پاسخ سرور؛ هرگز کد جزئی یا ترکیب محلی را جای آن ننشانیم.
        form.setFieldValue(
          quickCreate.warehouseField,
          getServerFullWarehouseCode(standardRecord) ?? undefined,
        );
      }
      if (quickCreate.targetField === "genus_standard_code_id") {
        setGenusStandardOptions((previous) => [
          ...previous.filter((item) => item.value !== option.value),
          {
            ...option,
            full_ware_house_code: getServerFullWarehouseCode(standardRecord),
          },
        ]);
      }
      if (quickCreate.targetField === "alternative_genus_standard_code_id") {
        setAlterNativeGenusStandardOptions((previous) => [
          ...previous.filter((item) => item.value !== option.value),
          {
            ...option,
            full_ware_house_code: getServerFullWarehouseCode(standardRecord),
          },
        ]);
      }

      const fullCode = getServerFullWarehouseCode(standardRecord);
      if (quickCreate.type === "standard" && fullCode === null)
        message.warning("سرور کد انبار کامل را برنگرداند؛ هیچ کدی ترکیب یا حدس زده نشد.");
      message.success(
        `${quickCreate.title} اضافه و انتخاب شد${fullCode === null ? "" : ` — کد انبار کامل: ${fullCode}`}`,
      );
      closeQuickCreate();
    } catch (error) {
      message.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          `افزودن ${quickCreate.title} انجام نشد`,
      );
    } finally {
      quickSubmitPending.current = false;
      setCheckingWarehouseCode(false);
    }
  };

  const quickCreateDropdown = (menu, config) => (
    <div>
      {menu}
      <Divider className="my-1" />
      <Button
        type="text"
        block
        icon={<PlusOutlined />}
        disabled={config.disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => openQuickCreate(config)}
        className="text-right"
      >
        {config.disabled
          ? `ابتدا ${config.parentLabel} را انتخاب کنید`
          : `افزودن ${config.title} جدید`}
      </Button>
    </div>
  );

  const quickCreating =
    checkingWarehouseCode ||
    isCreatingPersonality ||
    isCreatingGenus ||
    isCreatingCasing ||
    isCreatingStandard;

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
      alternative_standard_code_id: values.alternative_standard_code_id?.value, //2

      store_code: values.store_code, //3
      alternative_store_code: values.alternative_store_code, //4

      casing_id: values.casing_id?.value,

      genus_id: values.genus_id?.value,
      genus_standard_code_id: values.genus_standard_code_id?.value,
      alternative_genus_id: values.alternative_genus_id?.value,
      alternative_genus_standard_code_id:
        values.alternative_genus_standard_code_id?.value,

      personality_id: values.personality_id?.value,
      alternative_personality_id: values.alternative_personality_id?.value,

      alternative_genus_warehouse_code: values.alternative_genus_warehouse_code,
      genus_warehouse_code: values.genus_warehouse_code,
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
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Divider orientation="start">
            <h1 className="font-bold">اطلاعات اصلی</h1>
          </Divider>

          <>
            {/* شاخه والد */}
            <Col span={6}>
              <Form.Item name="parent_id" label="شاخه والد">
                <TsLazy
                  treeData={treeData}
                  loadData={loadChildren}
                  labelInValue
                  placeholder="شاخه والد"
                  allowClear
                />
              </Form.Item>
            </Col>

            {/* ارث بری کد */}
            <Col span={6}>
              <Form.Item name="parent_code_id" label="ارث بری کد">
                <TsLazy
                  treeData={treeData}
                  loadData={loadChildren}
                  labelInValue
                  placeholder="ارث بری کد"
                  allowClear
                />
              </Form.Item>
            </Col>

            {/* عنوان فارسی */}
            <Col span={6}>
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

            {/* کد محصول */}
            <Col span={6}>
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

            {/* تعداد */}
            <Col span={6}>
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

            {/* کد نهایی */}
            <Col span={6}>
              <Form.Item label="کد نهایی" name="final_code">
                <Input value={finalCode} disabled />
              </Form.Item>
            </Col>

            {/* کد کارفرما */}
            <Col span={6}>
              <Form.Item label="کد کارفرما" name="employer_code">
                <Input />
              </Form.Item>
            </Col>

            {/* وضعیت */}
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
          </>

          <Divider orientation="start">
            <h1 className="font-bold">هویت</h1>
          </Divider>
          <>
            {/* هویت */}
            <Col span={8}>
              <Form.Item
                label="هویت"
                name="personality_id"
                rules={[
                  { required: true, message: "لطفاً هویت را انتخاب کنید" },
                ]}
              >
                <TS
                  labelInValue
                  data={personalityData}
                  placeholder="هویت"
                  onSearchChange={(value) =>
                    setQuickSearch((previous) => ({
                      ...previous,
                      personality_id: value,
                    }))
                  }
                  dropdownRender={(menu) =>
                    quickCreateDropdown(menu, {
                      type: "personality",
                      targetField: "personality_id",
                      title: "هویت",
                    })
                  }
                  onChange={(selected) => {
                    if (String(selected?.value) !== String(selectedPersonalityId?.value))
                      form.setFieldsValue({
                        standard_code_id: undefined,
                        store_code: undefined,
                      });
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
                  }}
                />
              </Form.Item>
            </Col>

            {/* کد استاندارد */}
            <Col span={8}>
              <Form.Item label="کد استاندارد" name="standard_code_id">
                <Select
                  allowClear
                  labelInValue
                  placeholder="کد استاندارد"
                  showSearch
                  style={{ width: "100%" }}
                  options={
                    selectedIdentityCodes.map((item) => ({
                      value: item.id,
                      label: item.name,
                      description: item.description,
                    })) || []
                  }
                  disabled={!selectedPersonalityId?.value}
                  onSearch={(value) =>
                    setQuickSearch((previous) => ({
                      ...previous,
                      standard_code_id: value,
                    }))
                  }
                  dropdownRender={(menu) =>
                    quickCreateDropdown(menu, {
                      type: "standard",
                      targetField: "standard_code_id",
                      warehouseField: "store_code",
                      title: "کد استاندارد",
                      parentId: selectedPersonalityId?.value,
                      parentKey: "personality",
                      parentLabel: "هویت",
                      disabled: !selectedPersonalityId?.value,
                      refetch: refetchStandardCodes,
                    })
                  }
                  onChange={(selected) => {
                    if (selected) {
                      const selectedOption =
                        selectedIdentityCodes.find(
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
                      form.setFieldsValue({ persian_title: "", store_code: undefined });
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
            <Col span={8}>
              <Form.Item label="کد انبار کامل" name="store_code">
                <Input />
              </Form.Item>
            </Col>
          </>

          <Divider orientation="start">
            <h1 className="font-bold">هویت جایگزین</h1>
          </Divider>
          <>
            {/* هویت جایگزین */}
            <Col span={8}>
              <Form.Item label="هویت جایگزین" name="alternative_personality_id">
                <TS
                  labelInValue
                  data={personalityData}
                  placeholder="هویت جایگزین"
                  onSearchChange={(value) =>
                    setQuickSearch((previous) => ({
                      ...previous,
                      alternative_personality_id: value,
                    }))
                  }
                  dropdownRender={(menu) =>
                    quickCreateDropdown(menu, {
                      type: "personality",
                      targetField: "alternative_personality_id",
                      title: "هویت جایگزین",
                    })
                  }
                  onChange={(selected) => {
                    if (String(selected?.value) !== String(selectedAlternativePersonalityId?.value))
                      form.setFieldsValue({
                        alternative_standard_code_id: undefined,
                        alternative_store_code: undefined,
                      });
                    setSelectedAlternativePersonalityId(selected);
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
                  }}
                />
              </Form.Item>
            </Col>

            {/* کد استاندارد جایگزین */}
            <Col span={8}>
              <Form.Item
                label="کد استاندارد هویت جایگزین "
                name="alternative_standard_code_id"
              >
                <Select
                  allowClear
                  labelInValue
                  placeholder="کد استاندارد هویت جایگزین "
                  showSearch
                  style={{ width: "100%" }}
                  options={
                    selectedAlternativeIdentityCodes.map(
                      (item) => ({
                        value: item.id,
                        label: item.name,
                        description: item.description,
                      }),
                    ) || []
                  }
                  disabled={!selectedAlternativePersonalityId?.value}
                  onSearch={(value) =>
                    setQuickSearch((previous) => ({
                      ...previous,
                      alternative_standard_code_id: value,
                    }))
                  }
                  dropdownRender={(menu) =>
                    quickCreateDropdown(menu, {
                      type: "standard",
                      targetField: "alternative_standard_code_id",
                      warehouseField: "alternative_store_code",
                      title: "کد استاندارد هویت جایگزین",
                      parentId: selectedAlternativePersonalityId?.value,
                      parentKey: "personality",
                      parentLabel: "هویت جایگزین",
                      disabled: !selectedAlternativePersonalityId?.value,
                      refetch: refetchAlternativeStandardCodes,
                    })
                  }
                  onChange={(selected) => {
                    if (selected) {
                      const selectedOption =
                        selectedAlternativeIdentityCodes.find(
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
                      form.setFieldsValue({
                        persian_title: "",
                        alternative_store_code: undefined,
                      });
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
            <Col span={8}>
              <Form.Item
                label="کد انبار کامل هویت جایگزین"
                name="alternative_store_code"
              >
                <Input />
              </Form.Item>
            </Col>
          </>

          <Divider orientation="start">
            <h1 className="font-bold">ماده اولیه</h1>
          </Divider>
          <>
            {/* ماده اولیه */}
            <Col span={8}>
              <Form.Item label="ماده اولیه" name="genus_id">
                <TS
                  labelInValue
                  data={genusData}
                  placeholder="ماده اولیه"
                  onSearchChange={(value) =>
                    setQuickSearch((previous) => ({
                      ...previous,
                      genus_id: value,
                    }))
                  }
                  dropdownRender={(menu) =>
                    quickCreateDropdown(menu, {
                      type: "genus",
                      targetField: "genus_id",
                      title: "ماده اولیه",
                    })
                  }
                  // onChange={(value) => {
                  //   const selectedGenus = genusData.find(
                  //     (item) => item.id === value.value,
                  //   );
                  //   const warehouseCodes =
                  //     selectedGenus?.genus_codes?.map((item) => ({
                  //       value: item.id,
                  //       label: item.name,
                  //       description: item.description,
                  //       full_ware_house_code: item.full_ware_house_code,
                  //       warehouse_code: item.warehouse_code,
                  //     })) || [];
                  //   setGenusStandardOptions(warehouseCodes);
                  //   form.setFieldsValue({
                  //     genus_standard_code_id: undefined,
                  //   });
                  // }}
                  onChange={(value) => {
                    if (!value) {
                      setGenusStandardOptions([]);
                      form.setFieldsValue({
                        genus_standard_code_id: undefined,
                        genus_warehouse_code: undefined,
                      });
                      return;
                    }

                    const findNodeRecursive = (nodes, id) => {
                      for (const node of nodes) {
                        if (node.id === id) return node;
                        if (node.children && node.children.length > 0) {
                          const found = findNodeRecursive(node.children, id);
                          if (found) return found;
                        }
                      }
                      return null;
                    };

                    const selectedGenus = findNodeRecursive(
                      genusData || [],
                      value.value,
                    );

                    const warehouseCodes =
                      selectedGenus?.genus_codes?.map((item) => ({
                        value: item.id,
                        label: item.name,
                        description: item.description,
                        full_ware_house_code: item.full_ware_house_code,
                        warehouse_code: item.warehouse_code,
                      })) || [];
                    setGenusStandardOptions(warehouseCodes);
                    form.setFieldsValue({
                      genus_standard_code_id: undefined,
                      genus_warehouse_code: undefined,
                    });
                  }}
                />
              </Form.Item>
            </Col>

            {/* کد استاندارد ماده اولیه */}
            <Col span={8}>
              <Form.Item
                label="کد استاندارد ماده اولیه"
                name="genus_standard_code_id"
              >
                <Select
                  allowClear
                  labelInValue
                  placeholder="کد استاندارد ماده اولیه"
                  showSearch
                  options={genusStandardOptions}
                  disabled={!selectedGenusValue?.value}
                  onSearch={(value) =>
                    setQuickSearch((previous) => ({
                      ...previous,
                      genus_standard_code_id: value,
                    }))
                  }
                  dropdownRender={(menu) =>
                    quickCreateDropdown(menu, {
                      type: "standard",
                      targetField: "genus_standard_code_id",
                      warehouseField: "genus_warehouse_code",
                      title: "کد استاندارد ماده اولیه",
                      parentId: selectedGenusValue?.value,
                      parentKey: "genus",
                      parentLabel: "ماده اولیه",
                      disabled: !selectedGenusValue?.value,
                      refetch: refetchGenus,
                    })
                  }
                  // onChange={(value) => {
                  //   if (!value) {
                  //     form.setFieldsValue({ genus_warehouse_code: undefined });
                  //     return;
                  //   }
                  //   const selectedOption = genusStandardOptions.find(
                  //     (item) => item.value === value.value,
                  //   );
                  //   form.setFieldsValue({
                  //     genus_warehouse_code: selectedOption?.warehouse_code,
                  //   });
                  // }}
                  onChange={(value) => {
                    if (!value) {
                      form.setFieldsValue({ genus_warehouse_code: undefined });
                      return;
                    }
                    const selectedOption = genusStandardOptions.find(
                      (item) => item.value === value.value,
                    );
                    form.setFieldsValue({
                      genus_warehouse_code:
                        selectedOption?.full_ware_house_code,
                    });
                  }}
                />
              </Form.Item>
            </Col>

            {/* کد انبار ماده اولیه  */}
            <Col span={8}>
              <Form.Item
                label="کد انبار کامل ماده اولیه"
                name="genus_warehouse_code"
              >
                <Input placeholder="کد انبار کامل ماده اولیه" />
              </Form.Item>
            </Col>
          </>

          <Divider orientation="start">
            <h1 className="font-bold">ماده اولیه جایگزین</h1>
          </Divider>
          <>
            {/* ماده اولیه جایگزین */}
            <Col span={8}>
              <Form.Item label="ماده اولیه جایگزین" name="alternative_genus_id">
                <TS
                  labelInValue
                  data={genusData}
                  placeholder="ماده اولیه"
                  onSearchChange={(value) =>
                    setQuickSearch((previous) => ({
                      ...previous,
                      alternative_genus_id: value,
                    }))
                  }
                  dropdownRender={(menu) =>
                    quickCreateDropdown(menu, {
                      type: "genus",
                      targetField: "alternative_genus_id",
                      title: "ماده اولیه جایگزین",
                    })
                  }
                  // onChange={(value) => {
                  //   const selectedGenus = genusData.find(
                  //     (item) => item.id === value.value,
                  //   );
                  //   const warehouseCodes =
                  //     selectedGenus?.genus_codes?.map((item) => ({
                  //       value: item.id,
                  //       label: item.name,
                  //       description: item.description,
                  //       full_ware_house_code: item.full_ware_house_code,
                  //       warehouse_code: item.warehouse_code,
                  //     })) || [];
                  //   setAlterNativeGenusStandardOptions(warehouseCodes);
                  //   form.setFieldsValue({
                  //     alternative_genus_standard_code_id: undefined,
                  //   });
                  // }}
                  onChange={(value) => {
                    if (!value) {
                      setAlterNativeGenusStandardOptions([]);
                      form.setFieldsValue({
                        alternative_genus_standard_code_id: undefined,
                        alternative_genus_warehouse_code: undefined,
                      });
                      return;
                    }

                    const findNodeRecursive = (nodes, id) => {
                      for (const node of nodes) {
                        if (node.id === id) return node;
                        if (node.children && node.children.length > 0) {
                          const found = findNodeRecursive(node.children, id);
                          if (found) return found;
                        }
                      }
                      return null;
                    };

                    const selectedGenus = findNodeRecursive(
                      genusData || [],
                      value.value,
                    );

                    const warehouseCodes =
                      selectedGenus?.genus_codes?.map((item) => ({
                        value: item.id,
                        label: item.name,
                        description: item.description,
                        full_ware_house_code: item.full_ware_house_code,
                        warehouse_code: item.warehouse_code,
                      })) || [];
                    setAlterNativeGenusStandardOptions(warehouseCodes);
                    form.setFieldsValue({
                      alternative_genus_standard_code_id: undefined,
                      alternative_genus_warehouse_code: undefined,
                    });
                  }}
                />
              </Form.Item>
            </Col>

            {/* کد استاندارد ماده اولیه جایگزین  */}
            <Col span={8}>
              <Form.Item
                label="کد استاندارد ماده اولیه جایگزین  "
                name="alternative_genus_standard_code_id"
              >
                <Select
                  allowClear
                  labelInValue
                  placeholder="کد استاندارد ماده اولیه"
                  showSearch
                  style={{ width: "100%" }}
                  options={alterNativeGenusStandardOptions}
                  disabled={!selectedAlternativeGenusValue?.value}
                  onSearch={(value) =>
                    setQuickSearch((previous) => ({
                      ...previous,
                      alternative_genus_standard_code_id: value,
                    }))
                  }
                  dropdownRender={(menu) =>
                    quickCreateDropdown(menu, {
                      type: "standard",
                      targetField: "alternative_genus_standard_code_id",
                      warehouseField: "alternative_genus_warehouse_code",
                      title: "کد استاندارد ماده اولیه جایگزین",
                      parentId: selectedAlternativeGenusValue?.value,
                      parentKey: "genus",
                      parentLabel: "ماده اولیه جایگزین",
                      disabled: !selectedAlternativeGenusValue?.value,
                      refetch: refetchGenus,
                    })
                  }
                  onChange={(value) => {
                    if (!value) {
                      form.setFieldsValue({ alternative_genus_warehouse_code: undefined });
                      return;
                    }
                    const selectedOption = alterNativeGenusStandardOptions.find(
                      (item) => item.value === value.value,
                    );
                    form.setFieldsValue({
                      alternative_genus_warehouse_code:
                        selectedOption?.full_ware_house_code,
                    });
                  }}
                />
              </Form.Item>
            </Col>

            {/* کد انبار ماده اولیه جایگزین  */}
            <Col span={8}>
              <Form.Item
                label="کد انبار کامل ماده اولیه جایگزین"
                name="alternative_genus_warehouse_code"
              >
                <Input placeholder="کد انبار کامل ماده اولیه جایگزین" />
              </Form.Item>
            </Col>
          </>

          <Divider orientation="start">
            <h1 className="font-bold">اطلاعات فنی محصول</h1>
          </Divider>
          <>
            {/* پوشش */}
            <Col span={8}>
              <Form.Item label="پوشش" name="casing_id">
                <TS
                  labelInValue
                  data={casingData}
                  placeholder="پوشش"
                  onSearchChange={(value) =>
                    setQuickSearch((previous) => ({
                      ...previous,
                      casing_id: value,
                    }))
                  }
                  dropdownRender={(menu) =>
                    quickCreateDropdown(menu, {
                      type: "casing",
                      targetField: "casing_id",
                      title: "پوشش",
                    })
                  }
                />
              </Form.Item>
            </Col>

            {/* قیمت */}
            <Col span={8}>
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

            {/* تعداد انبار */}
            <Col span={8}>
              <Form.Item label="تعداد انبار" name="warehouse_quantity">
                <Input />
              </Form.Item>
            </Col>

            {/* طول */}
            <Col span={4}>
              <Form.Item label="طول" name="length">
                <InputNumber style={{ width: "100%" }} stringMode />
              </Form.Item>
            </Col>

            {/* عرض */}
            <Col span={4}>
              <Form.Item label="عرض" name="width">
                <InputNumber style={{ width: "100%" }} stringMode />
              </Form.Item>
            </Col>

            {/* ارتفاع */}
            <Col span={4}>
              <Form.Item label="ارتفاع" name="height">
                <InputNumber style={{ width: "100%" }} stringMode />
              </Form.Item>
            </Col>

            {/* قطر داخل */}
            <Col span={4}>
              <Form.Item label="قطر داخل" name="internal_diagonal">
                <InputNumber style={{ width: "100%" }} stringMode />
              </Form.Item>
            </Col>

            {/* قطر خارجی */}
            <Col span={4}>
              <Form.Item label="قطر خارجی" name="external_diagonal">
                <InputNumber style={{ width: "100%" }} stringMode />
              </Form.Item>
            </Col>

            {/* وزن */}
            <Col span={4}>
              <Form.Item label="وزن" name="weight">
                <InputNumber style={{ width: "100%" }} stringMode />
              </Form.Item>
            </Col>

            {/* توضیحات */}
            <Col span={24}>
              <Form.Item label="توضیحات" name="description">
                <Input.TextArea rows={1} placeholder="توضیحات محصول" />
              </Form.Item>
            </Col>
          </>
        </Row>
      </Form>

      <AntModal
        open={Boolean(quickCreate)}
        title={`افزودن سریع ${quickCreate?.title || "مورد جدید"}`}
        okText="افزودن و انتخاب"
        cancelText="انصراف"
        onCancel={() => {
          if (!quickCreating) closeQuickCreate();
        }}
        onOk={() => quickForm.submit()}
        confirmLoading={quickCreating}
        okButtonProps={{
          disabled:
            hasWarehouseSuggestion &&
            warehouseProposal?.status === "loading",
        }}
        cancelButtonProps={{ disabled: quickCreating }}
        maskClosable={!quickCreating}
        keyboard={!quickCreating}
        destroyOnClose
        centered
        zIndex={1100}
      >
        <Form
          form={quickForm}
          layout="vertical"
          onFinish={submitQuickCreate}
          className="pt-3"
        >
          <Form.Item
            name="name"
            label={
              quickCreate?.type === "standard"
                ? "کد استاندارد"
                : `نام ${quickCreate?.title || "مورد"}`
            }
            rules={[{ required: true, message: "نام را وارد کنید" }]}
          >
            <Input
              autoFocus
              placeholder={
                quickCreate?.type === "standard"
                  ? "کد استاندارد جدید"
                  : "نام مورد جدید"
              }
              onPressEnter={() => quickForm.submit()}
            />
          </Form.Item>

          {quickCreate?.type === "personality" ? (
            <>
              <Form.Item
                name="warehouse_code"
                label="کد طبقه‌بندی هویت"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: "کد طبقه‌بندی هویت را وارد کنید",
                  },
                ]}
                extra={
                  warehouseProposal?.status === "loading"
                    ? "در حال دریافت آخرین کد طبقه‌بندی هویت‌ها…"
                    : warehouseProposal?.status === "ready" &&
                        warehouseProposal.nonNumericCount === 0
                      ? warehouseProposal.lastCode === null
                        ? "هنوز کد طبقه‌بندی ثبت نشده است؛ پیشنهاد: 1"
                        : `آخرین کد طبقه‌بندی هویت‌ها: ${warehouseProposal.lastCode} — کد بعدی: ${warehouseProposal.nextCode}`
                      : undefined
                }
              >
                <Input
                  dir="ltr"
                  placeholder="کد طبقه‌بندی هویت"
                  disabled={
                    warehouseProposal?.status === "loading" || quickCreating
                  }
                />
              </Form.Item>
              {warehouseProposal?.status === "error" ? (
                <Alert
                  type="warning"
                  showIcon
                  className="mb-4"
                  message={warehouseProposal.message}
                  action={
                    <Button
                      size="small"
                      disabled={quickCreating}
                      onClick={() =>
                        suggestWarehouseCode(warehouseRequestId.current, quickCreate)
                      }
                    >
                      تلاش دوباره
                    </Button>
                  }
                />
              ) : warehouseProposal?.nonNumericCount > 0 ? (
                <Alert
                  type="info"
                  showIcon
                  className="mb-4"
                  message="بعضی هویت‌ها کد غیرعددی دارند؛ کد طبقه‌بندی را دستی وارد کنید."
                />
              ) : null}
              <Form.Item name="parent_id" label="هویت والد">
                <TS data={personalityData} placeholder="هویت والد (اختیاری)" />
              </Form.Item>
            </>
          ) : null}

          {quickCreate?.type === "genus" ? (
            <>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="order"
                    label="اولویت نمایش"
                    rules={[{ required: true, message: "اولویت را وارد کنید" }]}
                  >
                    <InputNumber className="w-full" min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="internal_code" label="کد طبقه بندی">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="parent_id" label="ماده اولیه والد">
                <TS data={genusData} placeholder="ماده اولیه والد (اختیاری)" />
              </Form.Item>
              <Form.Item name="material" label="متریال">
                <Input placeholder="متریال (اختیاری)" />
              </Form.Item>
            </>
          ) : null}

          {quickCreate?.type === "casing" ? (
            <Form.Item
              name="order"
              label="اولویت نمایش"
              rules={[{ required: true, message: "اولویت را وارد کنید" }]}
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          ) : null}

          {quickCreate?.type === "standard" ? (
            <>
              <Form.Item name="description" label="نام/توضیح">
                <Input placeholder="نام یا توضیح کد استاندارد" />
              </Form.Item>
              <Row gutter={24}>
                <Col span={genusStandardQuickCreate ? 12 : 24}>
                  <Form.Item
                    name="warehouse_code"
                    label="کد انبار استاندارد"
                    rules={scopedStandardQuickCreate ? [
                      { required: true, whitespace: true, message: "کد انبار استاندارد را وارد کنید" },
                    ] : []}
                    extra={
                      scopedStandardQuickCreate && warehouseProposal?.status === "loading"
                        ? `در حال دریافت استانداردهای همین ${standardScopeLabel}…`
                        : scopedStandardQuickCreate && warehouseProposal?.status === "ready" &&
                            warehouseProposal.nonNumericCount === 0
                          ? warehouseProposal.lastCode === null
                            ? `این ${standardScopeLabel} هنوز کد استاندارد ندارد؛ پیشنهاد کد انبار: 1`
                            : `آخرین کد انبار این ${standardScopeLabel}: ${warehouseProposal.lastCode} — کد بعدی: ${warehouseProposal.nextCode}`
                          : undefined
                    }
                  >
                    <Input
                      dir="ltr"
                      placeholder="کد انبار استاندارد"
                      disabled={quickCreating || (scopedStandardQuickCreate &&
                        warehouseProposal?.status === "loading")}
                    />
                  </Form.Item>
                </Col>
                {/* {genusStandardQuickCreate && (
                  <Col span={12}>
                    <Form.Item
                      label="کد انبار کامل (پاسخ سرور)"
                      extra="برای کد جدید، مقدار برگشتی سرور پس از ثبت در مودال محصول نمایش داده می‌شود."
                    >
                      <Input
                        dir="ltr"
                        readOnly
                        value={quickFullWarehouseCode ?? ""}
                        placeholder="پس از ثبت از سرور دریافت می‌شود"
                      />
                    </Form.Item>
                  </Col>
                )} */}
              </Row>
              {scopedStandardQuickCreate && warehouseProposal?.status === "ready" && (
                <div className="mb-3 text-xs text-slate-500">
                  {identityStandardQuickCreate && (<>
                    کد طبقه‌بندی هویت:{" "}
                    <span dir="ltr">{warehouseProposal.parent?.warehouse_code ?? "—"}</span>
                  </>)}
                  {warehouseProposal.lastFullCode !== null && (
                    <div>
                      کد انبار کامل آخرین استاندارد (سرور):{" "}
                      <span dir="ltr">{warehouseProposal.lastFullCode}</span>
                    </div>
                  )}
                </div>
              )}
              {scopedStandardQuickCreate && warehouseProposal?.status === "error" ? (
                <Alert
                  type="warning"
                  showIcon
                  className="mb-3"
                  message={warehouseProposal.message}
                  action={<Button size="small" disabled={quickCreating} onClick={() =>
                    suggestWarehouseCode(warehouseRequestId.current, quickCreate)
                  }>تلاش دوباره</Button>}
                />
              ) : scopedStandardQuickCreate && warehouseProposal?.nonNumericCount > 0 ? (
                <Alert
                  type="info"
                  showIcon
                  className="mb-3"
                  message={`کدهای استاندارد این ${standardScopeLabel} قالب غیرعددی دارند؛ کد انبار را دستی وارد کنید.`}
                />
              ) : null}
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                این کد برای «{quickCreate.parentLabel}» انتخاب‌شده ساخته می‌شود.
              </div>
            </>
          ) : null}
        </Form>
      </AntModal>
    </Modal>
  );
};

export default ProductModal;
