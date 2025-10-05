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

    const neonColor = 'text-Neon-Primary';
    const primaryTextColor = 'text-white';
    const secondaryTextColor = 'text-white';


    return (
        <div className="min-h-screen bg-dark-primary p-4 sm:p-6 lg:p-8 flex flex-col" dir="rtl">
            <div className="max-w-screen-2xl mx-auto w-full">
                <header>
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined className={neonColor}/>}
                        onClick={() => navigate("/panel/system-management")}
                        className={`flex items-center ${secondaryTextColor} hover:!text-Neon-Primary mb-4`}
                    >
                        بازگشت به مدیریت سیستم
                    </Button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className={`text-3xl font-bold ${primaryTextColor}`}>مدیریت سمت‌ها و مجوزها</h1>
                            <p className={`mt-1 text-base ${secondaryTextColor}`}>
                                یک سمت از لیست انتخاب کرده و مجوزهای آن را در پنل مقابل مدیریت کنید.
                            </p>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            onClick={() => setModal({mode: 'add', data: null})}
                            className="NeonButton mt-4 md:mt-0"
                        >
                            ایجاد سمت جدید
                        </Button>
                    </div>
                </header>

                <main className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                    <div className="lg:col-span-1 AeroBox p-4 rounded-2xl shadow-xl border border-Neon-Primary/20">
                        <RoleListPanel
                            selectedRoleId={selectedRoleId}
                            onRoleSelect={setSelectedRoleId}
                            setModal={setModal}
                            refetch={handleRefetch}
                        />
                    </div>


                    <div className="lg:col-span-2 AeroBox p-6 rounded-2xl shadow-xl border border-Neon-Primary/20">
                        <PermissionManager
                            selectedRoleId={selectedRoleId}
                            refetch={handleRefetch}
                        />
                    </div>

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