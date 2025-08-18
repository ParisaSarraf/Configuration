import {NavButton} from "@/components/NavButton/NavButton.jsx";

const managementItems = [
    {path: "/panel/system-management/user", label: "مدیریت کاربران"},
    {path: "/panel/system-management/roles-permission", label: "مدیریت سمت ها و مجوز ها"},
    {path: "/panel/system-management/roles-life-cycle", label: "مدیریت سمت ها و دسترسی چرخه عمر"},
    {path: "/panel/system-management/roles-users-product", label: "مدیریت کاربران و دسترسی محصول"},
    {path: "/panel/system-management/roles-users", label: "مدیریت کاربران و دسترسی عمومی"},
    // { path: "/panel/system-management/detail-access-product", label: "جزئیات دسترسی کاربران به محصولات" },
];

function SystemManagement() {
    return (
        <div className="layout">
            <div className="my-1 p-2 bg-white shadow-md rounded-lg">
                <NavButton to="/" type="primary" className="BrandButton">
                    بازگشت به صفحه اصلی
                </NavButton>
            </div>

            <div className="flex flex-col items-center justify-center p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-5xl">
                    {managementItems.map((item) => (
                        <NavButton key={item.path} to={item.path} type={"primary"} ghost={'true'}>
                            {item.label}
                        </NavButton>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SystemManagement;