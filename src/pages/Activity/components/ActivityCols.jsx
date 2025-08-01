import {Button, Flex, Tooltip, Tag, Select} from "antd";
import {DeleteOutlined, EditOutlined, EyeOutlined, FolderAddOutlined, UserAddOutlined} from "@ant-design/icons";
import {useState} from "react";

export const ActivityCols = ({
                                 handleEdit, handleDelete, handleTrustee, handlePlan, handleDetail, trustees = [],
                                 setFilters
                             }) => {
    const [selectedTrustees, setSelectedTrustees] = useState([]);

    return ([
            {
                title: 'ردیف',
                key: 'index',
                render: (_, __, index) => index + 1,
            },
            {
                title: "کد فعالیت",
                dataIndex: 'meeting',
                key: 'meeting',
                render(text, record) {
                    return (
                        <Tag color="blue">{record.meeting?.code || 'بدون کد'}</Tag>
                    )
                }
            },
            {
                title: "شرح فعالیت",
                dataIndex: 'description',
                key: 'description',
                render: (description) => {
                    return (
                        <Tooltip title={description}>
                            <Tag
                                color="blue"
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
                dataIndex: ['trustee', 'name'],
                key: 'trustee',
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
                                    {`${t.name} ${t.last_name || ''}`}
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
                render: (name, record) =>
                    `${name} ${record.trustee?.last_name || ''}`,
            },
            {
                title: "تاریخ پایان",
                dataIndex: 'to_date',
                key: 'to_date'
            }, {
                title: "تایید انجام",
                dataIndex: 'confirmed_date',
                key: 'confirmed_date'
            }, {
                title: "نفر روز",
                dataIndex: 'person_day',
                key: 'person_day'
            }, {
                title: "درصد عملکرد",
                dataIndex: 'performance_index',
                key: 'description'
            }, {
                title: "عملیات",
                key: 'actions',
                render: (_, record) => {
                    const isTrusteeDone = !!record.trustee_description || !!record.trustee_file;
                    const isPlanDone = !!record.confirmed_date || !!record.plan_file;

                    return (
                        <Flex gap={4}>
                            <Tooltip title="حذف">
                                <Button
                                    onClick={() => handleDelete(record.id)}
                                    icon={<DeleteOutlined/>}
                                    danger
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="ویرایش">
                                <Button
                                    icon={<EditOutlined/>}
                                    className="text-green-500 border-green-500"
                                    onClick={() => handleEdit(record)}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="انجام توسط متولی">
                                <Button
                                    icon={<UserAddOutlined/>}
                                    className={
                                        isTrusteeDone
                                            ? "bg-orange-600 text-white border-orange-600"
                                            : "text-orange-600 border-orange-600"
                                    }
                                    onClick={() => handleTrustee(record)}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="انجام توسط طرح و برنامه">
                                <Button
                                    icon={<FolderAddOutlined/>}
                                    className={
                                        isPlanDone
                                            ? "bg-pink-700 text-white border-pink-700"
                                            : "text-pink-700 border-pink-700"
                                    }
                                    onClick={() => handlePlan(record)}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="جزئیات">
                                <Button
                                    icon={<EyeOutlined/>}
                                    className="text-sky-500 border-sky-500"
                                    onClick={() => handleDetail(record)}
                                    size="small"
                                />
                            </Tooltip>
                        </Flex>
                    );
                }

            }]
    )
};

export const ActivityDetail = [
    // {
    //     title: "متولی",
    //     dataIndex: ['trustee', 'name'],
    //     key: 'trustee',
    //     render: (name, record) => `${name} ${record.trustee?.last_name || ''}`
    // },
    {
        title: 'توضیحات متولی',
        dataIndex: 'trustee_description',
        key: 'trustee_description',
        render: (text) => text || 'بدون توضیح'
    },
    {
        title: "تاریخ تایید طرح و برنامه",
        dataIndex: 'confirmed_date',
        key: 'confirmed_date'
    },
    {
        title: 'فایل متولی',
        dataIndex: 'trustee_file',
        key: 'trustee_file',
        render: (file) => file ? (
            <a href={file} target="_blank" rel="noopener noreferrer">دانلود</a>
        ) : 'بدون فایل'
    },
    {
        title: 'فایل طرج و برنامه',
        dataIndex: 'plan_file',
        key: 'plan_file',
        render: (file) => file ? (
            <a href={file} target="_blank" rel="noopener noreferrer">دانلود</a>
        ) : 'بدون فایل'
    }
];