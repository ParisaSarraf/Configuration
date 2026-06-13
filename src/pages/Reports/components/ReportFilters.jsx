import { Button, Card, Checkbox, Col, Form, Row, Select, Space } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import TS from "@/components/TreeSelect/index.jsx";
import { useUserList } from "../../../QueryServises/userQuery";
import Date from "@/components/DatePicker/Date.jsx";

const { Option } = Select;

const ReportFilters = ({ form, onFinish, onReset, loading, documentList }) => {
  const { data: userList } = useUserList();

  return (
    <Card
      title="فیلترهای گزارش"
      style={{ marginBottom: 24 }}
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={onReset}
            disabled={loading}
          >
            بازنشانی
          </Button>
          <Button
            type="primary"
            icon={<FilterOutlined />}
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
        onFinish={onFinish}
        initialValues={{ with_children: true }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="document_tree_id" label="درخت اسناد">
              <TS data={documentList} placeholder="اسناد" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name="user_id" label="کاربر">
              <Select
                placeholder="انتخاب کاربر"
                allowClear
                maxTagCount="responsive"
              >
                {userList?.map((option) => (
                  <Option key={option.id} value={option.id}>
                    {option.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Date
              name="start_survey_date"
              label="تاریخ شروع"
              stringifyDate={true}
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Date
              name="end_survey_date"
              label="تاریخ پایان"
              stringifyDate={true}
            />
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
  );
};

export default ReportFilters;
