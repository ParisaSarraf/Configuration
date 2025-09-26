import {Button, Form, message, Modal, Select, Space, Table, Tooltip} from "antd";
import {useProductSerialById} from "@/QueryServises/productSerialQuery/index.js";
import {useProductDocumentEditionLogsBySerialById} from "@/QueryServises/productDocumentQuery/index.js";
import {ProductDocumentListSerialCol} from "./components/ProductDocumentListSerialCol";
import {useDeleteProductEditionlog} from "@/QueryServises/productDocumentEditionLogQuery/index.js";
import {DeleteOutlined, EditOutlined, EyeFilled} from "@ant-design/icons";
import {georgianDateToJalaliDate} from "@utils/timeTool.jsx";

const ProductDocumentListSerial = ({
                                       currentProduct,
                                       serialId,
                                       setSerialId,
                                       refetchSerialId,
                                       setModal,
                                       setSerialLabel
                                   }) => {
    const {data: ProductSerialList} = useProductSerialById(currentProduct?.id);
    const {mutateAsync: deleteProductEditionlog} = useDeleteProductEditionlog();
    const {data: ProductDocumentData} = useProductDocumentEditionLogsBySerialById(serialId);

    const serials = ProductSerialList?.serials || [];

    const tableData = ProductDocumentData?.map(product => ({
        ...product,
        key: product.id,
    })) || [];

    const SerialListOption = serials.map(serial => ({
        value: serial.id,
        label: serial.serial || `سریال ${serial.id}`
    }));

    const handleEditLogEdition = (logRecord) => {
        setModal({mode: 'edit', data: logRecord, type: 'AddLogEdition'});
    };

    const handleDeleteLogEdition = async (logRecord) => {
        Modal.confirm({
            title: "حذف لاگ",
            content: "از حذف این لاگ مطمئن هستید؟",
            okText: "بله، مطمئنم",
            cancelText: "خیر، منصرف شدم.",
            async onOk() {
                try {
                    await deleteProductEditionlog(logRecord.id);
                    message.success("لاگ با موفقیت حذف شد");
                    await refetchSerialId();
                } catch (error) {
                    message.error(error?.detail);
                    console.error(error);
                }
            },
            onCancel() {
                message.warning("عملیات حذف لغو شد");
            }
        });
    };

    const handleShowDetailEdiotnLog = async (logRecord) => {
        setModal({mode: 'view', data: logRecord, type: 'EditionDetailView'});
    };

    const expandedRowRender = (productRecord) => {
        const documentColumns = [
            {title: 'عنوان سند', dataIndex: 'title', key: 'title'},
            {title: 'کد', key: 'code', render: (doc) => doc.document?.code},
            {title: 'نام فارسی', key: 'persianTitle', render: (doc) => doc.document?.persianTitle},
            {title: 'تاریخ بازبینی', dataIndex: 'survey_date', key: 'survey_date'},
        ];

        const documentData = productRecord.documents?.map(doc => ({...doc, key: doc.id})) || [];

        const renderEditions = (documentRecord) => {
            const editionColumns = [
                {title: 'نسخه', dataIndex: 'edition', key: 'edition'},
                {title: 'وضعیت', dataIndex: 'state', key: 'state'},
                {title: 'توضیحات', dataIndex: 'description', key: 'description'},
                {
                    title: 'فایل',
                    dataIndex: 'file_1',
                    key: 'file_1',
                    render: (fileUrl) => fileUrl ?
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">مشاهده</a> : 'ندارد',
                },
            ];
            const editionData = documentRecord.editions?.map(e => ({...e, key: e.id})) || [];

            const renderLogs = (editionRecord) => {
                const logColumns = [
                    {
                        title: 'تاریخ بازبینی', dataIndex: 'survey_date', key: 'survey_date', render: (survey_date) => {
                            georgianDateToJalaliDate(survey_date)
                        }
                    },
                    {title: 'وضعیت', dataIndex: 'status', key: 'status'},
                    {title: 'سریال', dataIndex: ['product_serial', 'serial'], key: 'serial'},
                    {
                        title: "عملیات",
                        key: "actions",
                        render: (_, logRecord) => (
                            <Space>
                                <Tooltip title="ویرایش لاگ">
                                    <Button
                                        icon={<EditOutlined/>}
                                        className="text-green-500 border-green-500"
                                        onClick={() => handleEditLogEdition(logRecord)}
                                    />
                                </Tooltip>
                                <Tooltip title="حذف لاگ">
                                    <Button
                                        icon={<DeleteOutlined/>}
                                        danger
                                        onClick={() => handleDeleteLogEdition(logRecord)}
                                    />
                                </Tooltip>
                                <Tooltip title="نمایش جزئیات لاگ">
                                    <Button
                                        icon={<EyeFilled/>}
                                        className="text-sky-500 border-sky-500"
                                        onClick={() => handleShowDetailEdiotnLog(logRecord)}
                                    />
                                </Tooltip>
                            </Space>
                        ),
                    },
                ];
                const logData = editionRecord.logs?.map(l => ({...l, key: l.id})) || [];
                return <Table columns={logColumns} dataSource={logData} pagination={false} size="small"/>;
            };

            return (
                <Table
                    columns={editionColumns}
                    dataSource={editionData}
                    pagination={false}
                    size="small"
                    expandable={{
                        expandedRowRender: renderLogs,
                        rowExpandable: record => record.logs && record.logs.length > 0,
                    }}
                />
            );
        };

        return (
            <Table
                columns={documentColumns}
                dataSource={documentData}
                pagination={false}
                size="small"
                expandable={{
                    expandedRowRender: renderEditions,
                    rowExpandable: record => record.editions && record.editions.length > 0,
                }}
            />
        );
    };

    return (
        <>
            <Form.Item label={`سریال های ${currentProduct?.name}`} layout="vertical" className="">
                <Select
                    className="w-full"
                    options={SerialListOption}
                    onChange={(value, option) => {
                        setSerialId(value);
                        setSerialLabel(option.label);
                    }}
                    placeholder="انتخاب سریال"
                />
            </Form.Item>
            <Table
                title={() => `اسناد log ${currentProduct?.name} و زیرمجموعه ها`}
                bordered
                dataSource={tableData}
                columns={ProductDocumentListSerialCol}
                size="small"
                pagination={{pageSize: 3}}
                expandable={{
                    expandedRowRender,
                    rowExpandable: record => record.documents && record.documents.length > 0,
                }}
                locale={{emptyText: 'باید یک سریال انتخاب کنید'}}
            />
        </>
    );
};

export default ProductDocumentListSerial;