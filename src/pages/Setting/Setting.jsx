import { Button, Card, Col, Row, Tabs } from 'antd'
import { useNavigate } from 'react-router-dom'
import Genus from './components/Genus'
import Personality from './components/Personality'
import Casing from './components/Casing'
import Precinct from './components/Precinct'
import LifeCycle from './components/LifeCycle'
import Documents from '../Documents/Documents'
import Requirement from '../Requirement/Requirement'

const Setting = () => {
    const navigate = useNavigate()
    const items = [
        {
            label: "پوشش",
            key: '1',
            children: <Casing />,
        },
        {
            label: `هویت`,
            key: '2',
            children: <Personality />,
        },
        {
            label: ` جنس`,
            key: '3',
            children: <Genus />,
        },
        {
            label: `تجارب`,
            key: '4',
            children: <Precinct />,
        },
        {
            label: `چرخه عمر `,
            key: '5',
            children: <LifeCycle />,
        },
        {
            label: `اسناد و مدارک `,
            key: '6',
            children: <Documents />,
        },
        {
            label: `الزامات `,
            key: '7',
            children: <Requirement />,
        },

    ];
    return (
        <div className="min-h-screen bg-Main p-2">
            <Card
                extra={
                    <Button
                        type="primary"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => navigate("/")}
                    >
                        بازگشت به صفحه اصلی
                    </Button>
                }>
                <Tabs
                    type="line"
                    items={items}
                    tabBarStyle={{
                        display: 'flex',
                        width: '100%',
                    }}
                    className="custom-tabs"
                />
            </Card>
        </div>
    )
}

export default Setting
