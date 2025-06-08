import { message, Table, Form } from "antd";
import { useCreateProductPurchaseNumber, useProductPurchaseById } from "../../../../QueryServises/productPurchase";
import RequestOfWarehouseCol from "./RequestOfWarehouseCol";

const RequestOfWarehouse = ({ selectedPurchaseId }) => {
    const { data: purchaseData, refetch } = useProductPurchaseById(selectedPurchaseId);
    const { mutateAsync: createProductPurchaseNumber } = useCreateProductPurchaseNumber();
    const [form] = Form.useForm();

    const handleSend = async (productId) => {
        try {
            const values = await form.validateFields();
            const confirmedNumbers = values.confirmed_number || {};

            // فقط مقدار مربوط به محصولی که دکمه آن کلیک شده است را پردازش می‌کنیم
            if (confirmedNumbers[productId] !== undefined && confirmedNumbers[productId] !== null && confirmedNumbers[productId] !== "") {
                const payload = {
                    product_purchase_id: selectedPurchaseId,
                    product_id: productId,
                    confirmed_number: confirmedNumbers[productId]
                };

                await createProductPurchaseNumber([payload]);
                message.success("تعداد مورد تایید با موفقیت ارسال شد");
                refetch();
                form.resetFields([['confirmed_number', productId]]);
            } else {
                message.warning("لطفا تعداد مورد تایید را وارد کنید");
            }
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