import {Card, ConfigProvider, Tabs} from "antd";
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

const GoodsCategories = () => {
    const items = [
        {
            label: "معرفی و مشخصات",
            key: '1',
            children: <Introduction/>,
        },
        {
            label: `ردیابی محصول`,
            key: '2',
            children: <ProductTracking/>,
        },
        {
            label: `اسناد و لاگ ها`,
            key: '3',
            children: <ProductDocuments/>,
        },
        {
            label: `الزامات و وابستگی ها`,
            key: '4',
            children: <ProductRequirement/>,
        },
        {
            label: `تجارب و خرابی`,
            key: '5',
            children: <Experience/>,
        },
        {
            label: `خرید`,
            key: '6',
            children: <ProductPurchase/>
        }, {
            label: `درخواست کالا از انبار`,
            key: '7',
            children: <RequestOfWarehouse/>
        }, {
            label: `صورت جلسات`,
            key: '8',
            children: <Meetings/>
        }, {
            label: `فعالیت ها`,
            key: '9',
            children: <Activity/>
        }, {
            label: `گزارش ها`,
            key: '10',
            children: <Reports/>
        }
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                },
                components: {
                    Tabs: {
                        cardBg: '#f0f2f5'
                    }
                }
            }}
        >
            <Card className="w-full flex flex-col" bodyStyle={{padding: 10}}>
                <Tabs
                    type="card"
                    items={items}
                    tabBarStyle={{
                        overflowX: 'auto',
                        flexWrap: 'nowrap',
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                    }}
                    className="hide-scrollbar"
                />
            </Card>
        </ConfigProvider>
    );
};

export default GoodsCategories;
