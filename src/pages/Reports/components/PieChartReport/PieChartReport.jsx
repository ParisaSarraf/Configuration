import { Card } from "antd";
import { PieChart } from "@mui/x-charts/PieChart";
import { useGetEditionsCountReport } from "@/QueryServises/ReportsQuery/index.js";
import { useMemo } from "react";
import { getStateColor } from "../utils";

const PieChartReport = ({ currentProduct, filters = {} }) => {
  const {
    data: pieData,
    isLoading,
    error,
  } = useGetEditionsCountReport(currentProduct?.id, filters);

  const chartData = useMemo(() => {
    if (!pieData) return [];
    return pieData.map((item) => ({
      id: item.state,
      value: item.count,
      label: getStateLabel(item.state),
      color: getStateColor(item.state), 
    }));
  }, [pieData]);

  if (error) {
    return <Card>خطا در بارگذاری داده‌ها</Card>;
  }

  return (
    <Card
      title="گزارش تعداد ویرایش‌ها"
      loading={isLoading}
      style={{ height: "500px" }}
    >
      {chartData?.length > 0 ? (
        <div style={{ width: "100%", height: "400px" }}>
          <PieChart
            series={[
              {
                data: [...chartData].sort((a, b) => a.value - b.value),
                innerRadius: 30,
                outerRadius: 100,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: -90,
                endAngle: 270,
                cx: 150,
                cy: 150,
                colorAccessor: (dataItem, index) => dataItem.color || getStateColor(dataItem.id),
              },
            ]}
            width={400}
            height={300}
          />
        </div>
      ) : (
        !isLoading && (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              color: "#999",
            }}
          >
            داده‌ای برای نمایش وجود ندارد
          </div>
        )
      )}
    </Card>
  );
};

const getStateLabel = (stateCode) => {
  const stateLabels = {
    10: "تعریف نشده ",
    20: "تهیه شده",
    30: "تایید شده",
    40: "تصویب شده",
  };

  return stateLabels[stateCode] || `وضعیت ${stateCode}`;
};

export default PieChartReport;