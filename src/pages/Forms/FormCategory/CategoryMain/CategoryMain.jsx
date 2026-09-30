import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Empty, Input, Modal, Select, Tooltip, message } from "antd";

import {
  useDeleteFormCategory,
  useFormCategoryById,
} from "../../../../QueryServises/formsQuery";
import { TableAntd } from "../../../../components/TableAntd/TableAntd";
import { openFormStudio } from "../../FormBuilderStudio/formStudioNavigation";
import FormCategoryModal from "../FormCategoryModal";
import FormDefinitionCategoryDetail from "../../FormDefinition/Components/FormDefinitionCategoryDetail";
import FormDefinitionModal from "../../FormDefinition/Components/FormDefinitionModal";
import CategoryRightSidebar from "./Components/CategoryRightSidebar";
import FormDefinitionCols from "./Components/FormDefinitionCols";

const normalize = (value) =>
  String(value ?? "")
    .replace(/[\u064A\u0649]/g, "\u06CC")
    .replace(/\u0643/g, "\u06A9")
    .replace(/\u200C/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const CategoryMain = ({
  category = [],
  refetch,
  setModal,
  modalMode,
  modalData,
  modalType,
  closeModal,
  isOpen,
}) => {
  const [categoryId, setCategoryId] = useState("all");
  const [previewFormId, setPreviewFormId] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync: deleteCategory, isPending: deletingCategory } =
    useDeleteFormCategory();

  const categories = category ?? [];
  const {
    data: categoryByIdData,
    isLoading,
    isFetching,
    refetch: refetchCategoryForms,
  } = useFormCategoryById(categoryId);
  const forms = categoryByIdData?.[0]?.forms || [];
  const activeCategory = categories.find(
    (item) => String(item.id) === String(categoryId),
  );
  const activeCategoryName = activeCategory?.name || "همه فرم‌ها";

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "همه فرم‌ها" },
      ...categories.map((item) => ({
        value: item.id,
        label: `${item.name} (${Number(item.number_of_forms) || 0})`,
      })),
    ],
    [categories],
  );

  const filteredForms = useMemo(() => {
    const term = normalize(search);
    if (!term) return forms;
    return forms.filter(
      (form) =>
        normalize(form?.name).includes(term) ||
        normalize(form?.description).includes(term) ||
        normalize(form?.slug).includes(term),
    );
  }, [forms, search]);

  const refreshAll = async () => {
    await Promise.all([refetch?.(), refetchCategoryForms?.()]);
  };

  const handleView = (record) => {
    setModal({
      mode: "view",
      data: record.id,
      type: "viewCategoryDefinitionDetail",
    });
  };

  const handleEditForm = (record) => {
    setModal({
      mode: "edit",
      data: record,
      type: "createFormDefinitionCategory",
    });
  };

  const handleCreateFormDefinitionField = (formDefinitionId) => {
    openFormStudio(navigate, formDefinitionId, location.pathname);
  };

  const handleCreateCategory = () => {
    setModal({ mode: "add", data: null, type: "createCategory" });
  };

  const handleEditCategory = () => {
    if (!activeCategory) return;
    setModal({ mode: "edit", data: activeCategory, type: "createCategory" });
  };

  const handleCreateForm = () => {
    if (!activeCategory) {
      message.info("ابتدا یک دسته‌بندی مشخص انتخاب کنید.");
      return;
    }
    setModal({
      mode: "add",
      data: activeCategory,
      type: "createFormDefinitionCategory",
    });
  };

  const handleDeleteCategory = () => {
    if (!activeCategory) return;
    Modal.confirm({
      title: "حذف دسته‌بندی",
      content: `آیا از حذف دسته‌بندی «${activeCategory.name}» مطمئن هستید؟`,
      okText: "حذف",
      cancelText: "انصراف",
      okType: "danger",
      centered: true,
      onOk: async () => {
        await deleteCategory(activeCategory.id);
        setCategoryId("all");
        await refetch?.();
        message.success("دسته‌بندی حذف شد.");
      },
    });
  };

  const columns = FormDefinitionCols({
    handleEdit: handleEditForm,
    handleView,
    refetch: refreshAll,
    handleCreateFormDefinitionField,
    handlePreview: (record) => setPreviewFormId(record.id),
  });

  return (
    <>
      <main className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="m-0 text-base font-bold text-slate-800 dark:text-slate-100">
              فهرست فرم‌ها
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {filteredForms.length.toLocaleString("fa-IR")} مورد
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="جستجوی نام یا توضیحات فرم"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full sm:!w-[260px]"
            />
            <Select
              showSearch
              optionFilterProp="label"
              value={categoryId}
              options={categoryOptions}
              onChange={(value) => {
                setCategoryId(value);
                setSearch("");
              }}
              className="w-full sm:!w-[220px]"
              aria-label="فیلتر دسته‌بندی فرم‌ها"
            />
            <Tooltip title="بارگذاری مجدد">
              <Button
                icon={<ReloadOutlined />}
                loading={isFetching}
                onClick={refreshAll}
              />
            </Tooltip>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50 to-slate-50 p-4 dark:border-blue-900/60 dark:from-blue-950/30 dark:to-slate-900">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-100">
              {activeCategoryName}
            </div>
            <p className="mt-1 mb-0 text-xs leading-6 text-slate-500 dark:text-slate-400">
              دسته‌بندی را انتخاب کنید و فرم‌های آن را از همین جدول مدیریت کنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button icon={<FolderAddOutlined />} onClick={handleCreateCategory}>
              دسته‌بندی جدید
            </Button>
            <Button
              icon={<EditOutlined />}
              disabled={!activeCategory}
              onClick={handleEditCategory}
            >
              ویرایش دسته‌بندی
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={!activeCategory}
              loading={deletingCategory}
              onClick={handleDeleteCategory}
            >
              حذف دسته‌بندی
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!activeCategory}
              onClick={handleCreateForm}
            >
              فرم جدید
            </Button>
          </div>
        </div>

        <TableAntd
          columns={columns}
          rowKey="id"
          loading={isLoading}
          dataSource={filteredForms}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <Empty
                className="py-10"
                description={
                  search
                    ? "فرمی مطابق جستجو پیدا نشد."
                    : "هنوز فرمی در این دسته‌بندی ساخته نشده است."
                }
              />
            ),
          }}
        />
      </main>

      <Modal
        open={Boolean(previewFormId)}
        title="پیش‌نمایش فرم"
        footer={null}
        width="min(1180px, 96vw)"
        destroyOnClose
        onCancel={() => setPreviewFormId(null)}
        styles={{ body: { height: "min(78vh, 860px)", overflow: "auto" } }}
      >
        <CategoryRightSidebar FormId={previewFormId} />
      </Modal>

      <FormCategoryModal
        refetch={refreshAll}
        isOpen={modalType === "createCategory" && isOpen}
        modalData={modalData}
        modalMode={modalMode}
        closeModal={closeModal}
      />
      <FormDefinitionModal
        refetch={refreshAll}
        isOpen={modalType === "createFormDefinitionCategory" && isOpen}
        modalData={modalData}
        modalMode={modalMode}
        closeModal={closeModal}
      />
      <FormDefinitionCategoryDetail
        modalData={modalData}
        closeModal={closeModal}
        modalMode={modalMode}
        modalType={modalType}
        isOpen={modalType === "viewCategoryDefinitionDetail"}
      />
    </>
  );
};

export default CategoryMain;
