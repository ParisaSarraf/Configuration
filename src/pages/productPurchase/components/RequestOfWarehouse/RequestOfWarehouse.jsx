import {Button, Col, Form, message, Row, Tooltip} from "antd";
import {useEffect, useState} from "react";
import {
    useConfirmProductPurchaseById,
    useCreateProductPurchaseNumber,
    useProductPurchaseById
} from "@/QueryServises/productPurchase/index.js";
import RequestOfWarehouseCol from "./RequestOfWarehouseCol";
import {ReloadOutlined, SendOutlined} from "@ant-design/icons";
import {usePersonalityProductList} from "@/QueryServises/personalityQuery/index.js";
import TS from "@/components/TreeSelect/index.jsx";
import { TableAntd } from "../../../../components/TableAntd/TableAntd";

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

    // جدول به‌صورت کلاینتی pagination می‌شود، یعنی فقط ردیف‌های صفحه‌ی جاری mount هستند.
    // برای اینکه مقدار تمام ردیف‌ها (حتی صفحاتی که دیده نشده‌اند) در store فرم ثبت شود،
    // به محض تغییر داده، مقدار پیش‌فرض همه‌ی ردیف‌ها را در فرم ست می‌کنیم.
    useEffect(() => {
        if (purchaseData?.length) {
            form.setFieldsValue({
                confirmed_number: Object.fromEntries(
                    purchaseData.map((item) => [item.id, item.quantity]),
                ),
            });
        } else {
            form.resetFields();
        }
    }, [purchaseData, form]);

    const handleSend = async () => {
        try {
            await form.validateFields();
            // آرگومان true یعنی مقادیر تمام فیلدها (حتی ردیف‌های صفحات دیگر که در حال حاضر
            // mount نیستند) برگردانده شود، نه فقط فیلدهای صفحه‌ی جاری.
            const values = form.getFieldsValue(true);
            const confirmedNumbers = values.confirmed_number || {};
            const validProductIds = new Set((purchaseData || []).map((item) => item.id));
            const payloads = Object.entries(confirmedNumbers)
                .filter(([productId, number]) =>
                    validProductIds.has(Number(productId)) &&
                    number !== undefined && number !== null && number !== "" && Number(number) > 0,
                )
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

    const handleResetAllToZero = () => {
        if (!purchaseData?.length) return;
        form.setFieldsValue({
            confirmed_number: Object.fromEntries(
                purchaseData.map((item) => [item.id, 0]),
            ),
        });
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
                    <TableAntd
                        footer={() => (
                            <div style={{textAlign: 'left', display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
                                <Tooltip title="صفر کردن تعداد مورد تایید همه ردیف‌ها (در همه صفحات)">
                                    <Button
                                        icon={<ReloadOutlined/>}
                                        onClick={handleResetAllToZero}
                                    >
                                        صفر کردن همه
                                    </Button>
                                </Tooltip>
                                <Tooltip title="تایید نهایی و ارسال همه موارد (در همه صفحات)">
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
                    />
                </Col>
            </Row>
        </Form>
    );
};

export default RequestOfWarehouse;