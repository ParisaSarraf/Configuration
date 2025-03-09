import { message, Table } from "antd";
import { columns } from "./_components/usersColumn.jsx";
import { useUserList } from "../../QueryServises/userQuery/index.js";
import UserModal from "./_components/UserModal.jsx";
import { useDeleteUser } from "../../QueryServises/userQuery/index.js";
import useModal from "../../hooks/useModal.js";

const Users = () => {
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
    <div className="p-8 bg-white dark:bg-gray-800 min-h-full">
      <div className="flex flex-row gap-2 my-4">
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
        isLoading={isFetching}
        rowKey="id"
        scroll={{ x: true }}
        responsive={{
          small: { columnWidth: 100 },
          middle: { columnWidth: 150 },
          large: { columnWidth: 200 },
        }}
      />
    </div>
  );
};

export default Users;