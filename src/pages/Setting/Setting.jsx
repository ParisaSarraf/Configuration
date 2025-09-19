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

const Setting = () => {
    const navigate = useNavigate();

    const settingItems = [
        {
            label: "پوشش",
            key: '1',
            icon: <TagsOutlined/>,
            children: <Casing/>,
        },
        {
            label: `هویت`,
            key: '2',
            icon: <UserOutlined/>,
            children: <Personality/>,
        },
        {
            label: `جنس`,
            key: '3',
            icon: <AppstoreOutlined/>,
            children: <Genus/>,
        },
        {
            label: `حوزه`,
            key: '4',
            icon: <GlobalOutlined/>,
            children: <Precinct/>,
        },
        {
            label: `چرخه عمر`,
            key: '5',
            icon: <SyncOutlined/>,
            children: <LifeCycle/>,
        },
        {
            label: `اسناد و مدارک`,
            key: '6',
            icon: <FileTextOutlined/>,
            children: <Documents/>,
        },
        {
            label: `الزامات`,
            key: '7',
            icon: <CheckSquareOutlined/>,
            children: <Requirement/>,
        },
        {
            label: `پیمانکاران/کارفرمایان`,
            key: '8',
            icon: <TeamOutlined/>,
            children: <Contractor/>,
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
                                                ? 'bg-sky-100 text-sky-700 font-semibold'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        {item.icon}
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