import React from "react";
import RoleModal from "./_components/RoleModal";
import { Button, Card } from "antd";
import { useRoleList } from "../../QueryServises/roleQuery";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import RoleTree from "./_components/RoleTree";
import { useRolePermissionList } from "../../QueryServises/role&permission";
import RoleTransfer from "./_components/RoleTransfer";

function Rols() {
  const { refetch: roleRefetch } = useRoleList();
  const { refetch: rolePermissionFetch } = useRolePermissionList();
  const navigate = useNavigate()
  const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();

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
        title="مدیریت سمت ها و مجوز ها"
        extra={
          <div className="flex flex-row gap-2">
            <Button
              type="primary"
              onClick={() => setModal({ mode: 'add', data: null })}
            >
              ایجاد سمت جدید
            </Button>
          </div>

        }
      >
        <div className="w-full flex flex-row justify-around">
          <RoleTree
            setModal={setModal}
            refetch={() => {
              roleRefetch();
              rolePermissionFetch();
            }}
          />
          <RoleTransfer
            refetch={() => {
              roleRefetch();
              rolePermissionFetch();
            }}
          />
        </div>
      </Card>
      <RoleModal
        isOpen={isOpen}
        modalMode={modalMode}
        modalData={modalData}
        closeModal={closeModal}
        refetch={() => {
          roleRefetch();
          rolePermissionFetch();
        }}
      />
    </div>
  );
}

export default Rols;