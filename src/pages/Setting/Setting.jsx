import {useState} from 'react';
import {Button} from 'antd';
import {useNavigate} from 'react-router-dom';
import Genus from './components/Genus';
import Personality from './components/Personality';
import Casing from './components/Casing';
import Precinct from './components/Precinct';
import LifeCycle from './components/LifeCycle';
import Documents from '../Documents/Documents';
import Requirement from '../Requirement/Requirement';
import Contractor from './components/Contractor';
import {
 AppstoreOutlined,
 ArrowRightOutlined,
 CheckSquareOutlined,
 FileTextOutlined,
 FormOutlined,
 GlobalOutlined,
 SyncOutlined,
 TagsOutlined,
 TeamOutlined,
 ToolOutlined,
 UserOutlined
} from '@ant-design/icons';
import ReasonsEditing from './components/ReasonsEditing/ReasonsEditing';
import SystemEngineer from "@/pages/SystemEngineer/SystemEngineer.jsx";

const Setting = () => {
 const navigate = useNavigate();

 const settingItems = [
 {
 label: "پوشش",
 key: '1',
 icon: <TagsOutlined/>,
 children: <Casing/>,
 colorScheme: {
 active: 'bg-blue-50 text-blue-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
 }
 },
 {
 label: `هویت`,
 key: '2',
 icon: <UserOutlined/>,
 children: <Personality/>,
 colorScheme: {
 active: 'bg-blue-50 text-blue-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
 }
 },
 {
 label: `ماده اولیه`,
 key: '3',
 icon: <AppstoreOutlined/>,
 children: <Genus/>,
 colorScheme: {
 active: 'bg-blue-50 text-blue-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
 }
 },
 {
 label: `چرخه عمر`,
 key: '5',
 icon: <SyncOutlined/>,
 children: <LifeCycle/>,
 colorScheme: {
 active: 'bg-amber-50 text-amber-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
 }
 }, {
 label: `حوزه`,
 key: '4',
 icon: <GlobalOutlined/>,
 children: <Precinct/>,
 colorScheme: {
 active: 'bg-emerald-50 text-emerald-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
 }
 },

 {
 label: `اسناد و مدارک`,
 key: '6',
 icon: <FileTextOutlined/>,
 children: <Documents/>,
 colorScheme: {
 active: 'bg-red-50 text-red-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-red-50 hover:text-red-700'
 }
 },
 {
 label: `الزامات`,
 key: '7',
 icon: <CheckSquareOutlined/>,
 children: <Requirement/>,
 colorScheme: {
 active: 'bg-emerald-50 text-emerald-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
 }
 },
 {
 label: `پیمانکاران/کارفرمایان`,
 key: '8',
 icon: <TeamOutlined/>,
 children: <Contractor/>,
 colorScheme: {
 active: 'bg-blue-50 text-blue-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
 }
 },
 {
 label: `دلایل ویرایش نسخه`,
 key: '9',
 icon: <FormOutlined/>,
 children: <ReasonsEditing/>,
 colorScheme: {
 active: 'bg-blue-50 text-slate-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'
 }
 },
 {
 label: `مهندسی سیستم`,
 key: '10',
 icon: <ToolOutlined/>,
 children: <SystemEngineer/>,
 colorScheme: {
 active: 'bg-red-50 text-red-700 font-semibold',
 inactive: 'text-slate-600 hover:bg-red-50 hover:text-red-700'
 }
 },
 ];

 const [activeKey, setActiveKey] = useState(settingItems[0].key);
 const activeComponent = settingItems.find(item => item.key === activeKey)?.children;

 return (
 <div className="system-page min-h-screen p-3 sm:p-5 lg:p-7" dir="rtl">
 <div className="max-w-screen-2xl mx-auto">
 <header className="page-heading mb-5">
 <Button
 type="text"
 icon={<ArrowRightOutlined/>}
 onClick={() => navigate("/")}
 className="flex items-center text-slate-600 hover:!text-blue-700 mb-4"
 >
 بازگشت به صفحه اصلی
 </Button>
 <div className="page-hero">
 <span className="section-eyebrow">پیکربندی سامانه</span>
 <h1 className="text-2xl font-extrabold text-slate-900">تنظیمات داده‌های پایه</h1>
 <p className="mt-2 text-sm text-slate-500">
 در این بخش می‌توانید اطلاعات پایه‌ای و تنظیمات کلی سیستم را مدیریت کنید.
 </p>
 </div>
 </header>

 <main className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
 <div className="settings-nav md:col-span-1 bg-white rounded-xl border border-slate-200 p-2 h-fit">
 <ul className="space-y-1">
 {settingItems.map(item => (
 <li key={item.key}>
 <button
 onClick={() => setActiveKey(item.key)}
 className={`settings-nav__item w-full flex items-center gap-3 p-2.5 rounded-lg text-right transition-colors duration-200 ${
 activeKey === item.key
 ? item.colorScheme.active
 : item.colorScheme.inactive
 }`}
 >
 <span className="text-lg">{item.icon}</span>
 <span>{item.label}</span>
 </button>
 </li>
 ))}
 </ul>
 </div>

 <div
 className="settings-content md:col-span-3 lg:col-span-4 bg-white rounded-xl border border-slate-200 min-h-[60vh]">
 <div className="p-3 sm:p-5">
 {activeComponent}
 </div>
 </div>
 </main>
 </div>
 </div>
 );
};

export default Setting;
