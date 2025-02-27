import { Table, Pagination, Button, Modal } from "antd";
import { useState } from "react";
import ExportButton from "../../components/ExportButton/ExportButton.jsx";
import { columns, dataSource } from "./_components/usersColumn.jsx";
import { PlusOutlined } from "@ant-design/icons";
import AddUsersDrawer from "./AddUsersDrawer.jsx";
import usePagination from "../../hooks/usePagination.jsx";

const Users = () => {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const pageSize = 5;

  const { currentPage, handlePageChange, paginatedData } = usePagination(dataSource, pageSize);

  const handleShowUsersDrawer = () => {
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
  };

  const handleAddUser = (values) => {
    console.log("User added:", values);
  };

  const handleEditUser = (record) => {
    console.log("Edit user:", record);
  };

  const handleDeleteUser = (record) => {
    console.log("حذف کاریر با ایدی:", record.id);
    Modal.confirm({
      title: "آیا مطمئن هستید؟",
      content: "این عمل قابل بازگشت نیست!",
      okText: "بله",
      cancelText: "لغو",
      onOk: () => {
      },
    });
  };


  return (
    <div className="p-8 bg-white dark:bg-gray-800 min-h-full">
      <div className="flex flex-row gap-2 my-4">
        <Button
          className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
          icon={<PlusOutlined className="text-center" />}
          onClick={handleShowUsersDrawer}
        >
          افزودن کاربر
        </Button>
        <ExportButton data={dataSource} filename="داده‌های فارسی" />
      </div>
      <Table
        dataSource={paginatedData}
        columns={columns(handleEditUser, handleDeleteUser)}
        className="mb-4"
        pagination={false}
        rowKey="id"
      />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={dataSource.length}
        onChange={handlePageChange}
        className="mb-4 text-right"
      />
      <AddUsersDrawer
        visible={isDrawerVisible}
        onClose={handleDrawerClose}
        onSubmit={handleAddUser}
      />
    </div>
  );
};

export default Users;