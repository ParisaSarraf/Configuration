import React, {useState} from "react";
import {Button, Typography} from "antd";
import {useNavigate} from "react-router-dom";
import useModal from "../../hooks/useModal";
import {useRoleList} from "../../QueryServises/roleQuery";
import {useLifeCycleList} from "../../QueryServises/lifeCycleQuery";
import {ArrowRightOutlined, PlusOutlined} from "@ant-design/icons";
import RoleModal from "../Rols/_components/RoleModal";
import RoleListPanel from "./components/RoleListPanel";
import LifeCycleManager from "./components/LifeCycleManager";

const {Title, Paragraph} = Typography;

const RoleLifeCycle = () => {
    const {isOpen, modalMode, modalData, setModal, closeModal} = useModal();
    const {refetch: roleRefetch} = useRoleList();
    const {refetch: roleLifeCycleFetch} = useLifeCycleList();
    const navigate = useNavigate();

    const [selectedRoleId, setSelectedRoleId] = useState(null);

    const handleRefetchAll = () => {
        roleRefetch();
        roleLifeCycleFetch();
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
                            <span className={`text-3xl font-bold text-white !mb-0`}>
                                مدیریت دسترسی چرخه عمر
                            </span>
                            <Paragraph className={`mt-1 text-base ${secondaryTextColor}`}>
                                یک سمت را انتخاب کرده و چرخه‌های عمر قابل دسترس برای آن را مدیریت کنید.
                            </Paragraph>
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
                            refetch={handleRefetchAll}
                        />
                    </div>


                    <div className="lg:col-span-2 AeroBox p-6 rounded-2xl shadow-xl border border-Neon-Primary/20">
                        <LifeCycleManager
                            selectedRoleId={selectedRoleId}
                            refetch={handleRefetchAll}
                        />
                    </div>

                </main>
            </div>

            <RoleModal
                isOpen={isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                refetch={handleRefetchAll}
            />
        </div>
    );
};

export default RoleLifeCycle;