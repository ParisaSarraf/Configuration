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
  useFormDefinitions,
} from "../../../../QueryServises/formsQuery";
import { TableAntd } from "../../../../components/TableAntd/TableAntd";
import { openFormStudio } from "../../FormBuilderStudio/formStudioNavigation";
import FormCategoryModal from "../FormCategoryModal";
import FormDefinitionCategoryDetail from "../../FormDefinition/Components/FormDefinitionCategoryDetail";
import FormDefinitionModal from "../../FormDefinition/Components/FormDefinitionModal";
import CategoryRightSidebar from "./Components/CategoryRightSidebar";
import FormDefinitionCols from "./Components/FormDefinitionCols";
import { StoredIcon } from "../../../../components/IconPicker/Index";

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
  const showAllForms =
    categoryId === "all" ||
    categoryId === null ||
    categoryId === undefined ||
    categoryId === "";
  // «همه» شناسه‌ی دسته‌بندی نیست؛ فهرست عمومی فرم‌ها مسیر جداگانه دارد.
  const allFormsQuery = useFormDefinitions({ enabled: showAllForms });
  const categoryFormsQuery = useFormCategoryById(
    showAllForms ? null : categoryId,
    { enabled: !showAllForms },
  );
  const activeFormsQuery = showAllForms ? allFormsQuery : categoryFormsQuery;
  const {
    isLoading,
    isFetching,
    refetch: refetchCategoryForms,
  } = activeFormsQuery;
  const forms = useMemo(() => {
    const data = activeFormsQuery.data;
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : [];
    if (showAllForms) return items;
    if (Array.isArray(data?.forms)) return data.forms;
    return items.flatMap((item) => (Array.isArray(item?.forms) ? item.forms : []));
  }, [activeFormsQuery.data, showAllForms]);
  const activeCategory = categories.find(
    (item) => String(item.id) === String(categoryId),
  );
  const activeCategoryName = activeCategory?.name || "همه فرم‌ها";

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "همه فرم‌ها", searchLabel: "همه فرم‌ها" },
      ...categories.map((item) => ({
        value: item.id,
        searchLabel: item.name,
        label: (
          <span className="flex items-center gap-2">
            <StoredIcon
              value={item.icon}
              fallback={<FolderAddOutlined />}
              className="shrink-0"
            />
            <span>
              {item.name} ({Number(item.number_of_forms) || 0})
            </span>
          </span>
        ),
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
      <main className="rounded-2xl border theme-border theme-surface p-4 shadow-sm sm:p-5 dark:theme-border dark:theme-panel">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="m-0 text-base font-bold theme-text dark:theme-muted">
              فهرست فرم‌ها
            </h2>
            <span className="text-xs theme-muted dark:theme-muted">
              {filteredForms.length.toLocaleString("fa-IR")} مورد
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              allowClear
              prefix={<SearchOutlined className="theme-muted" />}
              placeholder="جستجوی نام یا توضیحات فرم"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full sm:!w-[260px]"
            />
            <Select
              allowClear
              showSearch
              placeholder="همه فرم‌ها"
              optionFilterProp="searchLabel"
              value={showAllForms ? "all" : categoryId}
              options={categoryOptions}
              onChange={(value) => {
                setCategoryId(value ?? "all");
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

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border theme-accent-border bg-gradient-to-l theme-gradient-soft theme-gradient-soft p-4 dark:theme-accent-border-60 dark:theme-gradient dark:theme-gradient">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl theme-accent-soft text-lg theme-accent dark:theme-accent-soft-60 dark:theme-accent">
              <StoredIcon
                value={activeCategory?.icon}
                fallback={<FolderAddOutlined />}
              />
            </span>
            <div>
              <div className="font-bold theme-text dark:theme-muted">
                {activeCategoryName}
              </div>
              <p className="mt-1 mb-0 text-xs leading-6 theme-muted dark:theme-muted">
                بدون انتخاب دسته‌بندی، همه فرم‌ها نمایش داده می‌شوند. برای
                نمایش فرم‌های یک دسته‌بندی، آن را انتخاب کنید.
              </p>
            </div>
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
                    : showAllForms
                      ? "هنوز فرمی ساخته نشده است."
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
