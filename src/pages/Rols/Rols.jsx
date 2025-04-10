import React from "react";
import RoleModal from "./_components/RoleModal";
import { Button, Card, message } from "antd";
import { useDeleteRole, useRoleList } from "../../QueryServises/roleQuery";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import RoleTransferModal from "./_components/roleTransferModal";
import RoleTree from "./_components/RoleTree";
import RolePermissionsTree from "./_components/RolePermissionsTree";

function Rols() {
  const { refetch } = useRoleList();
  const navigate = useNavigate()
  const { isOpen, modalMode, modalData, modalType, setModal, closeModal } = useModal();


  const handleEditRole = (record) => {
    setModal({ type: 'role', mode: 'edit', data: record });
  };

  const handleTransferRole = (record) => {
    setModal({ type: 'roleTransfer', mode: 'edit', data: record });
  };

  return (
    <div className="min-h-screen bg-Main p-2">
      <div className="my-1 p-2 bg-white shadow-md rounded-lg">
        <Button
          type="primary"
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => navigate("/panel/system-managment")}
        >
          بازگشت به صفحه اصلی
        </Button>
      </div>
      <Card
        extra={
          <div className="flex flex-row gap-2">
            <Button
              type="primary"
              onClick={() => setModal({ type: 'role', mode: 'add', data: null })}
            >
              ایجاد سمت جدید
            </Button>
            <Button
              type="primary"
              onClick={() => setModal({ type: 'roleTransfer', mode: 'add', data: null })}
            >
              تخصیص دسترسی
            </Button>
          </div>
        }
      >
        <div className="w-full flex flex-row justify-evenly">
          <RoleTree />
          {/* <RolePermissionsTree /> */}
        </div>
      </Card>

      {modalType === 'role' && (
        <RoleModal
          isOpen={isOpen}
          modalMode={modalMode}
          modalData={modalData}
          closeModal={closeModal}
          refetch={refetch}
        />
      )}

      {modalType === 'roleTransfer' && (
        <RoleTransferModal
          isOpen={isOpen}
          modalMode={modalMode}
          modalData={modalData}
          closeModal={closeModal}
          refetch={refetch}
        />
      )}
    </div>
  );
}

export default Rols;