import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";
import Modal from "../../../components/Modal";

const RoleModal = () => {
  return (
    <div>
      <Button
        className="modal-button"
        icon={<PlusOutlined className="text-center" />}
        onClick={() => setModal({ mode: "add", data: null })}
      >
        <span className="xs:hidden sm:hidden md:inline">افزودن دسترسی</span>
      </Button>
      {/* <Modal
        isOpen={isOpen}
        title={`${modalMode === "edit" ? "ویرایش" : "افزودن"} کاربر`}
        size={600}
        onClose={closeModal}
        onSubmit={() => form.submit()}
        mode={modalMode}
        loading={isCreating || isUpdating}
      ></Modal> */}
    </div>
  );
};

export default RoleModal;
