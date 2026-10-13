import { useMemo, useState } from "react";
import { ConfigProvider, Dropdown, Table, Tag } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import fa_IR from "antd/locale/fa_IR";
import { useRequirementList } from "../../../QueryServises/requirementQuery";
import useRequirementActions from "../hooks/useRequirementActions";
import { normalizeRequirements } from "../utils";

const RequirementTable = ({ setModal }) => {
    const { data: requirementList, isLoading } = useRequirementList();
    const { handleEdit, handleDelete } = useRequirementActions({ setModal });
    const [contextRecord, setContextRecord] = useState(null);

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

    ];

    return (
        <div>
            <ConfigProvider direction="rtl" locale={fa_IR}>
                <Dropdown
                    trigger={["contextMenu"]}
                    open={Boolean(contextRecord)}
                    onOpenChange={(open) => { if (!open) setContextRecord(null); }}
                    menu={{
                        items: [
                            { key: "edit", label: "ویرایش الزام", icon: <EditOutlined /> },
                            { key: "delete", label: "حذف الزام", icon: <DeleteOutlined />, danger: true },
                        ],
                        onClick: ({ key }) => {
                            if (!contextRecord) return;
                            const record = contextRecord;
                            setContextRecord(null);
                            if (key === "edit") handleEdit(record);
                            else if (key === "delete") handleDelete(record);
                        },
                    }}
                >
                <div onContextMenu={(event) => {
                    if (!event.target.closest("tr[data-row-key]")) setContextRecord(null);
                }}>
                <Table
                    onRow={(record) => ({
                        onContextMenu: (event) => {
                            event.preventDefault();
                            setContextRecord(record);
                        },
                    })}
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
                </div>
                </Dropdown>
            </ConfigProvider>
        </div>
    );
};

export default RequirementTable;
