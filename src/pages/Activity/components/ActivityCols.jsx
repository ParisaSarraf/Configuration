import { Badge, Button, Flex, Select, Tag, Tooltip } from "antd";
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FolderAddOutlined,
  PlusOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";

export const ActivityCols = ({
  handleEdit,
  handleDelete,
  handleTrustee,
  handlePlan,
  handleDetail,
  trustees = [],
  setFilters,
  handleAddSubActivity,
}) => {
  const [selectedTrustees, setSelectedTrustees] = useState([]);

  const referralOptions = [
    { value: "For action", label: "جهت اقدام" },
    { value: "For information", label: "جهت اطلاع" },
    { value: "For follow-up", label: "جهت همکاری" },
    { value: "For immediate action", label: "جهت اقدام فوری" },
    { value: "For communicate the program", label: "جهت ابلاغ برنامه" },
  ];

  const referralMap = referralOptions.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  return [
    {
      title: "ردیف",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "کد فعالیت",
      dataIndex: "meeting",
      key: "meeting",
      render(text, record) {
        return <Tag color="volcano">{record.full_code || "بدون کد"}</Tag>;
      },
    },
    {
      title: "شرح فعالیت",
      dataIndex: "description",
      key: "description",
      render: (description) => {
        return (
          <Tooltip title={description}>
            <Tag
              color="purple"
              style={{
                maxWidth: 200,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {description}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "متولی",
      dataIndex: ["trustee", "name"],
      key: "trustee",
      filterDropdown: () => (
        <div className="p-2">
          <Select
            className="w-full"
            allowClear
            mode="multiple"
            value={selectedTrustees}
            onChange={(value) => {
              setSelectedTrustees(value);
            }}
          >
            {trustees?.map((t) => (
              <Select.Option key={t.id} value={t.id}>
                {`${t.name} ${t.last_name || ""}`}
              </Select.Option>
            ))}
          </Select>
          <div className="w-full flex flex-row justify-between text-right mt-2">
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  trustee_id: selectedTrustees,
                }));
              }}
            >
              اعمال
            </Button>
            <Button
              size="small"
              onClick={() => {
                setSelectedTrustees([]);
                setFilters((prev) => ({
                  ...prev,
                  trustee_id: undefined,
                }));
              }}
            >
              ریست
            </Button>
          </div>
        </div>
      ),
      render: (name, record) => `${name} ${record.trustee?.last_name || ""}`,
    },
    {
      title: "جهت",
      dataIndex: "referral_order",
      key: "referral_order",
      render: (text, record) => {
        return referralMap[text] || text || "---";
      },
    },
    {
      title: "تاریخ پایان",
      dataIndex: "to_date",
      key: "to_date",
      render: (record) => {
        return <>{georgianDateToJalaliDate(record) || "ندارد"}</>;
      },
    },
    {
      title: "تایید انجام",
      dataIndex: "confirmed_date",
      key: "confirmed_date",
      render: (record) => {
        return <>{georgianDateToJalaliDate(record) || "ندارد"}</>;
      },
    },
    {
      title: "نفر ساعت",
      dataIndex: "person_day",
      key: "person_day",
    },
    {
      title: "درصد عملکرد",
      dataIndex: "performance_index",
      key: "description",
    },
    {
      title: "وضعیت",
      dataIndex: "state",
      key: "state",
      render: (record) => {
        const getStateInfo = (state) => {
          const states = {
            10: { label: "در انتظار اقدام", status: "warning" },
            20: { label: "اقدام فعالیت", status: "success" },
            30: { label: "تایید فعالیت", status: "processing" },
          };
          return states[state] || { label: "نامشخص", status: "default" };
        };
        const stateInfo = getStateInfo(record);

        return <Badge status={stateInfo.status} text={stateInfo.label} />;
      },
    },
    {
      title: "عملیات",
      key: "actions",
      render: (_, record) => {
        const isTrusteeDone = record.state === 20 || record.state === 30;
        const isPlanDone = record.state === 30;

        return (
          <Flex gap={4}>
            <Tooltip title="حذف">
              <Button
                onClick={() => handleDelete(record.id)}
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Tooltip>
            <Tooltip title="ویرایش">
              <Button
                icon={<EditOutlined />}
                className="text-green-500 border-green-500"
                onClick={() => handleEdit(record)}
                size="small"
              />
            </Tooltip>
            {!isTrusteeDone ? (
              <Tooltip title="انجام توسط متولی">
                <Button
                  icon={<UserAddOutlined />}
                  className={"text-orange-600 border-orange-600"}
                  onClick={() => handleTrustee(record)}
                  size="small"
                />
              </Tooltip>
            ) : (
              <Button
                icon={
                  <CheckOutlined
                    className={"text-orange-600 border-orange-600 "}
                  />
                }
                className={"text-orange-600 border-orange-600 "}
                size="small"
                type={"text"}
              />
            )}
            {!isPlanDone ? (
              <Tooltip title="انجام توسط طرح و برنامه">
                <Button
                  icon={<FolderAddOutlined />}
                  className={"text-pink-700 border-pink-700"}
                  onClick={() => handlePlan(record)}
                  size="small"
                />
              </Tooltip>
            ) : (
              <Button
                type={"text"}
                icon={
                  <CheckOutlined className={"text-pink-700 border-pink-700 "} />
                }
                className={"text-pink-700 border-pink-700 "}
                size="small"
              />
            )}
            <Tooltip title="جزئیات">
              <Button
                icon={<EyeOutlined />}
                className="text-sky-500 border-sky-500"
                onClick={() => handleDetail(record)}
                size="small"
              />
            </Tooltip>
            <Tooltip title="اضافه کردن زیرفعالیت">
              <Button
                icon={<PlusOutlined />}
                className="text-stone-500 border-stone-500"
                onClick={() => handleAddSubActivity(record)}
                size="small"
              />
            </Tooltip>
          </Flex>
        );
      },
    },
  ];
};
