import {useEffect, useState} from "react";
import {
    AppstoreOutlined,
    AuditOutlined,
    BarChartOutlined,
    EyeOutlined,
    FileTextOutlined,
    InboxOutlined,
    LinkOutlined,
    SafetyCertificateOutlined,
    ShoppingOutlined,
    TeamOutlined,
    ToolOutlined
} from "@ant-design/icons";
import Introduction from "../Introduction/Introduction";
import ProductTracking from "../ProductTracking/ProductTracking";
import Experience from "../Experience/Experience";
import ProductRequirement from "../ProductRequirement/ProductRequirement";
import ProductPurchase from "../productPurchase/ProductPurchase";
import RequestOfWarehouse from "@/pages/RequestOfWarehouse/RequestOfWarehouse.jsx";
import Meetings from "@/pages/Meetings/Meetings.jsx";
import Activity from "@/pages/Activity/Activity.jsx";
import ProductDocuments from "../ProductDocument/ProductDocuments";
import Reports from "@/pages/Reports/Reports.jsx";
import DetailAccessProduct from "../SystemManagement/DetailAccessProduct/DetailAccessProduct.jsx";

const GoodsCategories = () => {
    const [activeTab, setActiveTab] = useState('1');

    const neonColor = 'text-Neon-Primary';

    const tabs = [
        {id: '1', label: "معرفی و مشخصات", icon: <AppstoreOutlined/>, content: <Introduction/>},
        {id: '2', label: "ردیابی محصول", icon: <EyeOutlined/>, content: <ProductTracking/>},
        {id: '3', label: "اسناد و لاگ ها", icon: <FileTextOutlined/>, content: <ProductDocuments/>},
        {id: '4', label: "الزامات و وابستگی ها", icon: <LinkOutlined/>, content: <ProductRequirement/>},
        {id: '5', label: "تجارب و خرابی", icon: <ToolOutlined/>, content: <Experience/>},
        {id: '6', label: "خرید", icon: <ShoppingOutlined/>, content: <ProductPurchase/>},
        {id: '7', label: "درخواست کالا از انبار", icon: <InboxOutlined/>, content: <RequestOfWarehouse/>},
        {id: '8', label: "صورت جلسات", icon: <TeamOutlined/>, content: <Meetings/>},
        {id: '9', label: "فعالیت ها", icon: <BarChartOutlined/>, content: <Activity/>},
        {id: '10', label: "گزارش ها", icon: <AuditOutlined/>, content: <Reports/>},
        {id: '11', label: "توزیع نقش ها", icon: <SafetyCertificateOutlined/>, content: <DetailAccessProduct/>},
    ];

    useEffect(() => {
    }, [activeTab]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <div className="w-full flex rounded-2xl overflow-hidden shadow-2xl AeroBox min-h-[600px]">

            <div
                className="flex flex-col items-center py-4 border-l border-Neon-Primary/20 overflow-y-auto"
                style={{width: '64px', backgroundColor: 'rgba(27, 23, 37, 0.4)'}}
            >
                {tabs.map((tab) => (
                    <div className="relative group w-full flex justify-center" key={tab.id}>
                        <button
                            onClick={() => handleTabClick(tab.id)}
                            className={`
                                flex items-center justify-center w-12 h-12 my-2 rounded-xl text-xl 
                                transition-all duration-300 relative
                                ${activeTab === tab.id ? 'bg-Neon-Primary/20' : 'text-dark-text-secondary hover:bg-dark-secondary/50'}
                            `}
                        >
                            <span className={`${activeTab === tab.id ? neonColor : ''}`}>
                                {tab.icon}
                            </span>

                            {activeTab === tab.id && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 rounded-full bg-Neon-Primary"></div>
                            )}
                        </button>
                        <span
                            className={`
                                absolute right-full top-1/2 transform -translate-y-1/2 mr-3 
                                px-3 py-1 rounded-lg whitespace-nowrap text-sm font-medium
                                transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:mr-2 
                                ${activeTab === tab.id ? 'opacity-100 mr-2 bg-Neon-Primary text-dark-primary' : 'bg-dark-secondary/90 text-dark-text-primary'}
                            `}
                            style={{
                                zIndex: 10,
                                pointerEvents: 'none'
                            }}
                        >
                            {tab.label}
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex-1 flex flex-col p-0">
                <div className="flex-1 p-6 bg-dark-primary/50 overflow-y-auto">
                    {tabs.find(tab => tab.id === activeTab)?.content}
                </div>
            </div>
        </div>
    );
};

export default GoodsCategories;