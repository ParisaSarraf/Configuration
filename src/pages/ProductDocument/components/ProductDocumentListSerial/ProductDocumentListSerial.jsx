import {Form, message, Modal, Select, Table} from "antd"
import {useProductSerialById} from "@/QueryServises/productSerialQuery/index.js"
import {useProductDocumentEditionLogsBySerialById} from "@/QueryServises/productDocumentQuery/index.js";
import ProductDocumentListSerialCol from "./components/ProductDocumentListSerialCol";
import {useDeleteProductEditionlog} from "@/QueryServises/productDocumentEditionLogQuery/index.js";

const ProductDocumentListSerial = (
    {
        currentProduct,
        serialId,
        setSerialId,
        refetchSerialId,
        setModal,
        setSerialLabel
    }) => {

    const {data: ProductSerialList} = useProductSerialById(currentProduct?.id);
    const {mutateAsync: deleteProductEditionlog} = useDeleteProductEditionlog();

    const {data: ProductDocumentEditionLogsBySerialData} = useProductDocumentEditionLogsBySerialById(serialId);
    const serials = ProductSerialList?.serials || [];
    const tableData = ProductDocumentEditionLogsBySerialData?.map(item => ({
        key: item.id,
        mainKey: item.product_document_edition.product_document.document.code + " - " + item.product_serial.serial,
        product: item.product_document_edition.product_document.product,
        document: item.product_document_edition.product_document.document,
        data: item
    })) || [];

    const SerialListOption = serials.map(serial => ({
        value: serial.id,
        label: serial.serial || `سریال ${serial.id}`
    }));


    const handleEditLogEdition = (record) => {
        setModal({mode: 'edit', data: record, type: 'AddLogEdition'})
    }

    const handleDeleteLogEdition = async (record) => {
        Modal.confirm({
            title: "حذف نسخه",
            content: "از حذف این نسخه مطمئن هستید؟",
            okText: "بله ، مطمئنم",
            cancelText: "خیر ، منصرف شدم.",
            async onOk() {
                try {
                    await deleteProductEditionlog(record?.key)
                    message.success("نسخه با موفقیت حذف شد");
                    await refetchSerialId()
                } catch (error) {
                    message.error(error?.detail);
                    console.error(error);
                }
            },
            onCancel() {
                message.warning("عملیات حذف لغو شد");
            }
        });
    }


    const handleShowDetailEdiotnLog = async (record) => {
        setModal({mode: 'view', data: record, type: 'EditionDetailView'})
    }

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
                columns={ProductDocumentListSerialCol({
                    handleDeleteLogEdition,
                    handleEditLogEdition,
                    handleShowDetailEdiotnLog
                })}
                size="small"
                pagination={
                    {pageSize: 3}
                }
                // loading={!ProductDocumentEditionLogsBySerialData}
                locale={{emptyText: 'باید یک سریال انتخاب کنید'}}
            />


        </>
    )
}

export default ProductDocumentListSerial