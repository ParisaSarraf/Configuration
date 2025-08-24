import {Button, Card, Spin, Typography} from 'antd';
import {useNavigate} from 'react-router-dom';
import UsersList from './_components/UsersList';
import RoleProductList from './_components/RoleProductList';
import ProductsList from './_components/ProductsList';
import {useAccessManagement} from "@/pages/Access/useAccessManagement.js";
import {ArrowRightOutlined} from '@ant-design/icons';

const {Text} = Typography;

const Access = () => {
    const navigate = useNavigate();
    const {
        selectedUserId,
        selectedRoleId,
        onUserSelect,
        onRoleSelect,
        setSelectedProductIds,
        handleAddAccess,
        handleDeleteAccess,
        isCreating
    } = useAccessManagement();

    return (
        <div className="min-h-screen bg-Main p-2">
            <div className="my-1 p-2 bg-white shadow-md rounded-lg">
                <Button type="primary" onClick={() => navigate("/panel/system-management")}>
                    بازگشت به صفحه اصلی
                </Button>
            </div>
            <Card title="مدیریت دسترسی کاربران به محصولات">
                <div className='w-full flex flex-row gap-4 items-stretch'>
                    {/* Column 1: Users List */}
                    <div className='flex-1 flex flex-col gap-4 border rounded p-4'>
                        <Text strong className='text-center'>۱. یک کاربر انتخاب کنید</Text>
                        <UsersList
                            selectedUserId={selectedUserId}
                            onSelectUser={onUserSelect}
                        />
                    </div>

                    <div className='flex-1 flex flex-col gap-4 border rounded p-4'>
                        <Text strong className='text-center'>۲. یک سمت انتخاب کنید</Text>
                        <RoleProductList
                            selectedUserId={selectedUserId}
                            selectedRoleId={selectedRoleId}
                            onSelectRole={onRoleSelect}
                            onDeleteAccess={handleDeleteAccess}
                        />
                    </div>

                    <div className='flex flex-col justify-center items-center gap-4 px-2'>
                        <Button
                            type="primary"
                            shape="circle"
                            icon={isCreating ? <Spin/> : <ArrowRightOutlined/>}
                            size="large"
                            onClick={handleAddAccess}
                            disabled={isCreating}
                            title="افزودن دسترسی"
                        />
                    </div>

                    <div className='flex-1 flex flex-col gap-4 border rounded p-4'>
                        <Text strong className='text-center'>۳. محصولات را انتخاب کنید</Text>
                        <ProductsList
                            selectedUserId={selectedUserId}
                            selectedRoleId={selectedRoleId}
                            onSelectionChange={setSelectedProductIds}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Access;