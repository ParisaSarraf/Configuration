import { Form, Layout, Select, Table } from "antd"
import { useProductSerialById } from "../../../../QueryServises/productSerialQuery"
import { useProductDocumentEditionLogsBySerialById } from "../../../../QueryServises/productDocumentQuery";
import ProductDocumentListSerialCol from "./components/ProductDocumentListSerialCol";

const ProductDocumentListSerial = ({ currentProduct, serialId, setSerialId }) => {
    const { data: ProductSerialList } = useProductSerialById(currentProduct?.id);
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
                columns={ProductDocumentListSerialCol()}
                size="small"
                loading={!ProductDocumentEditionLogsBySerialData}
            />
        </>
    )
}

export default ProductDocumentListSerial