import { Table, Pagination, Button, message } from "antd";
import { useEffect, useState } from "react";
import ExportButton from "../../components/ExportButton/ExportButton.jsx";
import { columns } from "./_components/usersColumn.jsx";
import { PlusOutlined } from "@ant-design/icons";
import AddUsersModal from "./AddUsersModal.jsx";
import usePagination from "../../hooks/usePagination.jsx";
import UserQuery from "../../QueryServises/UsersQuery";

const Users = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const pageSize = 5;
  const { deleteUser, gettAllUser } = UserQuery();
  const [data, setData] = useState([]);

  const fetchAllUser = async () => {
    try {
      const response = await gettAllUser();
      setData(response);
    } catch (error) {
      message.error("مشکلی در دریافت داده‌ها به وجود آمده است.");
    }
  };

  useEffect(() => {
    fetchAllUser();
  }, []);

  const { currentPage, handlePageChange, paginatedData } = usePagination(data, pageSize);

  const handleShowUsersModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    fetchAllUser();
  };

  const handleDeleteUser = async (record) => {
    console.log(record.id);
    try {
      await deleteUser(record.id);
      message.success("کاربر با موفقیت حذف شد.");
      fetchAllUser();
    } catch (error) {
      message.error("مشکلی در حذف کاربر به وجود آمده است.");
    }
  }


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
        dataSource={paginatedData}
        columns={columns(handleDeleteUser)}
        className="mb-4"
        pagination={false}
        rowKey="id"
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
        onSubmit={handleModalClose}
      />
    </div>
  );
};

export default Users;