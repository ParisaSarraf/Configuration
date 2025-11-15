import { message, Modal, Table } from "antd";
import { IndependentMinutesCols } from "./components/IndependentMinutesCols";

const IndependentMinutes = ({
  setModal,
  meetingData,
  deleteMeeting,
  refetch,
  loading,
}) => {
  const handleEdit = (record) => {
    setModal({ mode: "edit", data: record, type: "addOrEdirMeeting" });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "حذف صورتجلسه",
      content: "آیا از حذف این صورتجلسه مطمئن هستید؟",
      okText: "بله",
      cancelText: "خیر",
      okType: "danger",
      onOk() {
        return new Promise((resolve, reject) => {
          deleteMeeting(id, {
            onSuccess: () => {
              message.success("صورتجلسه با موفقیت حذف شد");
              refetch();
              resolve();
            },
            onError: () => {
              message.error("حذف صورتجلسه با خطا مواجه شد");
              reject();
            },
          });
        });
      },
    });
  };

  const handleShowDetail = (record) => {
    setModal({ mode: "detail", data: record, type: "meetingsIndependent" });
  };

  const handleAddActivities = (record) => {
    setModal({ mode: "add", data: record, type: "addActivitiesMeetings" });
  };

  return (
    <Table
      size="small"
      loading={loading}
      columns={IndependentMinutesCols({
        handleEdit,
        handleDelete,
        handleShowDetail,
        handleAddActivities,
      })}
      dataSource={meetingData}
      rowKey="id"
      pagination={{
        defaultPageSize: 5,
        pageSizeOptions: [10, 20, 45, 100],
        size: "small",
        showSizeChanger: true,
      }}
    />
  );
};

export default IndependentMinutes;
