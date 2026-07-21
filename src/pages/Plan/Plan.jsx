import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Popconfirm, Progress, Tag, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import PlanModal from "./_components/PlanModal";
import {
  useDeleteProductionPlan,
  useProductionPlanList,
} from "../../QueryServises/PlanQuery";
import { TableAntd } from "../../components/TableAntd/TableAntd";

const STATUS_META = {
  draft: { label: "پیش‌نویس", color: "default" },
  confirmed: { label: "تأیید شده", color: "processing" },
  completed: { label: "تکمیل شده", color: "success" },
  cancelled: { label: "لغو شده", color: "error" },
};

const Plan = () => {
  const navigate = useNavigate();
  const { setModal, modalMode, modalData, isOpen, closeModal } = useModal();
  const { data: plans, isPending, refetch } = useProductionPlanList();
  const deletePlan = useDeleteProductionPlan();

  const columns = [
    {
      title: "محصول",
      key: "product",
      align: "center",
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <span className="font-medium">
            {record.product?.persian_title ?? "—"}
          </span>
          <span className="text-xs text-slate-400">
            کد: {record.product?.code ?? "—"}
          </span>
        </div>
      ),
    },
    { title: "شماره نسخه", dataIndex: "version_number", align: "center" },
    {
      title: "وضعیت",
      dataIndex: "status",
      align: "center",
      render: (s) => (
        <Tag color={STATUS_META[s]?.color}>{STATUS_META[s]?.label ?? s}</Tag>
      ),
    },
    {
      title: "مقدار برنامه‌ریزی شده",
      dataIndex: "total_planned_quantity",
      align: "center",
      render: (v) => v?.toLocaleString("fa-IR"),
    },
    {
      title: "پیشرفت سال",
      dataIndex: "year_progress_percent",
      align: "center",
      width: 140,
      render: (v) => <Progress percent={v ?? 0} size="small" />,
    },
    {
      title: "ایجاد کننده",
      dataIndex: "created_by",
      align: "center",
      render: (u) => (u ? `${u.name ?? ""} ${u.last_name ?? ""}`.trim() : "—"),
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "created_at",
      align: "center",
      render: (d) => (d ? new Date(d).toLocaleDateString("fa-IR") : "—"),
    },
    { title: "توضیحات", dataIndex: "notes", ellipsis: true },
    {
      title: "عملیات",
      key: "actions",
      align: "center",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="ویرایش">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-sky-600"
              onClick={() =>
                setModal({ mode: "edit", data: record, type: "addPlan" })
              }
            />
          </Tooltip>
          <Popconfirm
            title="حذف برنامه تولید"
            description="آیا از حذف این برنامه مطمئن هستید؟"
            okText="بله، حذف کن"
            cancelText="انصراف"
            okButtonProps={{ danger: true, loading: deletePlan.isPending }}
            onConfirm={() => deletePlan.mutateAsync(record.id).then(refetch)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <header>
          <div className="w-full flex justify-between">
            <Button
              type="text"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/")}
              className="flex items-center text-slate-600 hover:!text-sky-700 mb-4 font-medium"
            >
              بازگشت به مدیریت سیستم
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 leading-none">
                برنامه‌ریزی تولید
              </h1>
              <p className="mt-3 text-slate-500 text-lg">
                مشاهده و مدیریت برنامه‌های تولید
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="shadow-md shadow-sky-200"
              onClick={() =>
                setModal({ mode: "add", data: null, type: "addPlan" })
              }
            >
              اضافه کردن برنامه‌ریزی تولید
            </Button>
          </div>
        </header>

        <main>
          <Card
            className="rounded-2xl shadow-sm border-slate-200"
            styles={{ body: { padding: 0 } }}
          >
            <TableAntd
              rowKey="id"
              loading={isPending}
              columns={columns}
              dataSource={plans ?? []}
              locale={{
                emptyText: <Empty description="برنامه تولیدی ثبت نشده است" />,
              }}
            />
          </Card>
        </main>

        <PlanModal
          refetch={refetch}
          isOpen={isOpen}
          modalMode={modalMode}
          modalData={modalData}
          closeModal={closeModal}
        />
      </div>
    </div>
  );
};

export default Plan;
