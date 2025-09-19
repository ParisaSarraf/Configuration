import {Button} from 'antd';
import {useNavigate} from 'react-router-dom';
import UsersRoleModal from './UsersRoleModal/UsersRoleModal';
import {ArrowRightOutlined, PlusOutlined} from '@ant-design/icons';
import useModal from '../../hooks/useModal';
import UsersAndRoleTree from './UsersAndRoleTree/UsersAndRoleTree';
import {useUsersRoleList} from '../../QueryServises/user&role';

const UsersRole = () => {
    const navigate = useNavigate();
    const {setModal, closeModal, modalData, modalType, modalMode, isOpen} = useModal();
    const {data: usersAndroles, isLoading, isError, refetch} = useUsersRoleList();

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4">
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined/>}
                        onClick={() => navigate("/panel/system-management/")}
                        className="flex items-center text-slate-600 hover:!text-sky-700"
                    >
                        بازگشت به مدیریت سیستم
                    </Button>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                    <div
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-slate-200">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">مدیریت کاربران و دسترسی عمومی</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                در این بخش می‌توانید سمت‌ها را تعریف کرده و کاربران را به آن‌ها تخصیص دهید.
                            </p>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            onClick={() => setModal({mode: "add", data: null})}
                            className="mt-4 md:mt-0"
                        >
                            افزودن سمت
                        </Button>
                    </div>

                    <div className="p-6">
                        <UsersAndRoleTree
                            usersAndroles={usersAndroles}
                            isLoading={isLoading}
                            isError={isError}
                            setModal={setModal}
                        />
                    </div>
                </div>

                <UsersRoleModal
                    isOpen={isOpen}
                    modalData={modalData}
                    modalMode={modalMode}
                    modalType={modalType}
                    closeModal={closeModal}
                    setModal={setModal}
                    refetch={refetch}
                />
            </div>
        </div>
    );
};

export default UsersRole;