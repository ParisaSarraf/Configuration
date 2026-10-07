import { useMemo } from "react";
import { Button, ConfigProvider, Flex, Table, Tag, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import fa_IR from "antd/locale/fa_IR";
import { useRequirementList } from "../../../QueryServises/requirementQuery";
import useRequirementActions from "../hooks/useRequirementActions";
import { normalizeRequirements } from "../utils";

const RequirementTable = ({ setModal }) => {
    const { data: requirementList, isLoading } = useRequirementList();
    const { handleEdit, handleDelete } = useRequirementActions({ setModal });

    const dataSource = useMemo(() => normalizeRequirements(requirementList), [requirementList]);

    const columns = [
        {
            title: "کد",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "نام فارسی",
            dataIndex: "persian_title",
            key: "persian_title",
        },
        {
            title: "نام انگلیسی",
            dataIndex: "english_title",
            key: "english_title",
        },
        {
            title: "چرخه عمر",
            dataIndex: "life_cycle",
            key: "life_cycle",
            render: (value) => value?.persian_title || value?.title || "-",
        },
        {
            title: "قابل تعریف",
            dataIndex: "is_definable",
            key: "is_definable",
            render: (value) => (value ? <Tag color="green">بله</Tag> : <Tag>خیر</Tag>),
        },
        {
            title: "عملیات",
            key: "actions",
            render: (_, record) => (
                <Flex gap={4}>
                    <Tooltip title="ویرایش">
                        <Button
                            className="text-green-700 border-green-700"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        >
                            ویرایش
                        </Button>
                    </Tooltip>
                    <Tooltip title="حذف">
                        <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
                            حذف
                        </Button>
                    </Tooltip>
                </Flex>
            ),
        },
    ];

    return (
        <div>
            <ConfigProvider direction="rtl" locale={fa_IR}>
                <Table
                    bordered
                    columns={columns}
                    dataSource={dataSource}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{
                        defaultPageSize: 5,
                        pageSizeOptions: [10, 20, 45, 100],
                        size: "small",
                        showSizeChanger: true,
                    }}
                    expandable={{
                        indentSize: 20,
                        expandIconColumnIndex: 0,
                        rowExpandable: (record) => record.children && record.children.length > 0,
                    }}
                />
            </ConfigProvider>
        </div>
    );
};

export default RequirementTable;
