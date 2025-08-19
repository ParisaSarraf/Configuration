import React from 'react';
import {Card} from "antd";
import {PieChart} from '@mui/x-charts/PieChart';
import {useGetEditionsCountReport} from "@/QueryServises/ReportsQuery/index.js";

const PieChartReport = ({currentProduct, filters = {}}) => {


    const {data: pieData, isLoading, error} = useGetEditionsCountReport(currentProduct?.id,
        filters);

    const chartData = React.useMemo(() => {
        if (!pieData) return [];

        return pieData.map(item => ({
            id: item.state,
            value: item.count,
            label: getStateLabel(item.state),
        }));
    }, [pieData]);

    const colors = [
        '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
        '#A4DE6C', '#D0ED57', '#8884D8', '#82CA9D'
    ];

    if (error) {
        return <Card>خطا در بارگذاری داده‌ها</Card>;
    }

    return (
        <Card
            title="گزارش تعداد ویرایش‌ها"
            loading={isLoading}
            style={{height: '500px'}}
        >
            {chartData.length > 0 ? (
                <div style={{width: '100%', height: '400px'}}>
                    <PieChart
                        series={[
                            {
                                data: chartData,
                                innerRadius: 30,
                                outerRadius: 100,
                                paddingAngle: 5,
                                cornerRadius: 5,
                                startAngle: -90,
                                endAngle: 270,
                                cx: 150,
                                cy: 150,
                                colors: colors,
                            },
                        ]}
                        width={400}
                        height={300}
                    />
                </div>
            ) : (
                !isLoading && <div style={{
                    textAlign: 'center',
                    padding: '50px',
                    color: '#999'
                }}>
                    داده‌ای برای نمایش وجود ندارد
                </div>
            )}
        </Card>
    );
};

const getStateLabel = (stateCode) => {
    const stateLabels = {
        null: 'همه اسناد',
        10: 'تهیه ',
        20: 'تصویب',
        30: 'تصدیق',
    };

    return stateLabels[stateCode] || `وضعیت ${stateCode}`;
};

export default PieChartReport;