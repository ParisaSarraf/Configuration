import { Form } from "antd";
import DatepickerCustom from "@/components/DatePicker/index.jsx";

const Date = ({
  label,
  name,
  isRequired = false,
  rules = [],
  stringifyDate = false,
  onlyYearPicker = false,
}) => {
  const form = Form.useFormInstance();
  const handleDate = (date) => {
    if (onlyYearPicker) {
      return `${date?.year}`;
    }
    return `${date?.year}-${String(date?.month?.number).padStart(2, 0)}-${String(date?.day).padStart(2, 0)}`;
  };
  const handleOnChange = (date) => {
    form.setFieldsValue({
      [`${name}`]: stringifyDate ? handleDate(date) : date,
    });
  };
  return (
    <div className="flex flex-col gap-2">
      <p
        className={`w-max ${
          isRequired
            ? 'relative after:absolute after:top-0 after:-left-2 after:content-["*"] after:text-red-500 after:block'
            : ""
        }`}
      >
        {label}
      </p>
      <Form.Item
        name={name}
        rules={[
          isRequired && { required: true, message: "فیلد ضروری" },
          ...rules,
        ]}
      >
        <DatepickerCustom
          onChange={handleOnChange}
          onlyYearPicker={onlyYearPicker}
        />
      </Form.Item>
    </div>
  );
};

export default Date;
