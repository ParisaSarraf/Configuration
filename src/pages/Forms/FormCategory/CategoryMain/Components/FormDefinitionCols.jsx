import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FormatPainterFilled,
  FormOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Button, Modal, Tooltip, message } from "antd";
import { useDeleteDefinition } from "../../../../../QueryServises/formsQuery";
import { georgianDateToJalaliDate } from "../../../../../utils/timeTool";

const FormDefinitionCols = ({
  handleEdit,
  handleView,
  refetch,
  handleCreateFormDefinitionField,
  handlePreview,
}) => {
  const { mutateAsync: deleteCategoryDefinition } = useDeleteDefinition();

  const handleDelete = (record) => {
    Modal.confirm({
      title: "حذف فرم",
      content: `آیا از حذف فرم "${record?.name}" مطمئن هستید؟`,
      okText: "بله، حذف کن",
      cancelText: "انصراف",
      okType: "danger",
      centered: true,
      onOk: async () => {
        try {
          await deleteCategoryDefinition(record.id);
          message.success("فرم با موفقیت حذف شد");
          await refetch?.();
        } catch (error) {
          message.error("خطا در حذف فرم");
          console.error("Delete error:", error);
        }
      },
    });
  };

  const actionClass =
    "!flex !h-8 !w-8 !items-center !justify-center !rounded-xl !border-none !p-0 transition";

  return [
    {
      title: "ردیف",
      dataIndex: "index",
      key: "index",
      width: 70,
      align: "center",
      render: (text, record, index) => (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br theme-gradient-soft theme-gradient-soft text-xs font-bold theme-accent">
          {index + 1}
        </span>
      ),
    },
    {
      title: "نام فرم",
      dataIndex: "name",
      key: "name",
      render: (value) => (
        <span className="text-[14px] font-semibold theme-text">
          {value || "بدون نام"}
        </span>
      ),
    },
    {
      title: "تاریخ بسته شدن",
      dataIndex: "close_date",
      key: "close_date",
      render: (text) =>
        text ? (
          <span className="rounded-lg bg-rose-50 px-2 py-1 text-[12px] font-medium text-rose-600">
            {georgianDateToJalaliDate(text)}
          </span>
        ) : (
          <span className="theme-muted">-</span>
        ),
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) =>
        text ? (
          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-600">
            {georgianDateToJalaliDate(text)}
          </span>
        ) : (
          <span className="theme-muted">-</span>
        ),
    },
    {
      title: "عملیات",
      key: "operation",
      width: 190,
      render: (text, record) => (
        <div className="flex items-center gap-1.5">
          <Tooltip title="حذف">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className={`${actionClass} !bg-rose-50 !text-rose-500 hover:!bg-rose-100`}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>

          <Tooltip title="ویرایش">
            <Button
              type="text"
              icon={<EditOutlined />}
              className={`${actionClass} !bg-emerald-50 !text-emerald-600 hover:!bg-emerald-100`}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Tooltip title="جزئیات">
            <Button
              type="text"
              icon={<EyeOutlined />}
              className={`${actionClass} !theme-accent-soft !theme-accent hover:!theme-accent-soft`}
              onClick={() => handleView(record)}
            />
          </Tooltip>

          <Tooltip title="پیش‌نمایش">
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              className={`${actionClass} !theme-accent-soft !theme-accent hover:!theme-accent-soft`}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>

          <Tooltip title="شروع فرآیند ساخت فرم">
            <Button
              type="text"
              icon={<FormatPainterFilled />}
              className={`${actionClass} !bg-amber-50 !text-amber-600 hover:!bg-amber-100`}
              onClick={() => handleCreateFormDefinitionField(record?.id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];
};

export default FormDefinitionCols;
