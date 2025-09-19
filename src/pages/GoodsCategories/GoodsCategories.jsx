import {useEffect, useRef, useState} from "react";
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
import DetailAccessProduct from "@/pages/SystemManagement/DetailAccessProduct/DetailAccessProduct.jsx";

const GoodsCategories = () => {
    const [activeTab, setActiveTab] = useState('1');
    const [indicatorStyle, setIndicatorStyle] = useState({width: 0, left: 0});
    const tabsContainerRef = useRef(null);
    const tabRefs = useRef([]);

    const tabs = [
        {
            id: '1',
            label: "معرفی و مشخصات",
            icon: <AppstoreOutlined/>,
            content: <Introduction/>,
            color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200"
        },
        {
            id: '2',
            label: "ردیابی محصول",
            icon: <EyeOutlined/>,
            content: <ProductTracking/>,
            color: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200"
        },
        {
            id: '3',
            label: "اسناد و لاگ ها",
            icon: <FileTextOutlined/>,
            content: <ProductDocuments/>,
            color: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200"
        },
        {
            id: '4',
            label: "الزامات و وابستگی ها",
            icon: <LinkOutlined/>,
            content: <ProductRequirement/>,
            color: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-200"
        },
        {
            id: '5',
            label: "تجارب و خرابی",
            icon: <ToolOutlined/>,
            content: <Experience/>,
            color: "bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 border border-rose-200"
        },
        {
            id: '6',
            label: "خرید",
            icon: <ShoppingOutlined/>,
            content: <ProductPurchase/>,
            color: "bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-200"
        },
        {
            id: '7',
            label: "درخواست کالا از انبار",
            icon: <InboxOutlined/>,
            content: <RequestOfWarehouse/>,
            color: "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border border-pink-200"
        },
        {
            id: '8',
            label: "صورت جلسات",
            icon: <TeamOutlined/>,
            content: <Meetings/>,
            color: "bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 border border-teal-200"
        },
        {
            id: '9',
            label: "فعالیت ها",
            icon: <BarChartOutlined/>,
            content: <Activity/>,
            color: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-200"
        },
        {
            id: '10',
            label: "گزارش ها",
            icon: <AuditOutlined/>,
            content: <Reports/>,
            color: "bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border border-cyan-200"
        },
        {
            id: '11',
            label: "توزیع نقش ها",
            icon: <SafetyCertificateOutlined/>,
            content: <DetailAccessProduct/>,
            color: "bg-gradient-to-r from-lime-100 to-lime-200 text-lime-800 border border-lime-200"
        }
    ];

    const updateIndicator = (tabId) => {
        const index = tabs.findIndex(tab => tab.id === tabId);
        if (tabRefs.current[index] && tabsContainerRef.current) {
            const tabElement = tabRefs.current[index];
            const containerElement = tabsContainerRef.current;

            const tabRect = tabElement.getBoundingClientRect();
            const containerRect = containerElement.getBoundingClientRect();

            const left = tabRect.left - containerRect.left;
            const width = tabRect.width;

            setIndicatorStyle({
                left: `${left}px`,
                width: `${width}px`,
                opacity: 1
            });
        }
    };

    useEffect(() => {
        updateIndicator(activeTab);

        const handleResize = () => {
            updateIndicator(activeTab);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeTab]);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <div className="w-full flex flex-col rounded-xl overflow-hidden shadow-lg bg-white">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-5 text-slate-800 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-700">مدیریت سیستم و یکپارچه سازی روال ها </h1>
                <p className="text-slate-600 mt-1">مدیریت جامع اطلاعات محصولات</p>
            </div>

            <div className="relative border-b border-gray-200 bg-gray-50" ref={tabsContainerRef}>
                <div className="flex overflow-x-auto scrollbar-hide py-3 px-4">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            ref={el => tabRefs.current[index] = el}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex-shrink-0 flex items-center px-4 py-2.5 mx-1 rounded-lg transition-all duration-300 ${
                                activeTab === tab.id
                                    ? `${tab.color} shadow-sm font-medium`
                                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                        >
                            <span className="ml-2">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div
                    className="absolute bottom-0 h-0.5 bg-blue-400 transition-all duration-300"
                    style={{
                        ...indicatorStyle,
                        transitionProperty: 'left, width',
                        transitionDuration: '300ms',
                        transitionTimingFunction: 'ease-out'
                    }}
                />
            </div>

            <div className="p-6 bg-slate-50 min-h-[500px]">
                {tabs.find(tab => tab.id === activeTab)?.content}
            </div>
        </div>
    );
};

export default GoodsCategories;