import {Button, Typography} from 'antd';
import {useNavigate} from 'react-router-dom';
import UserSelectionPanel from './_components/UserSelectionPanel';
import RoleSelectionPanel from './_components/RoleSelectionPanel';
import ProductSelectionPanel from './_components/ProductSelectionPanel';
import {useAccessManagement} from "@/pages/Access/useAccessManagement.js";
import {ArrowRightOutlined} from '@ant-design/icons';

const {Title, Paragraph} = Typography;

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

    const neonColor = 'text-Neon-Primary';
    const primaryTextColor = 'text-white';
    const secondaryTextColor = 'text-white';

    return (
        <div className="min-h-screen bg-dark-primary p-4 sm:p-6 lg:p-8 flex flex-col" dir="rtl">
            <header className="max-w-screen-2xl mx-auto w-full mb-8">
                <Button
                    type="text"
                    icon={<ArrowRightOutlined className={neonColor}/>}
                    onClick={() => navigate("/panel/system-management")}
                    className={`flex items-center ${secondaryTextColor} hover:!text-Neon-Primary mb-4`}
                >
                    بازگشت به مدیریت سیستم
                </Button>
                <div>
                    <span className={`text-3xl font-bold ${primaryTextColor} !mb-0`}>
                        مدیریت دسترسی کاربران به محصولات
                    </span>
                    <Paragraph className={`mt-1 text-base ${secondaryTextColor}`}>
                        فرآیند سه مرحله‌ای تخصیص دسترسی: ابتدا کاربر، سپس سمت و در نهایت محصولات مورد نظر را انتخاب
                        کنید.
                    </Paragraph>
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                <div className="lg:col-span-1 AeroBox p-4 rounded-2xl shadow-xl border border-Neon-Primary/20">
                    <UserSelectionPanel
                        selectedUserId={selectedUserId}
                        onSelectUser={onUserSelect}
                    />
                </div>

                <div className="lg:col-span-1 AeroBox p-4 rounded-2xl shadow-xl border border-Neon-Primary/20">
                    <RoleSelectionPanel
                        selectedUserId={selectedUserId}
                        selectedRoleId={selectedRoleId}
                        onSelectRole={onRoleSelect}
                        onDeleteAccess={handleDeleteAccess}
                    />
                </div>

                <div className="lg:col-span-1 AeroBox p-4 rounded-2xl shadow-xl border border-Neon-Primary/20">
                    <ProductSelectionPanel
                        selectedUserId={selectedUserId}
                        selectedRoleId={selectedRoleId}
                        onSelectionChange={setSelectedProductIds}
                        onAssign={handleAddAccess}
                        isAssigning={isCreating}
                        selectedProductCount={selectedProductIds.length}
                    />
                </div>
            </main>
        </div>
    );
};

export default Access;