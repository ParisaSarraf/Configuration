import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import UsersRoleModal from "../SystemManagment/UsersRoleModal/UsersRoleModal";
import { PlusOutlined } from "@ant-design/icons";
import UsersAndRoleTree from "../SystemManagment/UsersAndRoleTree/UsersAndRoleTree";

const Permissions = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const navigate = useNavigate();

    const handleOpenModal = () => {
        setModal({ mode: "create", data: null });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 overflow-hidden">
            <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
                <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate("/panel/system-managment/")}
                >
                    بازگشت به صفحه قبل
                </Button>

            </div>

            <div className="grid grid-cols-1 gap-6 w-full max-w-9xl mx-auto">
                <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    className="w-40 ml-4"
                    onClick={handleOpenModal}
                >
                    افزودن کاربر و سمت
                </Button>
                <UsersRoleModal
                    isOpen={isOpen}
                    modalMode={modalMode}
                    modalData={modalData}
                    closeModal={closeModal}
                    setModal={setModal}
                />
                <Card>
                    <UsersAndRoleTree />
                </Card>
            </div>
        </div>
    );
};

export default Permissions;