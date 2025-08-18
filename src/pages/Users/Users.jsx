import { Button, Card, message, Table } from "antd";
import { columns } from "./_components/usersColumn.jsx";
import { useUserList } from "../../QueryServises/userQuery/index.js";
import UserModal from "./_components/UserModal.jsx";
import { useDeleteUser } from "../../QueryServises/userQuery/index.js";
import useModal from "../../hooks/useModal.js";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const navigate = useNavigate()
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
  const { isFetching, data, refetch } = useUserList();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const handleDeleteUser = (record) => {
    deleteUser(record.id)
      .then(() => {
        message.success("کاربر با موفقیت حذف شد");
        refetch();
      })
      .catch((error) => {
        message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
        console.error(error);
      });
  };

  const handleEditUser = (record) => {
    setModal({ mode: "edit", data: record });
  };

  return (
    <div className="min-h-screen bg-Main p-2">
      <div className="my-1 p-2 bg-white shadow-md rounded-lg">
        <Button
          type="primary"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => navigate("/panel/system-management/")}
        >
          بازگشت به صفحه اصلی
        </Button>
      </div>

      <Card title="مدیریت کاربران"
        extra={

          <UserModal
            isOpen={isOpen}
            modalMode={modalMode}
            modalData={modalData}
            closeModal={closeModal}
            setModal={setModal}
            refetch={refetch}
          />
        }
      >

        <Table
          columns={columns(handleEditUser, handleDeleteUser)}
          dataSource={isFetching ? [] : data}
          loading={isFetching}
          rowKey="id"
          size="small"
          scroll={{ x: true }}
          responsive={{
            small: { columnWidth: 100 },
            middle: { columnWidth: 150 },
            large: { columnWidth: 200 },
          }}
        />
      </Card>
    </div>

  );
};

export default Users;