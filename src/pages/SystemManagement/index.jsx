import {NavLink} from "react-router-dom";
import {
    ApartmentOutlined,
    ArrowRightOutlined,
    SafetyCertificateOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined
} from "@ant-design/icons";

const managementItems = [
    {
        path: "/panel/system-management/user",
        label: "مدیریت کاربران",
        description: "افزودن، ویرایش و مدیریت پروفایل کاربران سیستم.",
        icon: <UserOutlined className="text-2xl text-sky-600"/>
    },
    {
        path: "/panel/system-management/roles-permission",
        label: "مدیریت سمت‌ها و مجوزها",
        description: "ایجاد و تخصیص سطوح دسترسی و مجوزهای مختلف.",
        icon: <SafetyCertificateOutlined className="text-2xl text-teal-600"/>
    },
    {
        path: "/panel/system-management/roles-life-cycle",
        label: "دسترسی چرخه عمر",
        description: "مدیریت دسترسی کاربران به مراحل مختلف چرخه عمر محصول.",
        icon: <ApartmentOutlined className="text-2xl text-violet-600"/>
    },
    {
        path: "/panel/system-management/roles-users-product",
        label: "دسترسی کاربران به محصول",
        description: "تخصیص یا لغو دسترسی کاربران به محصولات خاص.",
        icon: <SolutionOutlined className="text-2xl text-amber-600"/>
    },
    {
        path: "/panel/system-management/roles-users",
        label: "دسترسی عمومی کاربران",
        description: "تنظیم دسترسی‌های کلی و عمومی برای گروه‌های کاربری.",
        icon: <TeamOutlined className="text-2xl text-rose-600"/>
    },
];

const ManagementCard = ({item}) => (
    <NavLink
        to={item.path}
        className="group flex flex-col justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-sky-500 transition-all duration-300 transform hover:-translate-y-1"
    >
        <div>
            <div className="mb-4">
                <div
                    className="w-12 h-12 flex items-center justify-center rounded-lg bg-slate-100 group-hover:bg-sky-100 transition-colors duration-300">
                    {item.icon}
                </div>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">{item.label}</h2>
            <p className="text-sm text-slate-500">{item.description}</p>
        </div>
        <div
            className="mt-6 text-sm font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            ورود به بخش
        </div>
    </NavLink>
);


function SystemManagement() {
    return (
        <div className="bg-slate-50 min-h-full p-4 sm:p-6 lg:p-8 h-screen" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <NavLink to="/" className="text-sm text-slate-600 hover:text-sky-700 flex items-center gap-2 mb-4">
                        <ArrowRightOutlined/>
                        بازگشت به صفحه اصلی
                    </NavLink>
                    <h1 className="text-3xl font-bold text-slate-900">مدیریت سیستم</h1>
                    <p className="mt-2 text-base text-slate-600">
                        از این بخش می‌توانید کاربران، سمت‌ها و دسترسی‌های مختلف سیستم را مدیریت کنید.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {managementItems.map((item) => (
                        <ManagementCard key={item.path} item={item}/>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SystemManagement;