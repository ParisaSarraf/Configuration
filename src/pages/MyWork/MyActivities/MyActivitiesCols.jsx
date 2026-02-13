import { Button, Space, Tag, Tooltip } from "antd";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";
import { CheckOutlined, EyeOutlined, UserAddOutlined } from "@ant-design/icons";

export const MyActivitiesCols = ({ handleShowDetail, handleTrustee }) => {
  const referralOptions = [
    { value: "For action", label: "جهت اقدام" },
    { value: "For information", label: "جهت اطلاع" },
    { value: "For follow-up", label: "جهت همکاری" },
    { value: "For immediate action", label: "جهت اقدام فوری" },
    { value: "For communicate the program", label: "جهت ابلاغ برنامه" },
  ];
  
  const getReferralOrderLabel = (value) => {
    const option = referralOptions.find(opt => opt.value === value);
    return option ? option.label : value || "---";
  };

  return [
    {
      title: "ردیف",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "مسئول",
      key: "trustee",
      render: (_, record) => {
        const trusteeName = record.trustee?.name || "";
        const trusteeLastName = record.trustee?.last_name || "";
        return `${trusteeName} ${trusteeLastName}`.trim() || "---";
      },
    },
    {
      title: "کد فعالیت",
      dataIndex: "full_code",
      key: "full_code",
      render: (full_code) => {
        return <Tag>{full_code || "---"}</Tag>;
      },
    },
    {
      title: "نام محصول",
      key: "persian_title",
      render: (_, row) => {
        return (
          row.product?.persian_title || 
          row.meeting?.product?.persian_title || 
          "---"
        );
      },
    },
    {
      title: "جهت",
      key: "referral_order",
      dataIndex: "referral_order", 
      render: (referral_order) => {
        return (
          <Tag color="blue">
            {getReferralOrderLabel(referral_order)}
          </Tag>
        );
      }
    },
    {
      title: "شرح فعالیت",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description) => {
        return (
          <Tooltip title={description}>
            <Tag
              color="purple"
              style={{
                maxWidth: 150,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {description || "---"}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "تاریخ پایان",
      dataIndex: "to_date",
      key: "to_date",
      render: (to_date) => {
        return to_date ? (
          <Tag color="blue">{georgianDateToJalaliDate(to_date)}</Tag>
        ) : (
          <Tag color="default">---</Tag>
        );
      },
    },
    {
      title: "تاریخ تایید",
      dataIndex: "done_date",
      key: "done_date",
      render: (done_date) => {
        return done_date ? (
          <Tag color="green">{georgianDateToJalaliDate(done_date)}</Tag>
        ) : (
          <Tag color="default">---</Tag>
        );
      },
    },

    {
      title: "عملیات",
      key: "actions",
      render: (record) => {
        const isTrustee = record?.state === 20;
        return (
          <Space direction="horizontal">
            {isTrustee ? (
              <Button
                icon={
                  <CheckOutlined
                    className={"text-orange-600 border-orange-600 "}
                  />
                }
                className={"text-orange-600 border-orange-600 "}
                size="small"
                type={"text"}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            ) : (
              <Tooltip title="انجام توسط متولی">
                <Button
                  icon={<UserAddOutlined />}
                  className={"text-orange-600 border-orange-600"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrustee(record);
                  }}
                  size="small"
                />
              </Tooltip>
            )}
            <Tooltip title="جزئیات">
              <Button
                size="small"
                type={"text"}
                icon={<EyeOutlined />}
                className="text-sky-500 border-sky-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowDetail(record);
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];
};