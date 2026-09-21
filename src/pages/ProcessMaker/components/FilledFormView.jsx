import { useMemo } from "react";
import { Alert, Empty, Skeleton, Tag } from "antd";
import { DownloadOutlined, PaperClipOutlined } from "@ant-design/icons";
import {
 EMPTY_VALUE,
 buildOrphanFields,
 buildSections,
 fieldKeyCandidates,
 fieldLabel,
 fieldType,
 fileName,
 fileUrl,
 formatFieldValue,
 isEmptyValue,
 isFileField,
 isFullWidthField,
 isImageField,
 isMultilineField,
 isStaticField,
 isTableField,
 resolveFieldEntry,
} from "@/Services/forms/formSubmissionView";

/* ------------------------------------------------------------ small pieces */

const ValueBox = ({ children, className = "" }) => (
 <div
 className={`min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 ${className}`}
 >
 {children}
 </div>
);

const StaticBlock = ({ field }) => {
 const type = fieldType(field);
 const text =
 field?.text ?? field?.content ?? field?.label ?? field?.title ?? "";

 if (type === "divider" || type === "separator" || type === "hr") {
 return <div className="my-1 h-px w-full bg-slate-200 " />;
 }
 if (type === "spacer" || type === "space") return <div className="h-3" />;
 if (type === "alert" || type === "note") {
 return <Alert type="info" showIcon message={text} className="rounded-xl" />;
 }
 if (
 type === "heading" ||
 type === "header" ||
 type === "title" ||
 type === "section-title" ||
 type === "subtitle"
 ) {
 return (
 <h4 className="text-sm font-bold text-slate-800 ">
 {text}
 </h4>
 );
 }
 return (
 <p className="whitespace-pre-line text-xs leading-6 text-slate-500 ">
 {text}
 </p>
 );
};

const FileList = ({ files }) => {
 const list = Array.isArray(files) ? files : [files];
 if (!list.length) return <ValueBox>{EMPTY_VALUE}</ValueBox>;
 return (
 <ValueBox className="space-y-2">
 {list.map((file, index) => {
 const url = fileUrl(file);
 const name = fileName(file);
 return url ? (
 <a
 key={`${name}-${index}`}
 href={url}
 target="_blank"
 rel="noreferrer"
 className="flex items-center gap-2 text-amber-600 hover:underline "
 >
 <PaperClipOutlined />
 <span className="truncate">{name}</span>
 <DownloadOutlined className="text-xs" />
 </a>
 ) : (
 <span key={`${name}-${index}`} className="flex items-center gap-2">
 <PaperClipOutlined />
 {name}
 </span>
 );
 })}
 </ValueBox>
 );
};

const SubTable = ({ rows, field }) => {
 const list = Array.isArray(rows) ? rows : [];
 const columns = useMemo(() => {
 const defined = Array.isArray(field?.columns) ? field.columns : [];
 if (defined.length) {
 return defined.map((column) => ({
 key: String(
 column?.name ?? column?.key ?? column?.dataIndex ?? column?.id ?? "",
 ),
 label: fieldLabel(column),
 field: column,
 }));
 }
 const keys = new Set();
 list.forEach((row) => {
 if (row && typeof row === "object" && !Array.isArray(row)) {
 Object.keys(row).forEach((key) => keys.add(key));
 }
 });
 return [...keys].map((key) => ({ key, label: key, field: { name: key } }));
 }, [field, list]);

 if (!list.length) return <ValueBox>{EMPTY_VALUE}</ValueBox>;
 if (!columns.length) {
 return <ValueBox>{formatFieldValue(field, list)}</ValueBox>;
 }

 return (
 <div className="overflow-x-auto rounded-xl border border-slate-200 ">
 <table className="w-full text-xs">
 <thead className="bg-slate-100 ">
 <tr>
 {columns.map((column) => (
 <th
 key={column.key}
 className="p-2 text-right font-semibold text-slate-600 "
 >
 {column.label}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {list.map((row, rowIndex) => (
 <tr
 key={rowIndex}
 className="border-b border-slate-100 last:border-0 "
 >
 {columns.map((column) => (
 <td
 key={column.key}
 className="p-2 text-slate-700 "
 >
 {formatFieldValue(column.field, row?.[column.key])}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
};

/* ----------------------------------------------------------------- a field */

const FilledField = ({ field, formData }) => {
 if (isStaticField(field)) {
 return (
 <div className="col-span-full">
 <StaticBlock field={field} />
 </div>
 );
 }

 const { value, found } = resolveFieldEntry(field, formData);
 const label = fieldLabel(field);
 const required = Boolean(field?.required ?? field?.is_required);
 const fullWidth = isFullWidthField(field);

 const renderValue = () => {
 if (!found) {
 return (
 <ValueBox className="text-slate-400 ">
 بدون مقدار
 </ValueBox>
 );
 }
 if (isFileField(field)) return <FileList files={value} />;
 if (isImageField(field) && typeof value === "string" && value) {
 return (
 <ValueBox>
 <img
 src={value}
 alt={label}
 className="max-h-40 rounded-lg object-contain"
 />
 </ValueBox>
 );
 }
 if (isTableField(field) && Array.isArray(value)) {
 return <SubTable rows={value} field={field} />;
 }
 if (isMultilineField(field)) {
 return (
 <ValueBox className="whitespace-pre-line leading-6">
 {formatFieldValue(field, value)}
 </ValueBox>
 );
 }
 return (
 <ValueBox
 className={
 isEmptyValue(value) ? "text-slate-400 " : ""
 }
 >
 {formatFieldValue(field, value)}
 </ValueBox>
 );
 };

 return (
 <div
 className={fullWidth ? "col-span-full" : "col-span-full sm:col-span-1"}
 >
 <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-600 ">
 <span>{label}</span>
 {required ? <span className="text-red-500">*</span> : null}
 </div>
 {renderValue()}
 {field?.description || field?.help ? (
 <p className="mt-1 text-xs text-slate-400">
 {field.description ?? field.help}
 </p>
 ) : null}
 </div>
 );
};

/* ---------------------------------------------------------------- the view */

const FilledFormView = ({
 definition,
 formData = {},
 attachments = [],
 formTitle = null,
 isLoadingDefinition = false,
 definitionError = null,
}) => {
 const sections = useMemo(() => buildSections(definition), [definition]);

 const orphanFields = useMemo(() => {
 const used = new Set();
 sections.forEach((section) =>
 section.fields.forEach((field) => {
 const { key, found } = resolveFieldEntry(field, formData);
 if (found && key) used.add(key);
 fieldKeyCandidates(field).forEach((candidate) => {
 if (Object.prototype.hasOwnProperty.call(formData, candidate)) {
 used.add(candidate);
 }
 });
 }),
 );
 return buildOrphanFields(formData, used);
 }, [sections, formData]);

 if (isLoadingDefinition) {
 return <Skeleton active paragraph={{ rows: 8 }} />;
 }

 const hasSchema = sections.length > 0;
 const allSections = hasSchema
 ? orphanFields.length
 ? [
 ...sections,
 { id: "__orphans__", title: "سایر مقادیر", fields: orphanFields },
 ]
 : sections
 : [
 {
 id: "__fallback__",
 title: null,
 fields: buildOrphanFields(formData, new Set()),
 },
 ];

 if (!allSections.some((section) => section.fields.length)) {
 return (
 <Empty
 className="py-16"
 description="مقداری برای این ارسال ثبت نشده است."
 />
 );
 }

 return (
 <div className="space-y-4" dir="rtl">
 {!hasSchema ? (
 <Alert
 type="warning"
 showIcon
 className="rounded-xl"
 message="ساختار فرم در دسترس نیست"
 description={
 definitionError ??
 "تعریف فرم دریافت نشد، بنابراین مقادیر بدون چیدمان و عنوان اصلی فیلدها نمایش داده می‌شود."
 }
 />
 ) : null}

 {formTitle ? (
 <h3 className="text-sm font-bold text-slate-800 ">
 {formTitle}
 </h3>
 ) : null}

 {allSections.map((section) => (
 <section
 key={section.id}
 className="rounded-2xl border border-slate-200 bg-white p-4 "
 >
 {section.title ? (
 <header className="mb-3 border-b border-dashed border-slate-200 pb-2 ">
 <h4 className="text-sm font-bold text-slate-700 ">
 {section.title}
 </h4>
 {section.description ? (
 <p className="mt-1 text-xs text-slate-400">
 {section.description}
 </p>
 ) : null}
 </header>
 ) : null}

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {section.fields.map((field, index) => (
 <FilledField
 key={`${section.id}-${fieldKeyCandidates(field)[0] ?? index}`}
 field={field}
 formData={formData}
 />
 ))}
 </div>
 </section>
 ))}

 {attachments.length ? (
 <section className="rounded-2xl border border-slate-200 bg-white p-4 ">
 <header className="mb-3 flex items-center gap-2">
 <PaperClipOutlined className="text-amber-500" />
 <h4 className="text-sm font-bold text-slate-700 ">
 پیوست‌ها
 </h4>
 <Tag color="gold">{attachments.length}</Tag>
 </header>
 <FileList files={attachments} />
 </section>
 ) : null}
 </div>
 );
};

export default FilledFormView;
