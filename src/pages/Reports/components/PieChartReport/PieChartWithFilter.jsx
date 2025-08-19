import {useCallback, useState} from 'react';
import {Button, Card, Checkbox, Col, Form, Input, message, Row, Select, Space} from 'antd';
import {FilterOutlined, ReloadOutlined} from '@ant-design/icons';
import PieChartReport from './PieChartReport';
import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import {useDocumentList} from "@/QueryServises/documentQuery/index.js";
import TS from "@/components/TreeSelect/index.jsx";

const {Option} = Select;

const PieChartWithFilter = () => {
    const {currentProduct} = useProductContext();
    const [form] = Form.useForm();
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(false);
    const {data: documentList} = useDocumentList();


    const handleFinish = useCallback(async (values) => {
        setLoading(true);
        try {
            const formattedFilters = {
                ...values,
                document_tree_id: values.document_tree_id || null,
                states: values.states ? values.states.join(',') : undefined,
                with_children: values.with_children !== undefined ? values.with_children : true,

            };

            Object.keys(formattedFilters).forEach(key => {
                if (formattedFilters[key] === undefined || formattedFilters[key] === '') {
                    delete formattedFilters[key];
                }
            });

            setFilters(formattedFilters);
            message.success('فیلترها اعمال شدند');
        } catch (error) {
            message.error('خطا در اعمال فیلترها');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleReset = useCallback(() => {
        form.resetFields();
        setFilters({});
        message.info('فیلترها بازنشانی شدند');
    }, [form]);


    // const handleExport = useCallback(() => {
    //     // منطق خروجی گرفتن از داده‌ها
    //     message.info('امکان خروجی در حال توسعه است');
    // }, []);

    const stateOptions = [
        {value: 10, label: 'تهیه'},
        {value: 20, label: 'تصویب'},
        {value: 30, label: 'تصدیق'},
    ];


    return (
        <div>
            <Card
                title="فیلترهای گزارش ویرایش‌ها"
                style={{marginBottom: 24}}
                extra={
                    <Space>
                        {/*<Button*/}
                        {/*    icon={<DownloadOutlined/>}*/}
                        {/*    onClick={handleExport}*/}
                        {/*>*/}
                        {/*    خروجی*/}
                        {/*</Button>*/}
                        <Button
                            icon={<ReloadOutlined/>}
                            onClick={handleReset}
                            disabled={loading}
                        >
                            بازنشانی
                        </Button>
                        <Button
                            type="primary"
                            icon={<FilterOutlined/>}
                            onClick={() => form.submit()}
                            loading={loading}
                        >
                            اعمال فیلتر
                        </Button>
                    </Space>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{
                        with_children: true,
                    }}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item
                                name="document_tree_id"
                                label=" درخت اسناد"
                            >
                                <TS data={documentList} placeholder="اسناد"/>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item
                                name="files_number"
                                label="تعداد فایل‌ها"
                            >
                                <Input
                                    placeholder="مثال: 5"
                                    allowClear
                                    type="number"
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item
                                name="states"
                                label="وضعیت‌ها"
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="انتخاب وضعیت‌ها"
                                    allowClear
                                    maxTagCount="responsive"
                                >
                                    {stateOptions.map(option => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Form.Item
                                name="with_children"
                                valuePropName="checked"
                                label="گزینه‌های نمایش"
                            >
                                <Checkbox>نمایش اسناد فرزند</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <PieChartReport currentProduct={currentProduct} filters={filters}/>
        </div>
    );
};

export default PieChartWithFilter;