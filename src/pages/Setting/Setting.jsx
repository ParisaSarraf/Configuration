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
    GlobalOutlined,
    SyncOutlined,
    TagsOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import ReasonsEditing from './components/ReasonsEditing/ReasonsEditing';

const Setting = () => {
    const navigate = useNavigate();

    const settingItems = [
        {
            label: "پوشش",
            key: '1',
            icon: <TagsOutlined/>,
            children: <Casing/>,
            colorScheme: {
                active: 'bg-teal-50 text-teal-700 font-semibold',
                inactive: 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
            }
        },
        {
            label: `هویت`,
            key: '2',
            icon: <UserOutlined/>,
            children: <Personality/>,
            colorScheme: {
                active: 'bg-sky-50 text-sky-700 font-semibold',
                inactive: 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
            }
        },
        {
            label: `جنس`,
            key: '3',
            icon: <AppstoreOutlined/>,
            children: <Genus/>,
            colorScheme: {
                active: 'bg-violet-50 text-violet-700 font-semibold',
                inactive: 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
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
        },   {
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
                active: 'bg-rose-50 text-rose-700 font-semibold',
                inactive: 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
            }
        },
        {
            label: `الزامات`,
            key: '7',
            icon: <CheckSquareOutlined/>,
            children: <Requirement/>,
            colorScheme: {
                active: 'bg-lime-50 text-lime-700 font-semibold',
                inactive: 'text-slate-600 hover:bg-lime-50 hover:text-lime-700'
            }
        },
        {
            label: `پیمانکاران/کارفرمایان`,
            key: '8',
            icon: <TeamOutlined/>,
            children: <Contractor/>,
            colorScheme: {
                active: 'bg-cyan-50 text-cyan-700 font-semibold',
                inactive: 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
            }
        },
        {
            label: `دلایل ویرایش نسخه`,
            key: '9',
            icon: <TeamOutlined/>,
            children: <ReasonsEditing/>,
            colorScheme: {
                active: 'bg-cyan-50 text-stone-700 font-semibold',
                inactive: 'text-stone-600 hover:bg-stone-50 hover:text-stone-700'
            }
        },
    ];

    const [activeKey, setActiveKey] = useState(settingItems[0].key);
    const activeComponent = settingItems.find(item => item.key === activeKey)?.children;

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8" dir="rtl">
            <div className="max-w-screen-2xl mx-auto">
                <header className="mb-8">
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined/>}
                        onClick={() => navigate("/")}
                        className="flex items-center text-slate-600 hover:!text-sky-700 mb-4"
                    >
                        بازگشت به صفحه اصلی
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">تنظیمات داده‌های پایه</h1>
                        <p className="mt-2 text-base text-slate-600">
                            در این بخش می‌توانید اطلاعات پایه‌ای و تنظیمات کلی سیستم را مدیریت کنید.
                        </p>
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="md:col-span-1 bg-white rounded-xl shadow-lg border border-slate-200 p-4 h-fit">
                        <ul className="space-y-1">
                            {settingItems.map(item => (
                                <li key={item.key}>
                                    <button
                                        onClick={() => setActiveKey(item.key)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-right transition-colors duration-200 ${
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
                        className="md:col-span-3 lg:col-span-4 bg-white rounded-xl shadow-lg border border-slate-200 min-h-[60vh]">
                        <div className="p-6">
                            {activeComponent}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Setting;