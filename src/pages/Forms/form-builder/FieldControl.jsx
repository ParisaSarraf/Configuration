/* eslint-disable react/prop-types */
import {
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Rate,
  Select,
  Upload,
} from "antd";
import { FileUp } from "lucide-react";

const { TextArea } = Input;

export default function FieldControl({ field, interactive = false }) {
  const commonProps = interactive ? {} : { tabIndex: -1 };

  switch (field.type) {
    case "longText":
      return <TextArea {...commonProps} rows={3} placeholder={field.placeholder} maxLength={field.maxLength} />;
    case "select":
      return (
        <Select
          {...commonProps}
          className="field-control-wide"
          placeholder={field.placeholder || "انتخاب کنید"}
          options={(field.options || []).map((option) => ({ label: option, value: option }))}
          open={interactive ? undefined : false}
        />
      );
    case "checkbox":
      return <Checkbox {...commonProps}>بله، تأیید می‌کنم</Checkbox>;
    case "file":
      return (
        <Upload.Dragger
          className="field-upload"
          beforeUpload={() => false}
          showUploadList={false}
          openFileDialogOnClick={interactive}
        >
          <FileUp size={17} />
          <span>فایل را اینجا رها کنید یا <b>انتخاب کنید</b></span>
          <small>PDF، DOCX یا تصویر تا ۱۰ مگابایت</small>
        </Upload.Dragger>
      );
    case "number":
      return (
        <InputNumber
          {...commonProps}
          placeholder={field.placeholder}
          min={field.min || undefined}
          max={field.max || undefined}
          addonAfter={field.suffix || undefined}
        />
      );
    case "rating":
      return <Rate {...commonProps} count={field.maxRating || 5} />;
    case "date":
      return <DatePicker {...commonProps} className="field-control-wide" placeholder={field.placeholder} />;
    default:
      return <Input {...commonProps} placeholder={field.placeholder} maxLength={field.maxLength} />;
  }
}
