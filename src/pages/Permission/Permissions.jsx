import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import UsersRoleModal from "../SystemManagment/UsersRoleModal/UsersRoleModal";
import { PlusOutlined } from "@ant-design/icons";
import UsersAndRoleTree from "../SystemManagment/UsersAndRoleTree/UsersAndRoleTree";
import UsersAndRoleTransform from "./_components/UsersAndRoleTransform";

const Permissions = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const navigate = useNavigate();

    const handleOpenModal = () => {
        setModal({ mode: "create", data: null });
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
            <Card>
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
                        <UsersAndRoleTransform />
                    </Card>
                </div>
            </Card>

        </div>
    );
};

export default Permissions;