import { Button, Card, Spin, Table } from "antd";
import ReasonsEditingModal from "./components/ReasonsEditingModal";
import {
  useDeleteReasonsEditing,
  useReasonsEditingList,
} from "../../../../QueryServises/ReasonsEditingQuery";
import { ReasonsEditingCols } from "./components/ReasonsEditingCols";
import { PlusOutlined } from "@ant-design/icons";
import useModal from "../../../../hooks/useModal";

const ReasonsEditing = () => {
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
  const { data, isFetching, refetch } = useReasonsEditingList();

  const { isPending: isDeleting } = useDeleteReasonsEditing();

  const handleDelete = (id) => {
    Modal.confirm({
      title: "حذف دلیل ویرایش نسخه",
      content: "آیا از حذف مطمئن هستید؟",
      okText: "بله",
      cancelText: "خیر",
      okType: "danger",
      onOk() {
        return new Promise((resolve, reject) => {
          deleteContractor(id, {
            onSuccess: () => {
              message.success("با موفقیت حذف شد");
              refetch();
              resolve();
            },
            onError: () => {
              message.error("حذف  با خطا مواجه شد");
              reject();
            },
          });
        });
      },
    });
  };

  const handleEdit = (record) => {
    setModal({ mode: "edit", data: record });
  };

  return (
    <Spin spinning={isFetching && !data} tip="در حال دریافت اطلاعات...">
      <Card
        title="مدیریت دلایل ویرایش نسخه"
        extra={
          <Button
            className="modal-button"
            icon={<PlusOutlined className="text-center" />}
            onClick={() => setModal({ mode: "add", data: null })}
          >
            <span className="xs:hidden sm:hidden md:inline">
              افزودن دلیل نسخه
            </span>
          </Button>
        }
        loading={isDeleting}
      >
        <Table
          columns={ReasonsEditingCols({ handleDelete, handleEdit })}
          dataSource={data}
        />
      </Card>

      <ReasonsEditingModal
        isOpen={isOpen}
        modalMode={modalMode}
        modalData={modalData}
        closeModal={closeModal}
        setModal={setModal}
        refetch={refetch}
      />
    </Spin>
  );
};

export default ReasonsEditing;
