import {message, Table, Form, Button, Tooltip} from "antd";
import {SendOutlined} from "@ant-design/icons";
import {
    useCreateRequestOfWarehouseNumber,
    useGetConfirmedWarehouseRequestById,
    useGetSupplyListForWareById,
    useGetUnConfirmedWareRequestById,
} from "@/QueryServises/RequestOfWarehouse/index.js";
import RequestOfWarehousePageCol
    from "@/pages/RequestOfWarehouse/components/RequestOfWarehousePage/RequestOfWarehousePageCol.jsx";
import {useConfirmProductPurchaseById} from "@/QueryServises/productPurchase/index.js";

const RequestOfWarehousePage = ({selectedWareHouseId, selectedWareHouseType, currentProduct, refetchUnconfirmed}) => {

    const isArray = Array.isArray(selectedWareHouseType);
    const hasConstruction = isArray
        ? selectedWareHouseType.some(item => item.request_type === "construction")
        : selectedWareHouseType?.request_type === "construction";

    const constructionParam = hasConstruction ? true : {};


    const {
        data: requestOfWareHouseData,
        refetch: refetchWareHouseData
    } = useGetSupplyListForWareById(selectedWareHouseId, constructionParam);
    const {mutateAsync: createRequestOfWareHouseNumber} = useCreateRequestOfWarehouseNumber();
    const {refetch: refetchConfirmed} = useGetConfirmedWarehouseRequestById(currentProduct?.id)
    const [form] = Form.useForm();

    const handleSend = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            const confirmedNumbers = values.confirmed_number || {};
            const payloads = Object.entries(confirmedNumbers)
                .filter(([productId, number]) => number !== undefined && number !== null && number !== "" && Number(number) > 0)
                .map(([productId, number]) => ({
                    ware_house_request_id: selectedWareHouseId,
                    product_id: parseInt(productId, 10),
                    confirmed_number: Number(number),
                }));
            if (payloads.length === 0) {
                message.error("برای ارسال، باید حداقل برای یک محصول تعداد معتبر (بزرگتر از صفر) وارد کنید.");
                return;
            }
            await createRequestOfWareHouseNumber(payloads);
            message.success("تعدادهای مورد تایید با موفقیت ارسال شدند.");
            await refetchWareHouseData();
            await refetchUnconfirmed();
            await refetchConfirmed();
            form.resetFields();
        } catch (errorInfo) {
            console.error("خطا در اعتبارسنجی یا ارسال:", errorInfo);
            if (!errorInfo.errorFields) {
                message.error("خطا در ارسال اطلاعات به سرور.");
            }
        }
    };

    return (
        <Form form={form} initialValues={{confirmed_number: {}}}>
            <Table
                footer={() => (
                    <div style={{textAlign: 'left'}}>
                        <Tooltip title="تایید نهایی و ارسال همه موارد">
                            <Button
                                type="primary"
                                icon={<SendOutlined/>}
                                onClick={handleSend}
                            >
                                تایید نهایی
                            </Button>
                        </Tooltip>
                    </div>
                )}
                columns={RequestOfWarehousePageCol()}
                dataSource={requestOfWareHouseData}
                rowKey="id"
                size={'small'}
                scroll={{y: 300}}
                pagination={false}
                bordered
            />
        </Form>
    );
};

export default RequestOfWarehousePage;