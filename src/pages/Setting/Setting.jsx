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
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        },
        {
            label: `هویت`,
            key: '2',
            icon: <UserOutlined/>,
            children: <Personality/>,
            colorScheme: {
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        },
        {
            label: `ماده اولیه`,
            key: '3',
            icon: <AppstoreOutlined/>,
            children: <Genus/>,
            colorScheme: {
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        },
        {
            label: `چرخه عمر`,
            key: '5',
            icon: <SyncOutlined/>,
            children: <LifeCycle/>,
            colorScheme: {
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        }, {
            label: `حوزه`,
            key: '4',
            icon: <GlobalOutlined/>,
            children: <Precinct/>,
            colorScheme: {
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        },

        {
            label: `اسناد و مدارک`,
            key: '6',
            icon: <FileTextOutlined/>,
            children: <Documents/>,
            colorScheme: {
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        },
        {
            label: `الزامات`,
            key: '7',
            icon: <CheckSquareOutlined/>,
            children: <Requirement/>,
            colorScheme: {
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        },
        {
            label: `پیمانکاران/کارفرمایان`,
            key: '8',
            icon: <TeamOutlined/>,
            children: <Contractor/>,
            colorScheme: {
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        },
        {
            label: `دلایل ویرایش نسخه`,
            key: '9',
            icon: <FormOutlined/>,
            children: <ReasonsEditing/>,
            colorScheme: {
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        },
        {
            label: `مهندسی سیستم`,
            key: '10',
            icon: <ToolOutlined/>,
            children: <SystemEngineer/>,
            colorScheme: {
                active: 'theme-accent-soft theme-accent font-semibold',
                inactive: 'theme-muted hover:theme-accent-soft hover:theme-accent'
            }
        },
    ];

    const [activeKey, setActiveKey] = useState(settingItems[0].key);
    const activeComponent = settingItems.find(item => item.key === activeKey)?.children;

    return (
        <div className="system-management-page min-h-screen theme-canvas p-4 sm:p-6 lg:p-8" dir="rtl">
            <div className="max-w-screen-2xl mx-auto">
                <header className="themed-page-header mb-8">
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined/>}
                        onClick={() => navigate("/")}
                        className="flex items-center theme-muted hover:!theme-accent mb-4"
                    >
                        بازگشت به صفحه اصلی
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold theme-text">تنظیمات داده‌های پایه</h1>
                        <p className="mt-2 text-base theme-muted">
                            در این بخش می‌توانید اطلاعات پایه‌ای و تنظیمات کلی سیستم را مدیریت کنید.
                        </p>
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    <div className="md:col-span-1 theme-surface rounded-xl shadow-lg border theme-border p-4 h-fit">
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
                        className="md:col-span-3 lg:col-span-4 theme-surface rounded-xl shadow-lg border theme-border min-h-[60vh]">
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