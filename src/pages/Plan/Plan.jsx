import {
  ArrowRightOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Tag, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import useModal from "../../hooks/useModal";
import PlanModal from "./_components/PlanModal";
import {
  useDeleteProductionPlan,
  useProductionPlanCsvList,
  useProductionPlanList,
  useProductionPlanPdfList,
  useYearPercentageOfPerformanceList,
} from "../../QueryServises/PlanQuery";

import PlanCols from "./_components/PlanCols";
import PlanDetailModal from "./_components/PlanDetailModal";
import PeriodModal from "./_components/periodModal";
import ActualModal from "./_components/actualModal";
import useColumnSearch from "../../hooks/useColumnSearch";
import YearPerformanceReport from "./_components/YearPerformanceReport";
import { TableAntd } from "../../components/TableAntd/TableAntd";
import { getCurrentJalaliYear } from "./_components/plan.utils";

const Plan = () => {
  const navigate = useNavigate();
  const { setModal, modalMode, modalData, modalType, isOpen, closeModal } =
    useModal();

  const currentYear = useMemo(() => getCurrentJalaliYear(), []);

  const [searchParams, setSearchParams] = useState({
    year: currentYear || "",
  });
  const { data: csvData } = useProductionPlanCsvList({
    year: searchParams.year,
  });
  const { data: pdfData } = useProductionPlanPdfList({
    year: searchParams.year,
  });

  const {
    data: plans,
    isPending,
    refetch,
  } = useProductionPlanList({ year: searchParams.year });

  const deletePlan = useDeleteProductionPlan();

  const ExportExcel = () => {
    if (!csvData) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csvData], { type: "text/csv" }));
    link.download = `production-plan-${searchParams.year}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const ExportPdf = () => {
    if (!pdfData) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([pdfData], { type: "application/pdf" }));
    link.download = `production-plan-${searchParams.year}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const {
    data: yearPercentageOfPerformanceList,
    refetch: yearRefetch,
    isFetching: isYearFetching,
  } = useYearPercentageOfPerformanceList({
    year: searchParams.year,
  });
  useEffect(() => {
    yearRefetch();
  }, [searchParams.year]);

  const { getColumnSearchProps } = useColumnSearch({
    setSearchParams: () => {},
    refetch,
  });

  const isYearFilterActive = !!searchParams.year;
  const isDefaultYear = searchParams.year === currentYear;

  const clearYearFilter = () => {
    setSearchParams((prev) => ({ ...prev, year: "" }));
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header>
          <div className="w-full flex justify-between">
            <Button
              type="text"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate("/")}
              className="flex items-center text-slate-600 hover:!text-sky-700 mb-4 font-medium"
            >
              بازگشت به مدیریت سیستم
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 leading-none">
                برنامه‌ریزی تولید
              </h1>
              <p className="mt-3 text-slate-500 text-lg">
                مشاهده و مدیریت برنامه‌های تولید
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="shadow-md shadow-sky-200"
              onClick={() =>
                setModal({ mode: "add", data: null, type: "addPlan" })
              }
            >
              اضافه کردن برنامه‌ریزی تولید
            </Button>
          </div>
        </header>

        <main>
          <div>
            <YearPerformanceReport
              yearPercentageOfPerformanceList={yearPercentageOfPerformanceList}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              isFetching={isYearFetching}
            />
            <Card
              className="rounded-2xl shadow-sm border-slate-200 mt-6"
              styles={{ body: { padding: 0 } }}
            >
              {isYearFilterActive && (
                <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-100">
                  <div>
                    <Tag color="blue" className="!m-0">
                      {isDefaultYear
                        ? `نمایش پیش‌فرض: فقط پلن‌های سال ${searchParams.year}`
                        : `فیلتر فعال: فقط پلن‌های سال ${searchParams.year}`}
                    </Tag>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="link" size="small" onClick={clearYearFilter}>
                      نمایش همه سال‌ها
                    </Button>

                    <Tooltip title="خروجی اکسل">
                      <Button
                        type="text"
                        size="small"
                        shape="circle"
                        icon={
                          <FileExcelOutlined className="text-green-600 text-lg" />
                        }
                        onClick={ExportExcel}
                        className="hover:!bg-green-50"
                      />
                    </Tooltip>
                    <Tooltip title="خروجی PDF">
                      <Button
                        type="text"
                        size="small"
                        shape="circle"
                        icon={
                          <FilePdfOutlined className="text-red-600 text-lg" />
                        }
                        onClick={ExportPdf}
                        className="hover:!bg-red-50"
                      />
                    </Tooltip>
                  </div>
                </div>
              )}
              <TableAntd
                rowKey="id"
                loading={isPending}
                columns={PlanCols({
                  plans,
                  deletePlan,
                  refetch,
                  setModal,
                  getColumnSearchProps,
                })}
                rowClassName={(record) => {
                  switch (record.status) {
                    case "draft":
                      return "bg-gray-100";
                    case "stopped":
                      return "bg-orange-100";
                    case "closed":
                      return "bg-green-100";
                    case "approved":
                      return "bg-white";
                    default:
                      return "";
                  }
                }}
                dataSource={plans ?? []}
                locale={{
                  emptyText: <Empty description="برنامه تولیدی ثبت نشده است" />,
                }}
                pagination={false}
                onRow={(record) => ({
                  onClick: () =>
                    setModal({
                      mode: "show",
                      data: record,
                      type: "showDetail",
                    }),
                  className: "cursor-pointer hover:!bg-sky-50/60",
                })}
              />
            </Card>
          </div>
        </main>

        {modalType === "addPlan" && (
          <PlanModal
            refetch={refetch}
            isOpen={isOpen}
            modalMode={modalMode}
            modalData={modalData}
            closeModal={closeModal}
          />
        )}
        {modalType === "showDetail" && (
          <PlanDetailModal
            isOpen={isOpen}
            modalData={modalData}
            closeModal={closeModal}
            refetch={refetch}
          />
        )}
        {modalType === "actualModal" && (
          <ActualModal
            isOpen={isOpen}
            modalMode={modalMode}
            modalData={modalData}
            closeModal={closeModal}
            refetch={refetch}
          />
        )}
        {modalType === "periodModal" && (
          <PeriodModal
            isOpen={isOpen}
            modalData={modalData}
            closeModal={closeModal}
            refetch={refetch}
          />
        )}
      </div>
    </div>
  );
};

export default Plan;
