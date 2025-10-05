import {useState} from "react";
import Header from "@/components/Layouts/Header.jsx";
import MyActivities from "@/pages/MyWork/MyActivities/MyActivities.jsx";
import MyDocuments from "@/pages/MyWork/MyDocuments/MyDocuments.jsx";
import MyPlan from "@/pages/MyWork/MyPlan/MyPlan.jsx";
import {ArrowRightOutlined, CheckCircleOutlined, FileDoneOutlined, HistoryOutlined} from "@ant-design/icons";
import {Button} from "antd";
import {useNavigate} from "react-router-dom";


const MyWork = () => {
    const navigate = useNavigate();

    const neonColor = 'text-Neon-Primary';
    const secondaryTextColor = 'text-dark-text-secondary';

    const items = [
        {
            label: "فعالیت‌های من",
            key: '1',
            icon: <HistoryOutlined/>,
            children: <MyActivities/>,
            color: 'text-rose-400',
        },
        {
            label: "اسناد باقیمانده",
            key: '2',
            icon: <FileDoneOutlined/>,
            children: <MyDocuments/>,
            color: 'text-sky-400',
        },
        {
            label: "کارهای من",
            key: '3',
            icon: <CheckCircleOutlined/>,
            children: <MyPlan/>,
            color: 'text-lime-400',
        }
    ];

    const [activeKey, setActiveKey] = useState(items[0].key);
    const activeComponent = items.find(item => item.key === activeKey)?.children;

    return (
        <div className="min-h-screen bg-dark-primary" dir="rtl">
            <Header/>

            <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative">

                <header className="flex flex-col mb-8">
                    <Button
                        type="text"
                        icon={<ArrowRightOutlined className={neonColor}/>}
                        onClick={() => navigate("/")}
                        className={`flex items-center ${secondaryTextColor} hover:!text-Neon-Primary mb-4`}
                    >
                        بازگشت به صفحه اصلی
                    </Button>

                </header>

                <div className="fixed top-4 right-16 left-16 z-50 flex justify-center pointer-events-none">
                    <div
                        className="flex items-center gap-4 AeroBox p-2 rounded-full pointer-events-auto shadow-2xl border-Neon-Primary/20">

                        {items.map(item => (
                            <button
                                key={item.key}
                                onClick={() => setActiveKey(item.key)}
                                title={item.label}
                                className={`
                                    flex items-center justify-center 
                                    w-14 h-14 rounded-full text-xl 
                                    transition-all duration-300 relative
                                    ${activeKey === item.key
                                    ? `bg-Neon-Primary/40 ${item.color} shadow-lg scale-105 border border-Neon-Primary`
                                    : `bg-dark-secondary/50 ${secondaryTextColor} hover:bg-dark-secondary/80`
                                }
                                `}
                            >
                                <span
                                    className={activeKey === item.key ? item.color : secondaryTextColor}>{item.icon}</span>

                                {activeKey === item.key && (
                                    <span
                                        className={`absolute bottom-[-20px] text-xs font-semibold whitespace-nowrap px-2 py-0.5 rounded ${neonColor} bg-dark-secondary/80`}
                                        style={{textShadow: '0 0 5px rgba(195, 123, 245, 0.4)'}}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <main className="AeroBox rounded-2xl border border-Neon-Primary/20 min-h-[60vh] p-6">
                    {activeComponent}
                </main>
            </div>
        </div>
    );
};

export default MyWork;