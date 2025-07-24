import { Button, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import UsersRoleModal from './UsersRoleModal/UsersRoleModal'
import { PlusOutlined } from '@ant-design/icons'
import useModal from '../../hooks/useModal'
import UsersAndRoleTree from './UsersAndRoleTree/UsersAndRoleTree'
import { useUsersRoleList } from '../../QueryServises/user&role'

const UsersRole = () => {
    const navigate = useNavigate()
    const { setModal, closeModal, modalData, modalType, modalMode, isOpen } = useModal()
    const { data: usersAndroles, isLoading, isError, refetch } = useUsersRoleList();

    return (
        <div className="min-h-screen bg-Main p-2">
            <div className="my-1 p-2 bg-white shadow-md rounded-lg">
                <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate("/panel/system-managment/")}
                >
                    بازگشت به صفحه اصلی
                </Button>
            </div>
            <Card title=' مدیریت کاربران و دسترسی عمومی'
                extra={
                    <Button
                        className="modal-button"
                        icon={<PlusOutlined className="text-center" />}
                        onClick={() => setModal({ mode: "add", data: null })}
                    >
                        <span className="xs:hidden sm:hidden md:inline">افزودن سمت</span>
                    </Button>
                    // </>
                }>

                <UsersAndRoleTree
                    usersAndroles={usersAndroles}
                    isLoading={isLoading}
                    isError={isError}
                    setModal={setModal}
                />

                <UsersRoleModal
                    isOpen={isOpen}
                    modalData={modalData}
                    modalMode={modalMode}
                    modalType={modalType}
                    closeModal={closeModal}
                    setModal={setModal}
                    refetch={refetch}
                />
            </Card >


        </div >
    )
}

export default UsersRole
