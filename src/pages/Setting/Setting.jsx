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
    SettingOutlined,
    SyncOutlined,
    TagsOutlined,
    TeamOutlined,
    UserOutlined,
} from '@ant-design/icons';

const Setting = () => {
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState('1');
    const [isRadialMenuOpen, setIsRadialMenuOpen] = useState(false);

    const neonColor = 'text-Neon-Primary';
    const primaryTextColor = 'text-white';
    const secondaryTextColor = 'text-white';

    const RADIAL_DISTANCE = 100;

    const calculateRadialPosition = (index, totalItems, distance) => {
        const startAngle = 60;
        const endAngle = -150;
        const angle = startAngle + (index / (totalItems - 1)) * (endAngle - startAngle);

        const radians = angle * (Math.PI / 260);

        const x = distance * Math.cos(radians);
        const y = distance * Math.sin(radians);

        return {
            transform: `translate(${x}px, ${-y}px)`,
        };
    };


    const settingItems = [
        {label: "پوشش", key: '1', icon: <TagsOutlined/>, children: <Casing/>, color: 'text-rose-400'},
        {label: `هویت`, key: '2', icon: <UserOutlined/>, children: <Personality/>, color: 'text-sky-400'},
        {label: `جنس`, key: '3', icon: <AppstoreOutlined/>, children: <Genus/>, color: 'text-violet-400'},
        {label: `حوزه`, key: '4', icon: <GlobalOutlined/>, children: <Precinct/>, color: 'text-emerald-400'},
        {label: `چرخه عمر`, key: '5', icon: <SyncOutlined/>, children: <LifeCycle/>, color: 'text-amber-400'},
        {label: `اسناد`, key: '6', icon: <FileTextOutlined/>, children: <Documents/>, color: 'text-pink-400'},
        {label: `الزامات`, key: '7', icon: <CheckSquareOutlined/>, children: <Requirement/>, color: 'text-lime-400'},
        {label: `پیمانکاران`, key: '8', icon: <TeamOutlined/>, children: <Contractor/>, color: 'text-cyan-400'},
    ];

    const activeComponent = settingItems.find(item => item.key === activeKey)?.children;

    const handleItemClick = (key) => {
        setActiveKey(key);
        setIsRadialMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-dark-primary p-4 sm:p-6 lg:p-8" dir="rtl">
            <div className="max-w-screen-3xl mx-auto">
                <header className="mb-8">
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined className={neonColor}/>}
                        onClick={() => navigate("/")}
                        className={`flex items-center ${secondaryTextColor} hover:!text-Neon-Primary mb-4`}
                    >
                        بازگشت به صفحه اصلی
                    </Button>
                    <div>
                        <h1 className={`p-4 text-3xl font-bold ${primaryTextColor}`}>تنظیمات</h1>

                    </div>
                </header>

                <main className="relative">

                    <div
                        className="AeroBox rounded-2xl min-h-[60vh] border-b-0"
                    >
                        <div className="p-6">
                            {activeComponent}
                        </div>
                    </div>

                    <div className="fixed top-20 left-8 z-50">
                        {settingItems.map((item, index) => {
                            const totalItems = settingItems.length;
                            const position = calculateRadialPosition(index, totalItems, RADIAL_DISTANCE);

                            return (
                                <button
                                    key={item.key}
                                    onClick={() => handleItemClick(item.key)}
                                    className={`
                                        absolute w-12 h-12 rounded-full AeroBox flex items-center justify-center text-xl 
                                        transition-all duration-300 shadow-xl 
                                        ${item.color} ${activeKey === item.key ? 'bg-Neon-Primary/30 border-Neon-Primary' : 'border-transparent'}
                                        ${isRadialMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}
                                    `}
                                    style={{
                                        top: '0px',
                                        left: '0px',
                                        transform: isRadialMenuOpen ? position.transform : 'translate(0, 0)',
                                        transitionDelay: `${index * 0.05}s`,
                                    }}
                                    title={item.label}
                                >
                                    {item.icon}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setIsRadialMenuOpen(!isRadialMenuOpen)}
                            className="relative w-14 h-14 rounded-full NeonButton flex items-center justify-center text-2xl z-50 shadow-2xl hover:scale-105"
                            title="تنظیمات"
                        >
                            <SettingOutlined/>
                        </button>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default Setting;