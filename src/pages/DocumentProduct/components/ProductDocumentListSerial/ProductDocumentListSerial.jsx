import { Form, Layout, message, Modal, Select, Table } from "antd"
import { useProductSerialById } from "../../../../QueryServises/productSerialQuery"
import { useProductDocumentEditionLogsBySerialById } from "../../../../QueryServises/productDocumentQuery";
import ProductDocumentListSerialCol from "./components/ProductDocumentListSerialCol";
import { useDeleteProductEditionlog } from "../../../../QueryServises/productDocumentEditionLogQuery";

const ProductDocumentListSerial = ({ currentProduct, serialId, setSerialId, refetchSerialId, setModal }) => {
    const { data: ProductSerialList } = useProductSerialById(currentProduct?.id);
    const { mutateAsync: deleteProductEditionlog } = useDeleteProductEditionlog();

    const { data: ProductDocumentEditionLogsBySerialData } = useProductDocumentEditionLogsBySerialById(serialId);
    const serials = ProductSerialList?.serials || [];

    const tableData = ProductDocumentEditionLogsBySerialData?.map(item => ({
        key: item.id,
        product: item.product_serial.product,
        edition: item.product_document_edition.edition,
        survey_date: item.survey_date,
        status: item.status,
        serial: item.product_serial.serial
    })) || [];

    const SerialListOption = serials.map(serial => ({
        value: serial.id,
        label: serial.serial || `سریال ${serial.id}`
    }));

    const handleEditLogEdition = (record) => {
        setModal({ mode: 'edit', data: record, type: 'AddLogEdition' })
    }

    const handleDeleteLogEdition = (record) => {
        Modal.confirm({
            title: "حذف نسخه",
            content: "از حذف این نسخه مطمئن هستید؟",
            okText: "بله ، مطمئنم",
            cancelText: "خیر ، منصرف شدم.",
            onOk() {
                try {
                    deleteProductEditionlog(record?.key)
                    message.success("نسخه با موفقیت حذف شد");
                    // refetchSerialId()
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

    return (
        <>
            <Form.Item label={`سریال های ${currentProduct?.name}`} layout="vertical" className="">
                <Select
                    className="w-full"
                    options={SerialListOption}
                    onChange={(e) => setSerialId(e)}
                    placeholder="انتخاب سریال"
                />
            </Form.Item>
            <Table
                title={() => `اسناد log ${currentProduct?.name} و زیرمجموعه ها`}
                bordered
                dataSource={tableData}
                columns={ProductDocumentListSerialCol({ handleDeleteLogEdition, handleEditLogEdition })}
                size="small"
                // loading={!ProductDocumentEditionLogsBySerialData}
                locale={{ emptyText: 'باید یک سریال انتخاب کنید' }}
            />
        </>
    )
}

export default ProductDocumentListSerial