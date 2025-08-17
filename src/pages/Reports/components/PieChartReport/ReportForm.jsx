import {Button, Card, Col, Form, Row, Select, Switch} from "antd";

const stateOptions = [
    {value: 10, label: 'تهیه نشده'},
    {value: 20, label: 'تهیه کننده'},
    {value: 30, label: 'تایید'},
    {value: 40, label: 'تصویب'},
];

export const ReportForm = ({onFinish, loading}) => {
    const [form] = Form.useForm();

    const onFinishForm = (values) => {
        onFinish({
            with_children: values.with_children,
            states: values.states,
        });
    };

    return (
        <Card>
            <Form
                form={form}
                layout="vertical"
                initialValues={{with_children: true, states: [10, 20, 30, 40]}}
                onFinish={onFinishForm}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="states" label="وضعیت‌ها">
                            <Select
                                mode="multiple"
                                allowClear
                                placeholder="لطفا وضعیت‌ها را انتخاب کنید"
                                options={stateOptions}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item
                            name="with_children"
                            valuePropName="checked"
                            label="با زیرمجموعه‌ها"
                        >
                            <Switch/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={4} style={{paddingTop: '30px'}}>
                        <Button htmlType="submit" type="primary" loading={loading}>
                            اعمال فیلتر
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};
