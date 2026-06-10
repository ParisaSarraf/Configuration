import { EyeOutlined, FileDoneOutlined } from "@ant-design/icons";
import { Button, Tag } from "antd";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";

const ReportCol = ({ handleShowDetailEdition, handleAutomationFiles }) => {
  return [
    {
      title: "نام محصول",
      dataIndex: ["product", "persian_title"],
      key: "persian_title",
      width: 100,
      render: (record) => {
        return <Tag color={"cyan"}>{record}</Tag>;
      },
    },
    {
      title: "نام سند",
      dataIndex: ["document", "persianTitle"],
      key: "persianTitle",
      width: 100,
      render: (record) => {
        return <Tag color={"gold"}>{record}</Tag>;
      },
    },
    {
      title: "کد سند",
      dataIndex: ["editions", 0, "edition"],
      key: "edition",
      width: 100,
      render: (record) => {
        return <Tag color="green">{record}</Tag>;
      },
    },
    {
      title: "تاریخ بازبینی",
      dataIndex: ["survey_date"],
      key: "survey_date",
      width: 100,
      render: (record) => {
        return <Tag color={"green"}>{georgianDateToJalaliDate(record)}</Tag>;
      },
    },
    {
      title: "وضعیت سند",
      dataIndex: ["editions", 0, "state"],
      key: "state",
      width: 100,
      render: (record) => {
        if (record === 10) {
          return <Tag color={"orange"}>{"تهیه نشده"}</Tag>;
        }
        if (record === 20) {
          return <Tag color={"green"}>{"تهیه شده"}</Tag>;
        }
        if (record === 30) {
          return <Tag color={"red"}>{"تایید شده"}</Tag>;
        }
        if (record === 40) {
          return <Tag color={"red"}>{"تصویب شده"}</Tag>;
        }
        return <Tag color={"red"}>{record}</Tag>;
      },
    },
    {
      title: "عملیات",
      width: 100,
      render: (_, record) => {
        return (
          <div className="w-full flex flex-row gap-2">
            <Button
              size={"small"}
              type="text"
              icon={<EyeOutlined />}
              className="text-sky-500 hover:text-sky-700 border border-sky-500"
              onClick={(e) => {
                e.stopPropagation();
                handleShowDetailEdition(record);
              }}
              title="مشاهده"
            />
            <Button
              size={"small"}
              type="text"
              icon={<FileDoneOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAutomationFiles(record);
              }}
              title={"روال اسناد"}
              className="text-purple-500 hover:text-purple-700 border border-purple-500"
            />
          </div>
        );
      },
    },
  ];
};

export default ReportCol;
