import {Button, Col, Form, message, Row, Table, Tooltip} from "antd";
import {useState} from "react"; // 👈 افزودن useState
import {
    useConfirmProductPurchaseById,
    useCreateProductPurchaseNumber,
    useProductPurchaseById
} from "@/QueryServises/productPurchase/index.js";
import RequestOfWarehouseCol from "./RequestOfWarehouseCol";
import {SendOutlined} from "@ant-design/icons";
import {usePersonalityProductList} from "@/QueryServises/personalityQuery/index.js";
import TS from "@/components/TreeSelect/index.jsx";

const RequestOfWarehouse = ({selectedPurchaseId, selectedPurchaseType, currentProduct, refetchUnconfirmed}) => {


    const [selectedPersonalityFilters, setSelectedPersonalityFilters] = useState([]);
    const [form] = Form.useForm();

    const isArray = Array.isArray(selectedPurchaseType);
    const hasConstruction = isArray
        ? selectedPurchaseType?.some(item => item.purchase_type === "construction")
        : selectedPurchaseType?.purchase_type === "construction";

    const constructionParam = hasConstruction ? true : {};

    const personalityIdsParam = selectedPersonalityFilters
        .map(item => item.value)
        .join(',');

    const {
        data: purchaseData,
        refetch: refetchPurchaseData
    } = useProductPurchaseById(selectedPurchaseId, constructionParam, personalityIdsParam);


    const {mutateAsync: createProductPurchaseNumber} = useCreateProductPurchaseNumber();
    const {refetch: refetchConfirmed} = useConfirmProductPurchaseById(currentProduct?.id)
    const {data: personalityData} = usePersonalityProductList()

    const handlePersonalityChange = (value) => {
        setSelectedPersonalityFilters(value);
    };


    const handleSend = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            const confirmedNumbers = values.confirmed_number || {};
            const payloads = Object.entries(confirmedNumbers)
                .filter(([productId, number]) => number !== undefined && number !== null && number !== "" && Number(number) > 0)
                .map(([productId, number]) => ({
                    product_purchase_id: selectedPurchaseId,
                    product_id: parseInt(productId, 10),
                    confirmed_number: Number(number),
                }));
            if (payloads.length === 0) {
                message.error("برای ارسال، باید حداقل برای یک محصول تعداد معتبر (بزرگتر از صفر) وارد کنید.");
                return;
            }
            await createProductPurchaseNumber(payloads);
            message.success("تعدادهای مورد تایید با موفقیت ارسال شدند.");
            form.resetFields();
            await refetchPurchaseData();
            await refetchUnconfirmed();
            await refetchConfirmed();
        } catch (errorInfo) {
            console.error("خطا در اعتبارسنجی یا ارسال:", errorInfo);
            if (!errorInfo.errorFields) {
                message.error("خطا در ارسال اطلاعات به سرور.");
            }
        }
    };

    return (
        <Form form={form} initialValues={{confirmed_number: {}}}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <div className={'w-full flex flex-row gap-2'}>
                        <div className={'w-full flex flex-col'}>
                            <TS
                                labelInValue
                                data={personalityData}
                                placeholder="هویت ها"
                                treeCheckable={true}
                                value={selectedPersonalityFilters}
                                onChange={handlePersonalityChange}
                            />
                        </div>
                    </div>
                </Col>
                <Col span={24}>
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
                        columns={RequestOfWarehouseCol()}
                        dataSource={purchaseData}
                        rowKey="id"
                        size={'small'}
                        bordered
                        scroll={{y: 300}}
                        pagination={false}
                    />
                </Col>
            </Row>
        </Form>
    );
};

export default RequestOfWarehouse;