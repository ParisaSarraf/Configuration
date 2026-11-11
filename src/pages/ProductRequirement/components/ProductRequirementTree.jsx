import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  message,
  Modal,
  Spin,
  Tag,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import useModal from "../../../hooks/useModal";
import DescribeTheRequirementModal from "./DescribeTheRequirementModal";
import AcknowledgmentOfRequirement from "./AcknowledgmentOfRequirement";
import RequirementTreeView from "./RequirementTreeView";
import RequirementWorkflowModal from "./RequirementWorkflowModal";
import ImportedRequirementWorkflowModal from "./ImportedRequirementWorkflowModal";
import ExportedAttachmentModal from "./ExportedAttachmentModal";
import { findEditionInTree } from "../utils/requirementWorkflow";
import { RequirementWorkflowHistory, useRequirementWorkflowHistory } from "./RequirementWorkflowHistory";
import { IMPORTED_WORKFLOW_STEPS } from "../utils/importedRequirementWorkflow";
import { canDeleteRequirement, canAddRequirementEdition, canExportRequirementEdition, getRequirementState, getAssignmentState } from "../utils/requirementTree";
import { BASEURL } from "../../../Services/axiosInstance";
import {
  useDeleteProductRequirement,
  useProductRequirementList,
} from "../../../QueryServises/productRequirementQuery";
import CreateProductRequirementModal from "./CreateProductRequirementModal";

const showValue = (value) =>
  value == null || value === "" ? "—" : String(value);

// API files may be absolute URLs or paths relative to the API server.
const getAttachmentUrl = (file) => {
  if (typeof file !== "string" || !file.trim()) return null;
  try {
    const apiOrigin = new URL(BASEURL || "/", window.location.origin).origin;
    const url = new URL(file.trim(), `${apiOrigin}/`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

function ExportedWorkflowHistoryModal({ assignment, onClose }) {
  const history = useRequirementWorkflowHistory(assignment.id, "product_requirement_edition_exported", IMPORTED_WORKFLOW_STEPS);
  return <Modal open title="روال الزام صادرشده" footer={null} width={880} onCancel={onClose} destroyOnClose>
    <div dir="rtl">
      <p>تخصیص {assignment.id} — محصول مقصد {showValue(assignment.to_product_id)}</p>
      <RequirementWorkflowHistory history={history} steps={IMPORTED_WORKFLOW_STEPS} currentState={assignment.state} />
    </div>
  </Modal>;
}

export default function ProductRequirementTree({
  currentProduct,
  setSelectedEdition,
  focusEditionId,
}) {
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } =
    useModal();
  const { data, isFetching, isError, refetch } = useProductRequirementList(
    currentProduct?.id,
  );
  const { mutateAsync: deleteRequirement } = useDeleteProductRequirement();
  const [detail, setDetail] = useState(null);
  const [historyAssignment, setHistoryAssignment] = useState(null);
  const [fileAssignment, setFileAssignment] = useState(null);
  const addRequirement = (category = null) =>
    setModal({
      mode: "add",
      data: category,
      type: "CreateProductRequirementModal",
    });

  const handleDelete = (requirement) => {
    if (!canDeleteRequirement(requirement)) return;
    Modal.confirm({
      title: "حذف الزام محصول",
      content: `الزام «${requirement.title || requirement.id}» حذف شود؟`,
      okText: "حذف الزام",
      cancelText: "انصراف",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await deleteRequirement(requirement.id);
          setSelectedEdition(null);
          message.success("الزام محصول حذف شد");
          await refetch();
        } catch (error) {
          message.error(
            error?.response?.data?.detail ||
              error?.message ||
              "حذف الزام ناموفق بود",
          );
          throw error;
        }
      },
    });
  };
  const edition = detail?.edition;
  const state = getRequirementState(edition?.state);
  const assignments = Array.isArray(edition?.assigned_to) ? edition.assigned_to : [];

  return (
    <Card
      title="پنجره الزامات"
      extra={
        <Button
          icon={<PlusOutlined />}
          aria-label="افزودن الزام"
          disabled={!currentProduct?.id}
          onClick={() => addRequirement()}
          className="modal-button"
        />
      }
    >
      {currentProduct?.id && isFetching && data != null && (
        <div role="status" className="mb-2">
          <Spin size="small" /> در حال به‌روزرسانی...
        </div>
      )}
      {currentProduct?.id && isError && data != null && (
        <Alert
          type="error"
          showIcon
          message="به‌روزرسانی الزامات ناموفق بود؛ داده‌های قبلی نمایش داده می‌شوند"
          action={<Button onClick={() => refetch()}>تلاش دوباره</Button>}
        />
      )}
      {!currentProduct?.id ? (
        <Empty description="ابتدا یک محصول انتخاب کنید" />
      ) : (
        <RequirementTreeView
          data={data}
          productId={currentProduct.id}
          focusEditionId={focusEditionId}
          isLoading={isFetching && data == null}
          isError={isError && data == null}
          onRetry={refetch}
          onDelete={handleDelete}
          onSelectEdition={setSelectedEdition}
          onShowEdition={setDetail}
          onWorkflow={(node) => setModal({ mode: "edit", data: node, type: "RequirementWorkflowModal" })}
          onAcknowledge={(node) => {
            if (!canExportRequirementEdition(node?.requirement, node?.edition)) return;
            setModal({
              mode: "add",
              data: { product_requirements: node.requirement, edition: node.edition },
              type: "AcknowledgmentOfRequirement",
            });
          }}
          onEdition={(requirement) => {
            if (!canAddRequirementEdition(requirement)) return;
            setModal({
              mode: "add",
              data: { product_requirements: requirement },
              type: "DescribeTheRequirementModal",
            });
          }}
        />
      )}
      {isOpen && modalType === "CreateProductRequirementModal" && (
        <CreateProductRequirementModal
          isOpen
          modalMode={modalMode}
          modalData={modalData}
          currentProduct={currentProduct}
          closeModal={closeModal}
          refetch={refetch}
        />
      )}
      {isOpen && modalType === "DescribeTheRequirementModal" && (
        <DescribeTheRequirementModal
          isOpen
          modalMode={modalMode}
          modalData={modalData}
          currentProduct={currentProduct}
          closeModal={closeModal}
          refetch={refetch}
        />
      )}
      {isOpen && modalType === "RequirementWorkflowModal" && (
        modalData?.requirement?.imported === true
          ? <ImportedRequirementWorkflowModal isOpen node={modalData} closeModal={closeModal} refetch={refetch} />
          : <RequirementWorkflowModal isOpen node={modalData} closeModal={closeModal} refetch={refetch} />
      )}
      {isOpen && modalType === "AcknowledgmentOfRequirement" && (
        <AcknowledgmentOfRequirement
          isOpen
          modalMode={modalMode}
          modalData={modalData}
          currentProduct={currentProduct}
          closeModal={closeModal}
          refetch={refetch}
        />
      )}
      <Modal
        open={!!detail}
        title="جزئیات نسخه الزام"
        footer={null}
        onCancel={() => setDetail(null)}
        width={720}
      >
        <Descriptions
          style={{ overflowWrap: "anywhere" }}
          bordered
          column={1}
          size="small"
        >
          <Descriptions.Item label="عنوان الزام">
            {detail?.requirement?.title}
          </Descriptions.Item>
          <Descriptions.Item label="کد کامل">
            <bdi dir="ltr">{showValue(edition?.full_code)}</bdi>
          </Descriptions.Item>
          <Descriptions.Item label="کد نسخه">
            <bdi dir="ltr">{showValue(edition?.code)}</bdi>
          </Descriptions.Item>
          <Descriptions.Item label="وضعیت">
            <Tag color={state.color}>{state.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="توضیحات">
            {showValue(edition?.description)}
          </Descriptions.Item>
          <Descriptions.Item label="توصیف / نظر پذیرش">
            {showValue(edition?.pass_comment)}
          </Descriptions.Item>
          <Descriptions.Item label="توضیح فایل">
            {showValue(edition?.file_description)}
          </Descriptions.Item>
          <Descriptions.Item label="فایل">
            {edition?.file ? "فایل پیوست دارد" : "بدون پیوست"}
          </Descriptions.Item>

        </Descriptions>
        <h3 className="mt-4 mb-3">جزئیات محصولات تخصیص‌یافته</h3>
        {assignments.length ? assignments.map((assignment, index) => {
          const assignmentState = getAssignmentState(assignment?.state);
          const attachmentUrl = getAttachmentUrl(assignment?.file_1);
          return (
            <Card key={`${assignment?.id ?? "assignment"}-${index}`} size="small"
              title={`تخصیص ${index + 1}`} className="mb-3"
              extra={assignment?.id != null && <div className="flex flex-wrap gap-2">
                <Button size="small" onClick={() => setFileAssignment(assignment)}>ویرایش فایل</Button>
                <Button size="small" onClick={() => setHistoryAssignment(assignment)}>روال تخصیص</Button>
              </div>}>
              <Descriptions bordered column={1} size="small" style={{ overflowWrap: "anywhere" }}>
                <Descriptions.Item label="شناسه تخصیص">{showValue(assignment?.id)}</Descriptions.Item>
                <Descriptions.Item label="شناسه محصول مقصد">{showValue(assignment?.to_product_id)}</Descriptions.Item>
                <Descriptions.Item label="محصول جاری">
                  {assignment?.is_current_product === true ? "بله" : assignment?.is_current_product === false ? "خیر" : "نامشخص"}
                </Descriptions.Item>
                <Descriptions.Item label="وضعیت">
                  <Tag color={assignmentState.color}>{assignmentState.label}</Tag>
                  {assignment?.state != null && ` (${assignment.state})`}
                </Descriptions.Item>
                <Descriptions.Item label="نظر / توضیحات">{showValue(assignment?.pass_comment)}</Descriptions.Item>
                <Descriptions.Item label="فایل ضمیمه">
                  {attachmentUrl ? <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">مشاهده فایل</a>
                    : assignment?.file_1 ? "فایل پیوست دارد (آدرس قابل نمایش نیست)" : "بدون پیوست"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          );
        }) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="هنوز تخصیص داده نشده است" />}
      </Modal>
      {fileAssignment && <ExportedAttachmentModal assignment={fileAssignment} editionId={edition?.id}
        refetch={refetch} onClose={() => setFileAssignment(null)} onSaved={(data) => {
          const fresh = findEditionInTree(data, detail?.requirement?.id, edition?.id);
          if (fresh) setDetail((previous) => previous && ({ ...previous, ...fresh }));
          else setDetail(null);
        }} />}
      {historyAssignment && <ExportedWorkflowHistoryModal assignment={historyAssignment} onClose={() => setHistoryAssignment(null)} />}
    </Card>
  );
}
