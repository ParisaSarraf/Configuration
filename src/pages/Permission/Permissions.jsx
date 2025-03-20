import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import PermissionsTree from "./_components/PermissionListTree";
import RoleListTree from "./_components/RoleListTree";

const Permissions = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-6 overflow-hidden">
            <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
                <Button
                    type="primary"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => navigate("/panel/system-managment/")}
                >
                    بازگشت به صفحه قبل
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-9xl">
                <Card
                    title="لیست دسترسی‌ها"
                    className="shadow-lg rounded-lg h-full flex flex-col"
>
                        <PermissionsTree />
                </Card>

                <Card
                    title="لیست سمت ها"
                    className="shadow-lg rounded-lg h-full flex flex-col"
                >
                    <RoleListTree />
                </Card>

                <Card
                    title="لیست دسترسی های سمت ها "
                    className="shadow-lg rounded-lg h-full flex flex-col"
                >
                    باکس 3
                </Card>
            </div>
        </div>
    );
};

export default Permissions;