import {Button, message, Table} from "antd";
import {columns} from "./_components/usersColumn.jsx";
import {useDeleteUser, useUserList} from "@/QueryServises/userQuery/index.js";
import UserModal from "./_components/UserModal.jsx";
import useModal from "../../hooks/useModal.js";
import {useNavigate} from "react-router-dom";
import {ArrowRightOutlined, PlusOutlined} from "@ant-design/icons";

const Users = () => {
    const navigate = useNavigate();
    const {isOpen, modalMode, modalData, setModal, closeModal} = useModal();
    const {isFetching, data, refetch} = useUserList();
    const {mutateAsync: deleteUser} = useDeleteUser();

    const handleDeleteUser = (record) => {
        deleteUser(record.id)
            .then(() => {
                message.success("کاربر با موفقیت حذف شد");
                refetch();
            })
            .catch(() => {
                message.error("حذف ناموفق بود، دوباره امتحان کنید");
            });
    };

    const handleEditUser = (record) => {
        setModal({mode: "edit", data: record});
    };

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
                            <h1 className="text-xl font-bold text-slate-800">مدیریت کاربران</h1>
                            <p className="mt-1 text-sm text-slate-500">
                                لیست تمام کاربران سیستم را مشاهده کرده و آن‌ها را مدیریت کنید.
                            </p>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined/>}
                            onClick={() => setModal({mode: "add", data: null})}
                            className="mt-4 md:mt-0"
                        >
                            افزودن کاربر جدید
                        </Button>
                    </div>

                    <div className="p-2 md:p-4">
                        <Table
                            columns={columns(handleEditUser, handleDeleteUser)}
                            dataSource={data}
                            loading={isFetching}
                            rowKey="id"
                            scroll={{x: 'max-content'}}
                        />
                    </div>
                </div>
            </div>

            <UserModal
                isOpen={isOpen}
                modalMode={modalMode}
                modalData={modalData}
                closeModal={closeModal}
                refetch={refetch}
            />
        </div>
    );
};

export default Users;