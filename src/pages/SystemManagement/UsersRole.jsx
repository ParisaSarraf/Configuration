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

    const primaryTextColor = 'text-white';
    const secondaryTextColor = 'text-white';
    const neonColor = 'text-Neon-Primary';

    return (
        <div className="min-h-screen bg-dark-primary p-4 sm:p-6 lg:p-8" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="mb-4">
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined className={neonColor}/>}
                        onClick={() => navigate("/panel/system-management/")}
                        className={`flex items-center ${secondaryTextColor} hover:!text-Neon-Primary`}
                    >
                        بازگشت به مدیریت سیستم
                    </Button>
                </div>

                <div className="AeroBox rounded-2xl border border-Neon-Primary/20 shadow-2xl">
                    <div
                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-dark-secondary/50"
                    >
                        <div className={'w-full flex flex-col'}>
                            <span className={`text-xl font-bold ${primaryTextColor} !mb-0`}>
                                مدیریت کاربران و دسترسی عمومی
                            </span>
                            <span className={`mt-1 text-sm ${secondaryTextColor}`}>
                                در این بخش می‌توانید سمت‌ها را تعریف کرده و کاربران را به آن‌ها تخصیص دهید.
                            </span>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            onClick={() => setModal({mode: "add", data: null})}
                            className="NeonButton mt-4 md:mt-0"
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