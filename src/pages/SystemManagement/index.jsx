import {NavLink} from "react-router-dom";
import {
    ApartmentOutlined,
    ArrowRightOutlined,
    SafetyCertificateOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined
} from "@ant-design/icons";


const neonColor = 'text-Neon-Primary';
const secondaryTextColor = 'text-dark-text-secondary';
const cardBg = 'bg-dark-secondary/70';


const managementItems = [
    {
        path: "/panel/system-management/user",
        label: "مدیریت کاربران",
        description: "افزودن، ویرایش و مدیریت پروفایل کاربران سیستم.",
        icon: <UserOutlined className="text-2xl"/>,
        glowColor: 'shadow-[0_0_20px_rgba(99,102,241,0.7)]',
        iconColor: 'text-sky-400'
    },
    {
        path: "/panel/system-management/roles-permission",
        label: "مدیریت سمت‌ها و مجوزها",
        description: "ایجاد و تخصیص سطوح دسترسی و مجوزهای مختلف.",
        icon: <SafetyCertificateOutlined className="text-2xl"/>,
        glowColor: 'shadow-[0_0_20px_rgba(195,123,245,0.8)]',
        iconColor: 'text-violet-400'
    },
    {
        path: "/panel/system-management/roles-life-cycle",
        label: "دسترسی چرخه عمر",
        description: "مدیریت دسترسی کاربران به مراحل مختلف چرخه عمر محصول.",
        icon: <ApartmentOutlined className="text-2xl"/>,
        glowColor: 'shadow-[0_0_20px_rgba(6,182,212,0.7)]',
        iconColor: 'text-teal-400'
    },
    {
        path: "/panel/system-management/roles-users-product",
        label: "دسترسی کاربران به محصول",
        description: "تخصیص یا لغو دسترسی کاربران به محصولات خاص.",
        icon: <SolutionOutlined className="text-2xl"/>,
        glowColor: 'shadow-[0_0_20px_rgba(251,191,36,0.7)]',
        iconColor: 'text-amber-400'
    },
    {
        path: "/panel/system-management/roles-users",
        label: "دسترسی عمومی کاربران",
        description: "تنظیم دسترسی‌های کلی و عمومی برای گروه‌های کاربری.",
        icon: <TeamOutlined className="text-2xl"/>,
        glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.7)]',
        iconColor: 'text-rose-400'
    },
];

const ManagementCard = ({item}) => (
    <NavLink
        to={item.path}
        className={`AeroBox group flex flex-col justify-between p-6 border border-Neon-Primary/10 
                    ${cardBg} transition-all duration-300 relative z-10 text-white 
                    
                    /* افکت برش‌خورده (نامتقارن) */
                    rounded-tl-3xl rounded-br-3xl rounded-tr-lg rounded-bl-lg
                    
                    /* افکت سه‌بعدی و Glow در هاور */
                    hover:scale-[1.03] hover:border-Neon-Primary/60 ${item.glowColor} hover:shadow-2xl`}
        style={{
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.7)',
        }}
    >
        <div>
            <div className="mb-4">
                <div
                    className={`w-14 h-14 flex items-center justify-center rounded-lg 
                                bg-dark-primary/60 transition-colors duration-300 border border-Neon-Primary/20 
                                shadow-inner shadow-Neon-Primary/20`}
                >
                    <span className={`text-3xl ${item.iconColor}`}>
                        {item.icon}
                    </span>
                </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{item.label}</h2>
            <p className={`text-sm ${secondaryTextColor}`}>{item.description}</p>
        </div>
        <div
            className={`mt-6 text-sm font-semibold ${item.iconColor} opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1`}
        >
            ورود به بخش <ArrowRightOutlined className="rotate-180"/>
        </div>
    </NavLink>
);


function SystemManagement() {
    return (
        <div className="bg-dark-primary min-h-full p-4 sm:p-6 lg:p-8 h-screen" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <NavLink to="/"
                             className={`text-sm text-white hover:!text-Neon-Primary flex items-center gap-2 mb-4`}>
                        <ArrowRightOutlined className={neonColor}/>
                        بازگشت به صفحه اصلی
                    </NavLink>
                    <h1 className="text-3xl font-bold text-white">مدیریت سیستم</h1>
                    <p className={`mt-2 text-base ${secondaryTextColor}`}>
                        این بخش به شما امکان می‌دهد تا پارامترهای اصلی و دسترسی‌های کاربران سیستم را پیکربندی کنید.
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