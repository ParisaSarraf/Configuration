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
        <div className="system-management-page min-h-screen theme-canvas p-4 sm:p-6 lg:p-8" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4">
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined/>}
                        onClick={() => navigate("/panel/system-management/")}
                        className="flex items-center theme-muted hover:!theme-accent"
                    >
                        بازگشت به مدیریت سیستم
                    </Button>
                </div>

                <div className="theme-surface rounded-xl shadow-lg border theme-border">
                    <div
                        className="themed-page-header flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b theme-border">
                        <div>
                            <h1 className="text-xl font-bold theme-text">مدیریت کاربران و دسترسی عمومی</h1>
                            <p className="mt-1 text-sm theme-muted">
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