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
        // console.log(values);
        const payload = {
            with_children: values.with_children,
            // document_tree_id: values.document_tree_id,
            states: values.states?.join(','),
        };
        onFinish(payload);

        // console.log(payload);
    };

    return (
        <Card>
            <Form
                className={'w-full'}
                form={form}
                layout="vertical"
                onFinish={onFinishForm}
                initialValues={{with_children: true, states: [10, 20, 30, 40]}}
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
                    {/*<Col xs={24} sm={12} md={8}>*/}
                    {/*    <Form.Item name="document_tree_id" label=" درخت اسناد ">*/}
                    {/*        /!*<Select options={}/>*!/*/}
                    {/*    </Form.Item>*/}
                    {/*</Col>*/}
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item name="with_children" label="با زیرمجموعه‌ها" valuePropName="checked">
                            <Switch/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={4} style={{paddingTop: '30px'}}>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            اعمال فیلتر
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};