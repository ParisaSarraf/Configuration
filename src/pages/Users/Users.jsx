import { Table, Pagination, Button, message } from "antd";
import { useEffect, useState } from "react";
import ExportButton from "../../components/ExportButton/ExportButton.jsx";
import { columns } from "./_components/usersColumn.jsx";
import { PlusOutlined } from "@ant-design/icons";
import AddUsersModal from "./AddUsersModal.jsx";
import EditUserDrawer from "./EditUserDrawer.jsx";
import usePagination from "../../hooks/usePagination.jsx";
import { useUserList, useCreateUser, useDeleteUser, useUpdateUser } from "../../QueryServises/userQuery/index.js";

const Users = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const pageSize = 5;

  // Fetch user data
  const { data: userData, isFetching, error, refetch } = useUserList({
    onSuccess: (userData) => {
      setData(userData);
    },
  });

  useEffect(() => {
    console.log("User Data:", userData);
    console.log("Fetching:", isFetching);
    console.log("Error:", error);
  }, [userData, isFetching, error]);


  const [data, setData] = useState([]);

  // Pagination
  const { currentPage, handlePageChange, paginatedData } = usePagination(
    userData || [],
    pageSize
  );



  // Mutations
  const { mutate: createUser } = useCreateUser();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: updateUser } = useUpdateUser();

  // Handlers
  const handleShowUsersModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    refetch();
  };

  const handleDeleteUser = async (record) => {
    try {
      await deleteUser(record.id);
      message.success("کاربر با موفقیت حذف شد.");
      refetch();
    } catch (error) {
      message.error("مشکلی در حذف کاربر به وجود آمده است.");
    }
  };

  const handleEditUser = (record) => {
    setSelectedUser(record);
    setIsEditDrawerVisible(true);
  };

  const handleEditDrawerClose = () => {
    setIsEditDrawerVisible(false);
    refetch();
  };

  const handleAddUser = async (userData) => {
    try {
      await createUser(userData);
      message.success("کاربر با موفقیت افزوده شد.");
      refetch();
      setIsModalVisible(false);
    } catch (error) {
      message.error("مشکلی در افزودن کاربر به وجود آمده است.");
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await updateUser({ userId: selectedUser.id, userData });
      message.success("کاربر با موفقیت به‌روزرسانی شد.");
      refetch();
      setIsEditDrawerVisible(false);
    } catch (error) {
      message.error("مشکلی در به‌روزرسانی کاربر به وجود آمده است.");
    }
  };

  return (
    <div className="p-8 bg-white dark:bg-gray-800 min-h-full">
      <div className="flex flex-row gap-2 my-4">
        <Button
          className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
          icon={<PlusOutlined className="text-center" />}
          onClick={handleShowUsersModal}
        >
          افزودن کاربر
        </Button>
        <ExportButton data={data} filename="داده‌های فارسی" />
      </div>
      <Table
        dataSource={isFetching ? [] : paginatedData}
        columns={columns(handleDeleteUser, handleEditUser)}
        pagination={false}
        rowKey="id"
        scroll={{ x: true }}
        responsive={{
          small: { columnWidth: 100 },
          middle: { columnWidth: 150 },
          large: { columnWidth: 200 },
        }}
      />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={data.length}
        onChange={handlePageChange}
        className="mb-4 text-right"
      />
      <AddUsersModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onSubmit={handleAddUser}
      />
      <EditUserDrawer
        visible={isEditDrawerVisible}
        onClose={handleEditDrawerClose}
        onSubmit={handleUpdateUser}
        user={selectedUser}
      />
    </div>
  );
};

export default Users;