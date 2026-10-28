import { NavLink } from "react-router-dom";
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  ProductOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

const managementItems = [
  {
    path: "/panel/system-management/user",
    label: "مدیریت کاربران",
    description: "افزودن، ویرایش و مدیریت پروفایل کاربران سیستم.",
    icon: <UserOutlined className="text-2xl theme-accent" />,
  },
  {
    path: "/panel/system-management/roles-permission",
    label: "مدیریت سمت‌ها و مجوزها",
    description: "ایجاد و تخصیص سطوح دسترسی و مجوزهای مختلف.",
    icon: <SafetyCertificateOutlined className="text-2xl theme-accent" />,
  },
  {
    path: "/panel/system-management/roles-life-cycle",
    label: "دسترسی چرخه عمر",
    description: "مدیریت دسترسی کاربران به مراحل مختلف چرخه عمر محصول.",
    icon: <ApartmentOutlined className="text-2xl theme-accent" />,
  },
  {
    path: "/panel/system-management/roles-users-product",
    label: "دسترسی کاربران به محصول",
    description: "تخصیص یا لغو دسترسی کاربران به محصولات خاص.",
    icon: <SolutionOutlined className="text-2xl theme-accent" />,
  },
  {
    path: "/panel/system-management/roles-users",
    label: "دسترسی عمومی کاربران",
    description: "تنظیم دسترسی‌های کلی و عمومی برای گروه‌های کاربری.",
    icon: <TeamOutlined className="text-2xl theme-accent" />,
  },
  {
    path: "/panel/system-management/users-performance",
    label: "عملکرد کاربران",
    description: "نمایش و ارزیابی عملکرد کاربران در سیستم.",
    icon: <UsergroupAddOutlined className="text-2xl theme-accent" />,
  },
  {
    path: "/panel/system-management/manage-product",
    label: "مدیریت محصولات",
    description: "مدیریت محصولات در درختواره محصولات.",
    icon: <ProductOutlined className="text-2xl theme-accent" />,
  },
];

const ManagementCard = ({ item }) => (
  <NavLink
    to={item.path}
    className="group flex flex-col justify-between theme-surface p-6 rounded-xl border theme-border shadow-sm hover:shadow-xl hover:theme-accent-border transition-all duration-300 transform hover:-translate-y-1"
  >
    <div>
      <div className="mb-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg theme-panel group-hover:theme-accent-soft transition-colors duration-300">
          {item.icon}
        </div>
      </div>
      <h2 className="text-lg font-semibold theme-text mb-2">
        {item.label}
      </h2>
      <p className="text-sm theme-muted">{item.description}</p>
    </div>
    <div className="mt-6 text-sm font-semibold theme-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      ورود به بخش
    </div>
  </NavLink>
);

function SystemManagement() {
  return (
    <div
      className="system-management-page theme-canvas min-h-full p-4 sm:p-6 lg:p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        <header className="themed-page-header mb-8">
          <NavLink
            to="/"
            className="text-sm theme-muted hover:theme-accent flex items-center gap-2 mb-4"
          >
            <ArrowRightOutlined />
            بازگشت به صفحه اصلی
          </NavLink>
          <h1 className="text-3xl font-bold theme-text">مدیریت سیستم</h1>
          <p className="mt-2 text-base theme-muted">
            از این بخش می‌توانید کاربران، سمت‌ها و دسترسی‌های مختلف سیستم را
            مدیریت کنید.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementItems.map((item) => (
            <ManagementCard key={item.path} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SystemManagement;
