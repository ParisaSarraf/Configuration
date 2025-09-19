// RoleLifeCycle.js
import React, {useState} from "react";
import {Button} from "antd";
import {useNavigate} from "react-router-dom";
import useModal from "../../hooks/useModal";
import {useRoleList} from "../../QueryServises/roleQuery";
import {useLifeCycleList} from "../../QueryServises/lifeCycleQuery";
import {ArrowRightOutlined, PlusOutlined} from "@ant-design/icons";
import RoleModal from "../Rols/_components/RoleModal";
import RoleListPanel from "./components/RoleListPanel";
import LifeCycleManager from "./components/LifeCycleManager";

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
                            <h1 className="text-3xl font-bold text-slate-900">مدیریت دسترسی چرخه عمر</h1>
                            <p className="mt-1 text-base text-slate-600">
                                یک سمت را انتخاب کرده و چرخه‌های عمر قابل دسترس برای آن را مدیریت کنید.
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
                        refetch={handleRefetchAll}
                    />

                    <LifeCycleManager
                        selectedRoleId={selectedRoleId}
                        refetch={handleRefetchAll}
                    />
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