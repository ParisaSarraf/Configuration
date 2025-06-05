import { message, Table, Form } from "antd";
import { useCreateProductPurchaseNumber, useProductPurchaseById } from "../../../../QueryServises/productPurchase";
import RequestOfWarehouseCol from "./RequestOfWarehouseCol";

const RequestOfWarehouse = ({ selectedPurchaseId, currentProduct }) => {
    const { data: purchaseData, refetch } = useProductPurchaseById(selectedPurchaseId);
    const { mutateAsync: createProductPurchaseNumber } = useCreateProductPurchaseNumber();
    const [form] = Form.useForm();

    const handleSend = async () => {
        try {
            const values = await form.validateFields();
            const confirmedNumbers = values.confirmed_number || {};
            const payloads = Object.entries(confirmedNumbers)
                .map(([key, value]) => ({
                    product_purchase_id: key,
                    product_id: currentProduct.id,
                    confirmed_number: value
                }))
                .filter(payload =>
                    payload.confirmed_number !== undefined &&
                    payload.confirmed_number !== null &&
                    payload.confirmed_number !== ""
                );

            if (payloads.length === 0) {
                message.warning("هیچ مقدار معتبری برای ارسال وجود ندارد");
                return;
            }

            for (const payload of payloads) {
                await createProductPurchaseNumber([payload]);
            }
            message.success("تعداد مورد تایید با موفقیت ارسال شد");
            refetch();
            form.resetFields()
        } catch (error) {
            message.error("خطا در ارسال اطلاعات");
            console.error(error);

        }
    };

    return (
        <Form form={form}>
            <Table
                columns={RequestOfWarehouseCol({ handleSend })}
                dataSource={purchaseData}
                pagination={{ pageSize: 3 }}
                rowKey="id"
            />
        </Form>
    );
};

export default RequestOfWarehouse;