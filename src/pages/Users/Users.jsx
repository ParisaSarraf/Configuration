import { Button, message, Table } from "antd";
import { columns } from "./_components/usersColumn.jsx";
import { useUserList } from "../../QueryServises/userQuery/index.js";
import UserModal from "./_components/UserModal.jsx";
import { useDeleteUser } from "../../QueryServises/userQuery/index.js";
import useModal from "../../hooks/useModal.js";
import { RollbackOutlined } from "@ant-design/icons";
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
    console.log(record);
    setModal({ mode: "edit", data: record });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-4 bg-white shadow-sm">
        <div className="flex flex-row gap-4">
          <Button
            className="modal-button"
            onClick={() => navigate("/panel/system-managment")}
            icon={< RollbackOutlined />}
          >
            بازگشت به صفحه قبل
          </Button>
          <UserModal
            isOpen={isOpen}
            modalMode={modalMode}
            modalData={modalData}
            closeModal={closeModal}
            setModal={setModal}
          />
        </div>

        <Table
          columns={columns(handleEditUser, handleDeleteUser)}
          dataSource={isFetching ? [] : data}
          loading={isFetching}
          rowKey="id"
          scroll={{ x: true }}
          responsive={{
            small: { columnWidth: 100 },
            middle: { columnWidth: 150 },
            large: { columnWidth: 200 },
          }}
        />
      </div>
    </div>

  );
};

export default Users;