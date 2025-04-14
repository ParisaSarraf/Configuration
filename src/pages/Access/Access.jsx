import { Button, Card, message, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useUserList } from '../../QueryServises/userQuery';
import RoleProductList from './_components/RoleProductList';
import UsersList from './_components/UsersList';
import { useState } from 'react';
import ProductsList from './_components/ProductsList';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useCreateAccessProducts, useDeleteAccessProducts, } from '../../QueryServises/accsessQuery';

const { Text } = Typography;


const Access = () => {
    const { refetch: userRefetch } = useUserList();
    const { mutateAysnc: createAccsessPoducts } = useCreateAccessProducts()
    const { mutateAysnc: deleteAccsessPoducts } = useDeleteAccessProducts()
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserAndRoleId, setSelectedUserAndRoleId] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);



    const handleAddAccess = () => {
        if (!selectedUserAndRoleId?.length || selectedProducts.length === 0) {
            return alert('لطفاً کاربر، سمت و محصولات را انتخاب کنید.');
        }
        const [role_id, user_id] = selectedUserAndRoleId;
        const payload = {
            user_id,
            role_id,
            product_ids: selectedProducts
        };
        console.log(payload);
        try {
            createAccsessPoducts(payload);
            message.success("محصول به سمت مورد نطر با موفقیت اضافه شد")
            refetch()
        } catch (error) {
            message.error("مشکلی در اضافه کردن محصول به سمت پیش آمده است.")
            console.error(error);
        }
    };


    const handleDeleteAccsess = async () => {
        if (!selectedUserAndRoleId?.length || selectedProducts.length === 0) {
            return alert('لطفاً کاربر، سمت و محصولات را انتخاب کنید.');
        }
        const [role_id, user_id] = selectedUserAndRoleId;
        const payload = {
            user_id,
            role_id,
            product_ids: selectedProducts
        };

        try {
            await deleteAccsessPoducts(payload);
            message.success("دسترسی محصول با موفقیت حذف شد");
            refetch(); 
        } catch (error) {
            message.error("مشکلی در حذف دسترسی محصول پیش آمده است.");
            console.error(error);
        }
    };


    const navigate = useNavigate()
    return (
        <>
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
                <Card className='w-full'>
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
                                refetch={userRefetch}
                                selectedUserId={selectedUserId}
                                setSelectedUserId={setSelectedUserId}
                                setSelectedUserAndRoleId={setSelectedUserAndRoleId}
                                selectedUserAndRoleId={selectedUserAndRoleId}
                            />
                        </div>

                        <div className='flex flex-col justify-center gap-4 px-2'>
                            <button
                                className="
      bg-blue-500 hover:bg-blue-600
      text-white
      rounded-full
      w-10 h-10
      flex items-center justify-center
      transition-colors
    "
                                onClick={handleAddAccess}
                            >
                                <PlusOutlined className="text-lg" />
                            </button>
                            <button
                                onClick={handleDeleteAccsess}
                                className="
      bg-red-500 hover:bg-red-600
      text-white
      rounded-full
      w-10 h-10
      flex items-center justify-center
      transition-colors
    "
                            >
                                <DeleteOutlined className="text-lg" />
                            </button>
                        </div>


                        <div className='flex-1 flex flex-col gap-4 border rounded p-4'>
                            <Text strong className='text-center'>لیست محصولات</Text>
                            <ProductsList
                                refetch={userRefetch}
                                setSelectedUserAndRoleId={setSelectedUserAndRoleId}
                                selectedUserAndRoleId={selectedUserAndRoleId}
                                setSelectedProducts={setSelectedProducts}
                            />

                        </div>
                    </div>
                </Card>
            </div >
        </>


    )
}

export default Access