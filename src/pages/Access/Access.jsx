import { Button, Card, message, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useUserList } from '../../QueryServises/userQuery';
import RoleProductList from './_components/RoleProductList';
import UsersList from './_components/UsersList';
import { useState } from 'react';
import ProductsList from './_components/ProductsList';

import { ArrowRightOutlined } from '@ant-design/icons';
import { useCreateAccessProducts, useDeleteAccessProducts, useAccessList, useUnAccessOfUserByIdList, useAccessOfUserByIdList } from '../../QueryServises/accsessQuery';

const { Text } = Typography;

const Access = () => {
    const { refetch: userRefetch } = useUserList();
    const { refetch: accessListRefetch } = useAccessList();
    const navigate = useNavigate();

    const { mutateAsync: createAccessProducts } = useCreateAccessProducts();
    const { mutateAsync: deleteAccessProducts } = useDeleteAccessProducts();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserAndRoleId, setSelectedUserAndRoleId] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const {
        refetch: refetchAccess
    } = useAccessOfUserByIdList(selectedUserId);

    const {
        refetch: refetchUnAccess
    } = useUnAccessOfUserByIdList(selectedUserId);

    const handleAddAccess = async () => {
        if (!selectedUserAndRoleId || selectedUserAndRoleId.length !== 2 || selectedProducts.length === 0) {
            return message.warning('لطفاً کاربر، سمت و محصولات را انتخاب کنید.');
        }
        const [role_id, user_id] = selectedUserAndRoleId;
        const payload = {
            user_id,
            role_id,
            product_ids: selectedProducts
        };
        try {
            await createAccessProducts(payload);
            message.success("محصول به سمت مورد نظر با موفقیت اضافه شد");
            userRefetch();
            accessListRefetch();
            refetchAccess();
            refetchUnAccess();
        } catch (error) {
            message.error("مشکلی در اضافه کردن محصول به سمت پیش آمده است.");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-Main p-2">
            <div className="my-1 p-2 bg-white shadow-md rounded-lg">
                <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate("/panel/system-managment")}
                >
                    بازگشت به صفحه اصلی
                </Button>
            </div>
            <Card className='w-full' title="مدیریت کاربران و دسترسی محصول">
                <div className='w-full flex flex-row gap-4 items-stretch'>
                    <div className='flex-1 flex flex-col gap-4 border rounded p-4'>
                        <Text strong className='text-center'>لیست کاربران</Text>
                        <UsersList
                            refetch={userRefetch}
                            selectedUserId={selectedUserId}
                            setSelectedUserId={setSelectedUserId}
                        />
                    </div>

                    <div className='flex-1 flex flex-col gap-4 border rounded p-4'>
                        <Text strong className='text-center'>لیست سمت‌ها</Text>
                        <RoleProductList
                            accessListRefetch={accessListRefetch}
                            refetch={userRefetch}
                            selectedUserId={selectedUserId}
                            setSelectedUserAndRoleId={setSelectedUserAndRoleId}
                            selectedUserAndRoleId={selectedUserAndRoleId}
                            setSelectedProducts={setSelectedProducts}
                            deleteAccessProducts={deleteAccessProducts}
                        />
                    </div>
                    
                    <div className='flex flex-col justify-center gap-4 px-2'>
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                            onClick={handleAddAccess}
                        >
                            <ArrowRightOutlined className="text-lg" />
                        </button>
                    </div>

                    <div className='flex-1 flex flex-col gap-4 border rounded p-4'>
                        <Text strong className='text-center'>لیست محصولات</Text>
                        <ProductsList
                            accessListRefetch={accessListRefetch}
                            refetch={userRefetch}
                            setSelectedUserAndRoleId={setSelectedUserAndRoleId}
                            selectedUserAndRoleId={selectedUserAndRoleId}
                            setSelectedProducts={setSelectedProducts}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Access;