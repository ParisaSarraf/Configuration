import {useState} from "react";
import {Button, Card, Form, Select, Switch} from "antd";
import {useGetEditionCountReport} from "@/QueryServises/ReportsQuery";
import {ALL_STATES, stateLabels} from "@/pages/Reports/components/utils.js";
import {PieChart} from "@mui/x-charts/PieChart";


const ReportCharts = ({productId}) => {
    const [form] = Form.useForm();
    const [filters, setFilters] = useState({
        states: ALL_STATES,
        with_children: true,
    });

    const {data = [], isLoading, isError} = useGetEditionCountReport(
        productId,
        filters,
        {enabled: !!productId}
    );

    const onFinish = (values) => {
        setFilters({
            states: values.states,
            with_children: values.with_children,
        });
    };

    console.log(filters)

    if (isLoading) return <Card title={'نمودار اسناد'} className={'text-blue-500 '}>درحال بازنشانی اطلاعات
        ...</Card>;
    if (isError) return <Card title={'نمودار اسناد'} className={'text-red-500'}>مشکلی به وجود آمده
        است.</Card>;
    if (!data || data.length === 0) return <Card title={'نمودار اسناد'} className={'text-red-500   '}>هیچ داده
        ای موجود نیست</Card>;

    const total = data?.reduce((sum, item) => sum + item.count, 0);
    const pieData = data?.map(item => ({
        id: item.state,
        label: stateLabels[item.state],
        value: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));


    return (
        <Card title={'نمودار اسناد'}>
            {/* ------------ Filter Form -------------- */}
            <Card style={{marginBottom: 16}}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{states: ALL_STATES, with_children: true}}
                    onFinish={onFinish}
                >
                    <Form.Item name="states" label="وضعیت‌ها">
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="انتخاب وضعیت‌ها"
                            options={ALL_STATES?.map(st => ({value: st, label: stateLabels[st]}))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="with_children"
                        label="با زیرمجموعه‌ها"
                        valuePropName="checked"
                    >
                        <Switch/>
                    </Form.Item>

                    <Button type="primary" htmlType="submit">اعمال فیلتر</Button>
                </Form>
            </Card>
            {/*---------------------------------------- */}

            {/* ---------- Pie Chart ---------- */}
            <PieChart
                series={[{data: pieData || []}]}
                width={400}
                height={400}
            />

            <div style={{marginTop: 16}}>
                {pieData?.map(item => (
                    <div key={item.id}>
                        {item.label}: {item.value} ({item.percentage}%)
                    </div>
                ))}
                <div><strong>جمع کل: {total}</strong></div>
            </div>
        </Card>
    );
};

export default ReportCharts;
