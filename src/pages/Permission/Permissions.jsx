import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import UsersRoleModal from "../SystemManagment/UsersRoleModal/UsersRoleModal";
import { PlusOutlined } from "@ant-design/icons";
import UsersAndRoleTree from "../SystemManagment/UsersAndRoleTree/UsersAndRoleTree";
import UsersAndRoleTransform from "./_components/UsersAndRoleTransform";
import AccsessModal from "../Accsess/AccsessModal";


const Permissions = () => {
    const usersRoleModal = useModal('usersRole');
    const accessModal = useModal('access');

    const navigate = useNavigate();

    const handleOpenUsersRoleModal = () => {
        usersRoleModal.setModal({ mode: "add", data: null });
    };

    const handleOpenAccessModal = () => {
        accessModal.setModal({ mode: "add", data: null });
    };

    return (
        <div className="min-h-screen bg-Main p-2">
            <div className="my-1 p-2 bg-white shadow-md rounded-lg">
                <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate("/panel/system-managment/")}
                >
                    بازگشت به صفحه قبل
                </Button>
            </div>
            <Card
                extra={
                    <div className="flex flex-row gap-2">
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            className="w-40 ml-4"
                            onClick={handleOpenUsersRoleModal}
                        >
                            افزودن کاربر و سمت
                        </Button>
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            className="w-40 ml-4"
                            onClick={handleOpenAccessModal}
                        >
                            دسترسی به کاربر
                        </Button>
                    </div>
                }
            >
                <UsersAndRoleTransform />
                <UsersRoleModal
                    isOpen={usersRoleModal.isOpen}
                    modalMode={usersRoleModal.modalMode}
                    modalData={usersRoleModal.modalData}
                    closeModal={usersRoleModal.closeModal}
                    setModal={usersRoleModal.setModal}
                />
                <AccsessModal
                    isOpen={accessModal.isOpen}
                    modalMode={accessModal.modalMode}
                    modalData={accessModal.modalData}
                    closeModal={accessModal.closeModal}
                    setModal={accessModal.setModal}
                />
            </Card>
        </div>
    );
};

export default Permissions