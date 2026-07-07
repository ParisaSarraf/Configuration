import { Button, Modal, message } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";

const ExportExcelButton = ({
  id,
  fileName = "export",
  title,
  disabled,
  isLoading,
  FnName,
}) => {
  const handleClick = () => {
    Modal.confirm({
      title: title || "خروجی اکسل",
      content: `آیا مایل به خروجی ${fileName} هستید؟`,
      centered: true,
      okText: "خروجی",
      cancelText: "انصراف",
      okType: "primary",
      maskClosable: true,
      onOk: async () => {
        try {
          const url = await FnName(id);
          if (url) {
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
          }
          message.success("خروجی اکسل موفق بود");
        } catch (error) {
          console.error(error);
          message.error("خروجی اکسل ناموفق بود");
        }
      },
    });
  };

  return (
    <Button
      icon={<FileExcelOutlined />}
      title={title || "خروجی اکسل"}
      loading={isLoading}
      disabled={disabled || !id}
      onClick={handleClick}
      className="text-green-400 hover:text-green-500 border border-green-400 mt-4"
    />
  );
};

export default ExportExcelButton;
