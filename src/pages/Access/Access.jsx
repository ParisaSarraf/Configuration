import { Button, Card, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useUserList } from '../../QueryServises/userQuery';
import RoleProductList from './_components/RoleProductList';
import UsersList from './_components/UsersList';
import { useState } from 'react';
import ProductsList from './_components/ProductsList';

const { Text } = Typography;


const Access = () => {
    const { refetch: userRefetch } = useUserList();
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserAndRoleId, setSelectedUserAndRoleId] = useState([]);

    console.log("Selected User ID:", selectedUserId);
    console.log("Selected User and Role ID:", selectedUserAndRoleId);

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
                    <div className='w-full flex flex-row gap-4'>
                        <div className='w-full flex flex-col gap-4'>
                            <Text strong className='text-center'>لیست کاربران</Text>
                            <UsersList
                                refetch={userRefetch}
                                selectedUserId={selectedUserId}
                                setSelectedUserId={setSelectedUserId}
                            />
                        </div>
                        <div className='w-full flex flex-col gap-4'>
                            <Text strong className='text-center'>لیست سمت ها</Text>
                            <RoleProductList
                                refetch={userRefetch}
                                selectedUserId={selectedUserId}
                                setSelectedUserId={setSelectedUserId}
                                setSelectedUserAndRoleId={setSelectedUserAndRoleId}
                                selectedUserAndRoleId={selectedUserAndRoleId}
                            />
                        </div>
                        <div className='w-full flex flex-col gap-4'>
                            <Text strong className='text-center'>لیست محصولات</Text>
                            <ProductsList
                                refetch={userRefetch}
                                className="flex-1"
                                setSelectedUserAndRoleId={setSelectedUserAndRoleId}
                                selectedUserAndRoleId={selectedUserAndRoleId}
                            />
                        </div>
                    </div>
                </Card >
            </div >
        </>


    )
}

export default Access