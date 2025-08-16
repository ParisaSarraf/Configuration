import {Card, Spin, Typography} from "antd";
import {PieChart} from '@mui/x-charts/PieChart';
import {getStateColor, stateLabels} from "@/pages/Reports/components/utils.js";

const {Title} = Typography;

export const ReportCharts = ({data, isLoading}) => {

    // console.log(data)
    const formattedChartData = data?.map(item => ({
        id: item.state,
        value: item.count,
        label: `${stateLabels[item.state] || 'نامشخص'}`,
        color: getStateColor(item.state),
    })) || [];

    return (
        <Card>
            <Title level={5}>گزارش تعداد اسناد بر اساس وضعیت</Title>
            {isLoading ? (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300}}>
                    <Spin/>
                </div>
            ) : formattedChartData.length > 0 ? (
                <PieChart
                    series={[{
                        data: formattedChartData,
                        highlightScope: {faded: 'global', highlighted: 'item'},
                        faded: {innerRadius: 30, additionalRadius: -30, color: 'gray'},
                        innerRadius: 40,
                        outerRadius: 120,
                        paddingAngle: 2,
                        cornerRadius: 5,
                        valueFormatter: (item) => `${item.value} عدد`,
                    }]}
                    height={300}
                    slotProps={{
                        legend: {hidden: false, position: {vertical: 'middle', horizontal: 'right'}},
                    }}
                />
            ) : (
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300}}>
                    <p>دیتایی برای نمایش وجود ندارد.</p>
                </div>
            )}
        </Card>
    );
};