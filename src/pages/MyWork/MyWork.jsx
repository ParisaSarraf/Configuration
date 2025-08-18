import {Button, Card, Tabs} from "antd";
import {useNavigate} from "react-router-dom";
import Header from "@/components/Layouts/Header.jsx";
import MyActivities from "@/pages/MyWork/MyActivities/MyActivities.jsx";
import MyDocuments from "@/pages/MyWork/MyDocuments/MyDocuments.jsx";
import MyPlan from "@/pages/MyWork/MyPlan/MyPlan.jsx";

const MyWork = () => {
    const items = [
        {
            label: "فعالیت های من",
            key: '1',
            children: <MyActivities />,
        },
        {
            label: "اسناد باقیمانده من",
            key: '2',
            children: <MyDocuments/>,
        },
        {
            label: "کارهای من",
            key: '3',
            children: <MyPlan/>,
        }
    ]

    return(
        <div className="min-h-screen bg-Main p-2">
                <Header />
             <Card title={'کارهای من'}>
                 <Tabs items={items} type={"card"}/>
             </Card>
        </div>
    )
}

export default MyWork