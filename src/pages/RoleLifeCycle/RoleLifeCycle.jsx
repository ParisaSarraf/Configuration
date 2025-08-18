import { Button, Card } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import useModal from '../../hooks/useModal';
import RoleModal from '../Rols/_components/RoleModal';
import RoleLifeCycleTree from './components/RoleLifeCycleTree';
import RoleLifeCycleTransfer from './components/RoleLifeCycleTransfer';
import { useRoleList } from '../../QueryServises/roleQuery';
import { useLifeCycleList } from '../../QueryServises/lifeCycleQuery';

const RoleLifeCycle = () => {
    const { isOpen, modalMode, modalData, setModal, closeModal } = useModal();
    const { refetch: roleRefetch } = useRoleList();
    const { refetch: roleLifeCycleFetch } = useLifeCycleList();
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-Main p-2">
            <div className="my-1 p-2 bg-white shadow-md rounded-lg">
                <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate("/panel/system-management")}
                >
                    بازگشت به صفحه اصلی
                </Button>
            </div>
            <Card
                title="مدیریت کاربران و دسترسی چرخه عمر"
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
                    <RoleLifeCycleTree
                        setModal={setModal}
                        refetch={() => {
                            roleRefetch();
                            roleLifeCycleFetch();
                        }}
                    />
                    <RoleLifeCycleTransfer
                        refetch={() => {
                            roleRefetch();
                            roleLifeCycleFetch();
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
    )
}

export default RoleLifeCycle
