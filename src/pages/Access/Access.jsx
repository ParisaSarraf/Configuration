import {Button} from 'antd';
import {useNavigate} from 'react-router-dom';
import UserSelectionPanel from './_components/UserSelectionPanel';
import RoleSelectionPanel from './_components/RoleSelectionPanel';
import ProductSelectionPanel from './_components/ProductSelectionPanel';
import {useAccessManagement} from "@/pages/Access/useAccessManagement.js";
import {ArrowRightOutlined} from '@ant-design/icons';

const Access = () => {
    const navigate = useNavigate();
    const {
        selectedUserId,
        selectedRoleId,
        selectedProductIds,
        onUserSelect,
        onRoleSelect,
        setSelectedProductIds,
        handleAddAccess,
        handleDeleteAccess,
        isCreating
    } = useAccessManagement();

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 flex flex-col" dir="rtl">
            <header className="max-w-screen-2xl mx-auto w-full mb-8">
                <Button
                    type="text"
                    icon={<ArrowRightOutlined/>}
                    onClick={() => navigate("/panel/system-management")}
                    className="flex items-center text-slate-600 hover:!text-sky-700 mb-4"
                >
                    بازگشت به مدیریت سیستم
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">مدیریت دسترسی کاربران به محصولات</h1>
                    <p className="mt-1 text-base text-slate-600">
                        فرآیند سه مرحله‌ای تخصیص دسترسی: ابتدا کاربر، سپس سمت و در نهایت محصولات مورد نظر را انتخاب
                        کنید.
                    </p>
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                <UserSelectionPanel
                    selectedUserId={selectedUserId}
                    onSelectUser={onUserSelect}
                />

                <RoleSelectionPanel
                    selectedUserId={selectedUserId}
                    selectedRoleId={selectedRoleId}
                    onSelectRole={onRoleSelect}
                    onDeleteAccess={handleDeleteAccess}
                />

                <ProductSelectionPanel
                    selectedUserId={selectedUserId}
                    selectedRoleId={selectedRoleId}
                    onSelectionChange={setSelectedProductIds}
                    onAssign={handleAddAccess}
                    isAssigning={isCreating}
                    selectedProductCount={selectedProductIds.length}
                />
            </main>
        </div>
    );
};

export default Access;