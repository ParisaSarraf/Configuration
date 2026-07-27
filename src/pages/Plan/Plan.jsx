import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import PlanModal from "./_components/PlanModal";
import {
  useDeleteProductionActual,
  useDeleteProductionPlan,
  useProductionPlanList,
  useYearPercentageOfPerformanceList,
} from "../../QueryServises/PlanQuery";

import PlanCols from "./_components/PlanCols";
import PlanDetailModal from "./_components/PlanDetailModal";
import PeriodModal from "./_components/periodModal";
import ActualModal from "./_components/actualModal";
import useColumnSearch from "../../hooks/useColumnSearch";
import { useState } from "react";
import YearPerformanceReport from "./_components/YearPerformanceReport";
import { TableAntd } from "../../components/TableAntd/TableAntd";

const Plan = () => {
  const navigate = useNavigate();
  const { setModal, modalMode, modalData, modalType, isOpen, closeModal } =
    useModal();
  const { data: plans, isPending, refetch } = useProductionPlanList();
  const deletePlan = useDeleteProductionPlan();
  const deleteActual = useDeleteProductionActual();
  const [searchParams, setSearchParams] = useState({
    year: "",
  });
  const {
    data: yearPercentageOfPerformanceList,
    refetch: yearRefetch,
    isFetching: isYearFetching,
  } = useYearPercentageOfPerformanceList({
    year: searchParams.year,
  });

  const { getColumnSearchProps } = useColumnSearch({
    setSearchParams,
    refetch,
  });

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
            <Card
              className="rounded-2xl shadow-sm border-slate-200"
              styles={{ body: { padding: 0 } }}
            >
              <TableAntd
                rowKey="id"
                loading={isPending}
                columns={PlanCols({
                  deletePlan,
                  refetch,
                  setModal,
                  getColumnSearchProps,
                })}
                dataSource={plans ?? []}
                locale={{
                  emptyText: <Empty description="برنامه تولیدی ثبت نشده است" />,
                }}
              />
            </Card>
          </div>

          {/* <YearPerformanceReport
            yearPercentageOfPerformanceList={yearPercentageOfPerformanceList}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            onSearch={yearRefetch}
            isFetching={isYearFetching}
          /> */}
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
            setModal={setModal}
            isOpen={isOpen}
            modalData={modalData}
            closeModal={closeModal}
            refetch={refetch}
            deleteActual={deleteActual}
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
