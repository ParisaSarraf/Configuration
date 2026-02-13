import { ArrowRightOutlined, TrophyOutlined, ThunderboltOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Table, Tag, Progress, Avatar, Tooltip, Row, Col, Statistic, Empty } from "antd";
import { useGetActivitiesUserPerformance } from "../../../QueryServises/PanelQuery";
import { useNavigate } from "react-router-dom";

const UsersPerformance = () => {
  const { data, isLoading } = useGetActivitiesUserPerformance();
  const navigate = useNavigate();

  const topPerformer = data?.reduce((prev, current) => (prev.avg_performance > current.avg_performance) ? prev : current, {});
  const totalActivities = data?.reduce((sum, item) => sum + item.activity_count, 0) || 0;

  const columns = [
    {
      title: "رتبه",
      key: "index",
      render: (_, __, index) => {
        const rank = index + 1;
        const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];
        return (
          <div className="flex justify-center">
            {rank <= 3 ? (
              <div className="relative">
                <TrophyOutlined style={{ color: colors[rank - 1], fontSize: '24px' }} />
                <span className="absolute -top-1 -right-1 bg-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border shadow-sm">
                  {rank}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 font-mono italic">{rank}</span>
            )}
          </div>
        );
      },
      width: 80,
      align: "center",
    },
    {
      title: "پروفایل و اطلاعات",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <Avatar 
            size={48}
            className="shadow-inner border-2 border-white"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '18px'
            }}
          >
            {record.trustee__name[0]}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-base leading-tight">
              {`${record.trustee__name} ${record.trustee__last_name}`}
            </span>
            <div className="flex items-center gap-2 mt-1">
              {/* <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                ID: {record.trustee_id}
              </span> */}
              {record.avg_performance > 80 && (
                <Tag color="gold" className="text-[10px] m-0 leading-normal border-none">سطح ممتاز</Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: " عملکرد",
      dataIndex: "avg_performance",
      key: "avg_performance",
      render: (value) => (
        <div className="w-full max-w-[220px]">
          <div className="flex justify-between items-end mb-1.5">
            <span className={`text-sm font-black ${value > 50 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {value}%
            </span>
            {/* <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Efficiency Score</span> */}
          </div>
          <Progress
            percent={value}
            showInfo={false}
            strokeWidth={10}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            className="m-0"
          />
        </div>
      ),
      sorter: (a, b) => a.avg_performance - b.avg_performance,
    },
    {
      title: "تعداد فعالیت",
      dataIndex: "activity_count",
      key: "activity_count",
      align: "center",
      render: (count) => (
        <div className="flex flex-col items-center gap-1">
          <div className="text-lg font-bold text-slate-700">
            {count.toLocaleString("fa-IR")}
          </div>
          <div className="flex gap-0.5">
            {[...Array(Math.min(5, Math.ceil(count/5)))].map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            ))}
          </div>
        </div>
      ),
      sorter: (a, b) => a.activity_count - b.activity_count,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header>
          <Button
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate("/panel/system-management")}
            className="flex items-center text-slate-600 hover:!text-sky-700 mb-4 font-medium"
          >
            بازگشت به مدیریت سیستم
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 leading-none">
                عملکرد کاربران
              </h1>
              <p className="mt-3 text-slate-500 text-lg">
                گزارش جامع و تحلیل هوشمند خروجی تیم
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 min-w-[140px]">
                <div className="text-slate-400 text-xs mb-1">تعداد کل کاربران</div>
                <div className="text-2xl font-black text-slate-800 leading-none">{data?.length || 0}</div>
              </div>
            </div>
          </div>
        </header>

        <main>
          <Row gutter={[20, 20]} className="mb-8">
            <Col xs={24} md={24}>
              <Card className="rounded-3xl border-none shadow-sm overflow-hidden h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <ThunderboltOutlined className="text-yellow-500" />
                    خلاصه وضعیت فعالیت‌ها
                  </h3>
                </div>
                <div className="flex flex-wrap gap-8 justify-around items-center py-4">
                  <Statistic title="مجموع کل فعالیت ها" value={totalActivities} valueStyle={{ fontWeight: 900 }} />
                  <div className="h-12 w-[1px] bg-slate-100 hidden sm:block" />
                  <Statistic 
                    title="برترین عملکرد" 
                    value={topPerformer?.trustee__name ? `${topPerformer.trustee__name} ${topPerformer.trustee__last_name}` : '---'} 
                    valueStyle={{ fontSize: '16px', fontWeight: 800, color: '#059669' }} 
                  />
                  <div className="h-12 w-[1px] bg-slate-100 hidden sm:block" />
                  {/* <div className="flex flex-col items-center">
                    <span className="text-slate-400 text-sm mb-1">توزیع کلی</span>
                    <Progress type="dashboard" percent={75} size={60} strokeColor="#6366f1" />
                  </div> */}
                </div>
              </Card>
            </Col>
          
          </Row>

          <Card className="shadow-xl shadow-slate-200/60 border-none rounded-3xl overflow-hidden" bodyStyle={{ padding: 0 }}>
            <Table
              dataSource={data || []}
              columns={columns}
              rowKey="trustee_id"
              className="modern-table"
              loading={isLoading}
              pagination={{
                pageSize: 7,
                className: "p-6",
                showTotal: (total) => <span className="text-slate-400 font-medium">نمایش {total} ردیف عملکرد</span>,
              }}
              locale={{
                emptyText: <Empty description="داده‌ای یافت نشد" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
              }}
            />
          </Card>
        </main>
      </div>

      <style jsx global>{`
        .modern-table .ant-table-thead > tr > th {
          background: #fafafa !important;
          color: #94a3b8 !important;
          font-weight: 800 !important;
          font-size: 12px !important;
          text-transform: uppercase;
          border-bottom: 2px solid #f1f5f9 !important;
          padding: 20px 24px !important;
        }
        .modern-table .ant-table-tbody > tr > td {
          padding: 20px 24px !important;
          transition: all 0.2s;
        }
        .modern-table .ant-table-row:hover td {
          background-color: #f8fafc !important;
        }
        .ant-table {
            background: transparent !important;
        }
        .ant-pagination-item-active {
            border-radius: 8px !important;
            border-color: #6366f1 !important;
        }
      `}</style>
    </div>
  );
};

export default UsersPerformance;