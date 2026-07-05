import Modal from "../Modal/index.jsx";
import { Badge, Image, Space } from "antd";
import { CopyOutlined, FileOutlined } from "@ant-design/icons";
import { BASEURL } from "@/Services/axiosInstance.js";
import { georgianDateToJalaliDate } from "@utils/timeTool.jsx";

export const renderFileButton = (label, filePath) => {
  if (!filePath) return <div className="text-gray-400">فایلی وجود ندارد</div>;
  const fullUrl = `${BASEURL.replace("/api/v1", "")}${filePath}`;
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);

  return (
    <Space className="flex flex-col">
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#1890ff" }}
      >
        {isImage ? (
          <Image
            width={90}
            height={90}
            src={fullUrl}
            alt="فایل پیوست"
            preview={true}
          />
        ) : (
          <>
            <FileOutlined /> مشاهده فایل
          </>
        )}
      </a>
      <a
        href={fullUrl}
        download
        style={{ color: "#52c41a" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        دانلود
      </a>
    </Space>
  );
};

const DetailModal = ({
  isOpen,
  modalMode,
  modalData,
  closeModal,
  modalType,
}) => {
  if (!modalData) return null;

  const getStateInfo = (state) => {
    const isEditionType =
      modalType === "SpecificEditionDetail" || modalType === "EditionDetail";

    const states = isEditionType
      ? {
          10: { label: "درحال آپلود فایل غیرقابل ویرایش", status: "warning" },
          20: { label: "درحال آپلود فایل قابل ویرایش", status: "success" },
          30: { label: "تصدیق", status: "processing" },
          40: { label: "درحال ارسال به کارفرما/پیمانکار", status: "error" },
        }
      : {
          10: { label: "در انتظار اقدام", status: "warning" },
          20: { label: "اقدام فعالیت", status: "success" },
          30: { label: "تایید فعالیت", status: "processing" },
        };
    return states[state] || { label: "نامشخص", status: "default" };
  };

  const renderInfoItem = (label, value, copyable = false) => (
    <div className="flex justify-between items-start py-1 text-sm border-b border-dashed last:border-none">
      <span className="text-gray-500">{label}</span>
      <div className="text-right max-w-[60%]">
        {value || <span className="text-gray-400">---</span>}
        {copyable && value && (
          <CopyOutlined
            onClick={() => navigator.clipboard.writeText(value)}
            className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"
          />
        )}
      </div>
    </div>
  );

  const SectionCard = ({ title, children }) => (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <h4 className="text-base font-semibold text-blue-700 mb-3 border-b pb-2">
        {title}
      </h4>
      <div className="space-y-4">{children}</div>
    </div>
  );

  return (
    <Modal
      footer={false}
      isOpen={isOpen}
      title="نمایش جزئیات "
      size={1000}
      onClose={closeModal}
      okTe
      className="scroll-modal"
      destroyOnClose
      mode={modalMode}
    >
      {modalType === "ActivitiesDetail" &&
        (() => {
          const stateInfo = getStateInfo(modalData.state);
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 py-2 px-1">
              <SectionCard title="مشخصات فعالیت">
                {renderInfoItem(
                  "نوع فعالیت",
                  modalData.type === "control project"
                    ? "کنترل پروژه "
                    : "صورت جلسه",
                )}
                {renderInfoItem(
                  "تاریخ شروع",
                  georgianDateToJalaliDate(modalData.from_date),
                )}
                {renderInfoItem(
                  "تاریخ پایان",
                  georgianDateToJalaliDate(modalData.to_date),
                )}
                {renderInfoItem("تعداد نفر-روز", modalData.person_day)}
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">وضعیت</span>
                  <Badge status={stateInfo.status} text={stateInfo.label} />
                </div>
              </SectionCard>

              <SectionCard title="متولی فعالیت">
                {renderInfoItem(
                  "نام کامل",
                  modalData.trustee
                    ? `${modalData.trustee.name} ${modalData.trustee.last_name}`
                    : "---",
                )}{" "}
                {renderInfoItem("نام کاربری", modalData.trustee?.username)}
                {renderInfoItem(
                  "تاریخ انجام",
                  georgianDateToJalaliDate(modalData.done_date),
                )}
                {modalData.trustee_description &&
                  renderInfoItem(
                    "توضیحات متولی",
                    modalData.trustee_description,
                  )}
                {renderFileButton("فایل متولی", modalData.trustee_file)}
              </SectionCard>

              <SectionCard title="طرح و برنامه">
                {renderInfoItem("توضیحات", modalData.plan_description)}
                {renderInfoItem(
                  "تاریخ تایید",
                  georgianDateToJalaliDate(modalData.confirmed_date),
                )}

                {renderFileButton("فایل طرح و برنامه", modalData.plan_file)}
              </SectionCard>
              {(modalData.trustee?.signature_image ||
                modalData.trustee?.temp_image) && (
                <SectionCard title="تصاویر">
                  <div className="flex gap-4">
                    {modalData.trustee?.signature_image && (
                      <Image
                        src={modalData.trustee?.signature_image}
                        alt="امضا"
                        width={120}
                        className="rounded border"
                      />
                    )}
                    {modalData.trustee?.temp_image && (
                      <Image
                        src={modalData.trustee?.temp_image}
                        alt="تصویر موقت"
                        width={120}
                        className="rounded border"
                      />
                    )}
                  </div>
                </SectionCard>
              )}
            </div>
          );
        })()}

      {modalType === "meetingsIndependent" && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-1 py-2 px-2">
          <SectionCard title="مشخصات صورتجلسه">
            {renderInfoItem(
              "نوع ",
              modalData.type === "control project"
                ? "کنترل پروژه "
                : "صورت جلسه",
            )}
            {renderInfoItem(
              "طرف ",
              modalData.contractor
                ? `${modalData.contractor.name} (${modalData.contractor.is_employer ? "کارفرما" : "پیمانکار"})`
                : "---",
            )}{" "}
            {renderInfoItem("شرح ", modalData.title)}
            {renderInfoItem("تاریخ", georgianDateToJalaliDate(modalData.date))}
            {renderFileButton("فایل ", modalData.file)}
          </SectionCard>
        </div>
      )}

      {modalType === "meetingsMinutes" &&
        (() => {
          const stateInfo = getStateInfo(modalData.state);
          return (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-1 py-2 px-2">
              <SectionCard title={"فعالیت ها"}>
                {renderInfoItem(
                  "نام متولی",
                  `${modalData.trustee?.name} ${modalData.trustee?.last_name} ${modalData.trustee?.username}`,
                )}
                {renderInfoItem("توضیحات متولی", modalData.trustee_description)}
                {renderInfoItem("شرح فعالیت", modalData.description)}
                {renderInfoItem(
                  "تاریخ شروع",
                  georgianDateToJalaliDate(modalData.from_date),
                )}
                {renderInfoItem(
                  "تاریخ پایان",
                  georgianDateToJalaliDate(modalData.to_date),
                )}
                {renderInfoItem(
                  "تاریخ انجام",
                  georgianDateToJalaliDate(modalData.done_date),
                )}
                {renderInfoItem("تعداد نفر-روز", modalData.person_day)}
                {renderInfoItem(
                  "توضیحات طرح و برنامه",
                  modalData.plan_description,
                )}
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">وضعیت</span>
                  <Badge status={stateInfo.status} text={stateInfo.label} />
                </div>
                <div className="w-full flex justify-between">
                  <h1>
                    فایل متولی
                    {renderFileButton("فایل متولی", modalData.trustee_file)}
                  </h1>
                  <h1>
                    فایل طرح و برنامه
                    {renderFileButton("فایل طرح و برنامه", modalData.plan_file)}
                  </h1>
                </div>
              </SectionCard>
            </div>
          );
        })()}

      {modalType === "EditionDetail" &&
        (() => {
          const editionData = modalData;
          const stateInfo = getStateInfo(editionData.state);

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 py-2 px-1">
              <SectionCard title="جزئیات نسخه">
                {renderInfoItem("نسخه", editionData.edition_full)}
                {renderInfoItem(
                  "دلایل ویرایش نسخه",
                  editionData.reasons_editing,
                )}
                {renderInfoItem("توضیحات", editionData.description)}
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">وضعیت</span>
                  <Badge status={stateInfo.status} text={stateInfo.label} />
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">وضعیت</span>
                  <Badge status={editionData.is_active ? "success" : "danger"} text={editionData.is_active ? "فعال" : "غیرفعال"} />
                </div>
              </SectionCard>
              <SectionCard title={"فایل های پیوست"}>
                <h1>
                  فایل غیرقابل ویرایش
                  {renderFileButton("فایل غیرقابل ویرایش", editionData.file_1)}
                </h1>
                <h1>
                  فایل قابل ویرایش
                  {renderFileButton("فایل قابل ویرایش", editionData.file_2)}
                </h1>
                <h1>
                  فایل پشتیبان تولید
                  {renderFileButton("فایل پشتیبان تولید", editionData.file_3)}
                </h1>
                <h1>
                  ارسال به کارفرما/پیمانکار
                  {renderFileButton(
                    "ارسال به کارفرما/پیمانکار",
                    editionData.file_4,
                  )}
                </h1>
              </SectionCard>
            </div>
          );
        })()}

      {modalType === "SpecificEditionDetail" &&
        modalData.editions &&
        modalData.editions.length > 0 &&
        (() => {
          const editionData = modalData.editions[0];
          const stateInfo = getStateInfo(editionData.state);

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 py-2 px-1">
              <SectionCard title="جزئیات نسخه">
                {renderInfoItem("نسخه", editionData.edition)}
                {renderInfoItem(
                  "دلایل ویرایش نسخه",
                  editionData.reasons_editing?.name,
                )}
                {renderInfoItem("توضیحات", editionData.description)}
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">وضعیت</span>
                  <Badge status={stateInfo.status} text={stateInfo.label} />
                </div>
              </SectionCard>
              <SectionCard title={"فایل های پیوست"}>
                <h1>
                  فایل غیرقابل ویرایش
                  {renderFileButton("فایل غیرقابل ویرایش", editionData.file_1)}
                </h1>
                <h1>
                  فایل قابل ویرایش
                  {renderFileButton("فایل قابل ویرایش", editionData.file_2)}
                </h1>
                <h1>
                  فایل پشتیبان تولید
                  {renderFileButton("فایل پشتیبان تولید", editionData.file_3)}
                </h1>
                <h1>
                  ارسال به کارفرما/پیمانکار
                  {renderFileButton(
                    "ارسال به کارفرما/پیمانکار",
                    editionData.file_4,
                  )}
                </h1>
              </SectionCard>
            </div>
          );
        })()}
    </Modal>
  );
};

export default DetailModal;
