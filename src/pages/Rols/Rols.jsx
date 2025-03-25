import React from "react";
import RoleModal from "./_components/RoleModal";
import { Button, Card, message, Table } from "antd";
import { useDeleteRole, useRoleList } from "../../QueryServises/roleQuery";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import { roleColumns } from "./_components/roleColumns"

function Rols() {
  const { isFetching, data: roleData, refetch } = useRoleList();
  const { mutateAsync: deleteRole } = useDeleteRole();
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
  const navigate = useNavigate();

  const handleDeleteRole = (record) => {
    console.log(record.id);
    
    deleteRole(record.id)
      .then(() => {
        message.success("سمت با موفقیت حذف شد");
        refetch();
      })
      .catch((error) => {
        message.error("موفقیت آمیز نبود، دوباره امتحان کنید");
        console.error(error);
      });
  };

  const handleEditRole = (record) => {
    setModal({ mode: "edit", data: record });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-2 p-4 bg-white shadow-md rounded-lg">
        <Button
          type="primary"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => navigate("/panel/system-managment/")}
        >
          بازگشت به صفحه اصلی
        </Button>
      </div>
      <div className="flex flex-row gap-2">
        <RoleModal
          isOpen={isOpen}
          modalMode={modalMode}
          modalData={modalData}
          closeModal={closeModal}
          setModal={setModal}
          refetch={refetch}
        />
      </div>
      <Card>
        <Table
          columns={roleColumns(handleEditRole, handleDeleteRole)}
          dataSource={isFetching ? [] : roleData}  
          loading={isFetching}
          rowKey="id"
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
}

export default Rols;