import {Form, Input} from "antd";

// دیگر پراپ handleSend را دریافت نمی‌کنیم
const RequestOfWarehouseCol = () => {
    return [
        {
            title: 'عنوان محصول',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'تعداد کل',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text) => text || 'ندارد'
        },
        {
            title: 'تعداد مورد تایید',
            render: (_, record) => (
                <Form.Item
                    name={["confirmed_number", record.id]}
                    className="mb-0"
                    rules={[
                        {
                            validator: (_, value) => {
                                if (value && value < 0) {
                                    return Promise.reject('تعداد نمی‌تواند منفی باشد');
                                }
                                // اطمینان از اینکه ورودی عدد است (اختیاری)
                                if (value && !/^\d+$/.test(value)) {
                                    return Promise.reject('لطفا فقط عدد وارد کنید');
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input type="number" min={0} placeholder="تعداد را وارد کنید"/>
                </Form.Item>
            )
        },
        // ستون عملیات به طور کامل حذف شده است که صحیح است
    ];
};

export default RequestOfWarehouseCol;