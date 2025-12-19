import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Card, Table, Tag, Progress } from "antd";
import { useGetActivitiesUserPerformance } from "../../../QueryServises/PanelQuery";
import { useNavigate } from "react-router-dom";

const UsersPerformance = () => {
  const { data } = useGetActivitiesUserPerformance();
  const navigate = useNavigate();

  const columns = [
    {
      title: "ردیف",
      key: "index",
      render: (_, __, index) => index + 1,
      width: 80,
      align: "center",
    },
    {
      title: "نام و نام خانوادگی",
      dataIndex: "trustee__name",
      key: "fullName",
      render: (_, record) => (
        <span>{`${record.trustee__name} ${record.trustee__last_name}`}</span>
      ),
      sorter: (a, b) =>
        `${a.trustee__name} ${a.trustee__last_name}`.localeCompare(
          `${b.trustee__name} ${b.trustee__last_name}`
        ),
    },
    {
      title: "میانگین عملکرد",
      dataIndex: "avg_performance",
      key: "avg_performance",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={value}
            size="small"
            strokeColor={
              value >= 70
                ? "#52c41a"
                : value >= 40
                ? "#faad14"
                : "#ff4d4f"
            }
            format={(percent) => `${percent}%`}
          />
          {/* <span className="text-slate-700 min-w-[40px]">{value}%</span> */}
        </div>
      ),
      sorter: (a, b) => a.avg_performance - b.avg_performance,
      align: "center",
    },
    {
      title: "تعداد فعالیت‌ها",
      dataIndex: "activity_count",
      key: "activity_count",
      render: (count) => (
        <Tag
          color={
            count >= 20
              ? "blue"
              : count >= 10
              ? "green"
              : count >= 5
              ? "orange"
              : "default"
          }
          className="font-bold"
        >
          {count.toLocaleString("fa-IR")}
        </Tag>
      ),
      sorter: (a, b) => a.activity_count - b.activity_count,
      align: "center",
    },
    // {
    //   title: "شناسه کاربر",
    //   dataIndex: "trustee_id",
    //   key: "trustee_id",
    //   render: (id) => <span className="text-slate-500">#{id}</span>,
    //   align: "center",
    // },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 flex flex-col"
      dir="rtl"
    >
      <div className="max-w-screen-2xl mx-auto w-full">
        <header>
          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate("/panel/system-management")}
            className="flex items-center text-slate-600 hover:!text-sky-700 mb-4"
          >
            بازگشت به مدیریت سیستم
          </Button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                عملکرد کاربران
              </h1>
              <p className="mt-1 text-base text-slate-600">
                برای دیدن عملکرد کاربران، از این بخش استفاده کنید.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-slate-500">
                تعداد کل کاربران:{" "}
                <span className="font-bold">{data?.length || 0}</span>
              </span>
            </div>
          </div>
        </header>

        <main className="mt-8 flex-1">
          <Card className="shadow-sm border-slate-200">
            <Table
              dataSource={data || []}
              columns={columns}
              rowKey="trustee_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `مجموع ${total} کاربر`,
              }}
              locale={{
                emptyText: "داده‌ای برای نمایش وجود ندارد",
              }}
            />
          </Card>
        </main>
      </div>
    </div>
  );
};

export default UsersPerformance;