import { useEffect, useMemo, useState } from "react";
import { useFormDefinition } from "../../../QueryServises/formsQuery";
import FormCategoryModal from "../FormCategory/FormCategoryModal";
import useModal from "../../../hooks/useModal";
import StudioHeader from "../StudioOverview/StudioHeader";
import StudioSidebar from "../StudioOverview/StudioSidebar";
import StudioFormList from "../StudioOverview/StudioFormList";
import StudioPreview from "../StudioOverview/StudioPreview";

export default function FormStudioDashboard({
  refetch,
  categories,
  definitions,
  loading,
  onEdit,
  onDelete,
}) {
  const { setModal, modalData, modalMode, modalType, isOpen, closeModal } =
    useModal();

  const [categoryId, setCategoryId] = useState("all");
  const [selectedId, setSelectedId] = useState();

  const visible = useMemo(
    () =>
      categoryId === "all"
        ? definitions
        : definitions.filter(
            (form) =>
              String(form.category?.id || form.category_id) ===
              String(categoryId),
          ),
    [categoryId, definitions],
  );

  const selected = visible.find((form) => form.id === selectedId) || visible[0];
  const { data: previewData, isLoading: previewLoading } = useFormDefinition(
    selected?.id,
  );
  const preview = Array.isArray(previewData) ? previewData[0] : previewData;

  useEffect(() => {
    if (selected?.id) setSelectedId(selected.id);
  }, [selected?.id]);

  return (
    <div className="form-studio-dashboard" dir="rtl">
      <StudioHeader
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={categories}
        definitionsCount={definitions.length}
        onOpenCreate={() =>
          setModal({ data: null, type: "createCategory", mode: "add" })
        }
      />

      <div className="studio-dashboard-body">
        <StudioSidebar
          refetch={refetch}
          categories={categories}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          definitions={definitions}
        />

        <StudioFormList
          loading={loading}
          visible={visible}
          selectedId={selected?.id}
          setSelectedId={setSelectedId}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <StudioPreview
          selected={selected}
          preview={preview}
          previewLoading={previewLoading}
          onEdit={onEdit}
        />
      </div>

      <FormCategoryModal
        isOpen={modalType === "createCategory" && isOpen}
        modalData={modalData}
        modalMode={modalMode}
        closeModal={closeModal}
      />
    </div>
  );
}
