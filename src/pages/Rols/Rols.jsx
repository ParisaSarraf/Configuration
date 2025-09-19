import {useState} from "react";
import RoleModal from "./_components/RoleModal";
import {Button} from "antd";
import {useRoleList} from "../../QueryServises/roleQuery";
import {useNavigate} from "react-router-dom";
import useModal from "../../hooks/useModal";
import {useRolePermissionList} from "../../QueryServises/role&permission";
import {ArrowRightOutlined, PlusOutlined} from "@ant-design/icons";
import RoleListPanel from "./_components/RoleListPanel";
import PermissionManager from "./_components/PermissionManager";

function Rols() {
    const {refetch: roleRefetch} = useRoleList();
    const {refetch: rolePermissionFetch} = useRolePermissionList();
    const navigate = useNavigate();
    const {isOpen, modalMode, modalData, setModal, closeModal} = useModal();

    const [selectedRoleId, setSelectedRoleId] = useState(null);

    const handleRefetch = () => {
        roleRefetch();
        rolePermissionFetch();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 flex flex-col" dir="rtl">
            <div className="max-w-screen-2xl mx-auto w-full">
                <header>
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined/>}
                        onClick={() => navigate("/panel/system-management")}
                        className="flex items-center text-slate-600 hover:!text-sky-700 mb-4"
                    >
                        بازگشت به مدیریت سیستم
                    </Button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">مدیریت سمت‌ها و مجوزها</h1>
                            <p className="mt-1 text-base text-slate-600">
                                یک سمت از لیست انتخاب کرده و مجوزهای آن را در پنل مقابل مدیریت کنید.
                            </p>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            onClick={() => setModal({mode: 'add', data: null})}
                            className="mt-4 md:mt-0"
                        >
                            ایجاد سمت جدید
                        </Button>
                    </div>
                </header>

                <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    <RoleListPanel
                        selectedRoleId={selectedRoleId}
                        onRoleSelect={setSelectedRoleId}
                        setModal={setModal}
                        refetch={handleRefetch}
                    />

                    <PermissionManager
                        selectedRoleId={selectedRoleId}
                        refetch={handleRefetch}
                    />
                </main>
            </div>

            <RoleModal
                isOpen={isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                refetch={handleRefetch}
            />
        </div>
    );
}

export default Rols;