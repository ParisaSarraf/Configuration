import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { Button, Modal, message } from "antd";
import { useDeleteDefinition } from "../../../../../QueryServises/formsQuery";
import { georgianDateToJalaliDate } from "../../../../../utils/timeTool";

const FormDefinitionCols = ({
  handleEdit,
  handleView,
  refetch,
  handleCreateFormDefinitionFeild,
}) => {
  const { mutateAsync: deleteCategoryDefinition } = useDeleteDefinition();

  const handleDelete = (record) => {
    Modal.confirm({
      title: "حذف فرم",
      content: `آیا از حذف فرم "${record?.name}" مطمئن هستید؟`,
      okText: "بله، حذف کن",
      cancelText: "انصراف",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteCategoryDefinition(record.id);
          message.success("فرم با موفقیت حذف شد");
          await refetch;
        } catch (error) {
          message.error("خطا در حذف فرم");
          console.error("Delete error:", error);
        }
      },
    });
  };

  return [
    {
      title: "ردیف",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "نام فرم",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "توضیحات",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "تاریخ بسته شدن",
      dataIndex: "close_date",
      key: "close_date",
      render: (text) => (text ? georgianDateToJalaliDate(text) : "-"),
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => (text ? georgianDateToJalaliDate(text) : "-"),
    },
    {
      title: "عملیات",
      key: "operation",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            className="text-red-500"
            onClick={() => handleDelete(record)}
          />
          <Button
            icon={<EditOutlined />}
            type="text"
            className="text-green-500"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<EyeOutlined />}
            type="text"
            className="text-blue-500"
            onClick={() => handleView(record)}
          />
          <Button
            icon={<FormOutlined />}
            type="text"
            className="text-yellow-500"
            onClick={() => handleCreateFormDefinitionFeild(record?.id)}
          />
        </div>
      ),
    },
  ];
};

export default FormDefinitionCols;
