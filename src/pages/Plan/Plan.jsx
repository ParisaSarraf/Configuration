// import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons";
// import { Button, Card, Empty, Tag } from "antd";
// import { useNavigate } from "react-router-dom";
// import { useMemo, useState } from "react";
// import useModal from "../../hooks/useModal";
// import PlanModal from "./_components/PlanModal";
// import {
//   useDeleteProductionActual,
//   useDeleteProductionPlan,
//   useProductionPlanList,
//   useYearPercentageOfPerformanceList,
// } from "../../QueryServises/PlanQuery";

// import PlanCols from "./_components/PlanCols";
// import PlanDetailModal from "./_components/PlanDetailModal";
// import PeriodModal from "./_components/periodModal";
// import ActualModal from "./_components/actualModal";
// import useColumnSearch from "../../hooks/useColumnSearch";
// import YearPerformanceReport from "./_components/YearPerformanceReport";
// import { TableAntd } from "../../components/TableAntd/TableAntd";
// import { getCurrentJalaliYear } from "./_components/plan.utils";

// const Plan = () => {
//   const navigate = useNavigate();
//   const { setModal, modalMode, modalData, modalType, isOpen, closeModal } =
//     useModal();
//   const { data: plans, isPending, refetch } = useProductionPlanList();
//   const deletePlan = useDeleteProductionPlan();
//   const deleteActual = useDeleteProductionActual();

//   const currentYear = useMemo(() => getCurrentJalaliYear(), []);

//   const [searchParams, setSearchParams] = useState({
//     year: currentYear || "",
//   });

//   const {
//     data: yearPercentageOfPerformanceList,
//     refetch: yearRefetch,
//     isFetching: isYearFetching,
//   } = useYearPercentageOfPerformanceList({
//     year: searchParams.year,
//   });

//   const [tableSearchParams, setTableSearchParams] = useState({});

//   const { getColumnSearchProps } = useColumnSearch({
//     setSearchParams: setTableSearchParams,
//     refetch,
//   });

//   const activeYear = searchParams.year || currentYear;
//   const isShowAllActive = tableSearchParams.year === "__all__";
//   const isYearColumnSearched = Boolean(
//     tableSearchParams.year && !isShowAllActive,
//   );

//   const displayedPlans = useMemo(() => {
//     const list = Array.isArray(plans) ? plans : (plans?.data ?? []);
//     if (isShowAllActive || isYearColumnSearched) return list;
//     if (!activeYear) return list;
//     return list.filter((p) => String(p.year) === String(activeYear));
//   }, [plans, isShowAllActive, isYearColumnSearched, activeYear]);

//   const isDefaultYearFilterActive =
//     !isShowAllActive &&
//     !isYearColumnSearched &&
//     !!activeYear &&
//     (plans?.length ?? 0) > 0;

//   const showAllPlans = () => {
//     setTableSearchParams((prev) => ({ ...prev, year: "__all__" }));
//   };

//   return (
//     <div className="min-h-screen bg-[#f1f5f9] p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         <header>
//           <div className="w-full flex justify-between">
//             <Button
//               type="text"
//               icon={<ArrowRightOutlined />}
//               onClick={() => navigate("/")}
//               className="flex items-center text-slate-600 hover:!text-sky-700 mb-4 font-medium"
//             >
//               بازگشت به مدیریت سیستم
//             </Button>
//           </div>

//           <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//             <div>
//               <h1 className="text-4xl font-black text-slate-900 leading-none">
//                 برنامه‌ریزی تولید
//               </h1>
//               <p className="mt-3 text-slate-500 text-lg">
//                 مشاهده و مدیریت برنامه‌های تولید
//               </p>
//             </div>
//             <Button
//               type="primary"
//               size="large"
//               icon={<PlusOutlined />}
//               className="shadow-md shadow-sky-200"
//               onClick={() =>
//                 setModal({ mode: "add", data: null, type: "addPlan" })
//               }
//             >
//               اضافه کردن برنامه‌ریزی تولید
//             </Button>
//           </div>
//         </header>

//         <main>
//           <div>
//             <YearPerformanceReport
//               yearPercentageOfPerformanceList={yearPercentageOfPerformanceList}
//               searchParams={searchParams}
//               setSearchParams={setSearchParams}
//               onSearch={yearRefetch}
//               isFetching={isYearFetching}
//             />
//             <Card
//               className="rounded-2xl shadow-sm border-slate-200 mt-6"
//               styles={{ body: { padding: 0 } }}
//             >
//               {isDefaultYearFilterActive && (
//                 <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-100">
//                   <Tag color="blue" className="!m-0">
//                     نمایش پیش‌فرض: فقط پلن‌های سال {activeYear}
//                   </Tag>
//                   <Button type="link" size="small" onClick={showAllPlans}>
//                     نمایش همه سال‌ها
//                   </Button>
//                 </div>
//               )}
//               <TableAntd
//                 rowKey="id"
//                 loading={isPending}
//                 columns={PlanCols({
//                   plans,
//                   deletePlan,
//                   refetch,
//                   setModal,
//                   getColumnSearchProps,
//                 })}
//                 dataSource={displayedPlans}
//                 locale={{
//                   emptyText: <Empty description="برنامه تولیدی ثبت نشده است" />,
//                 }}
//                 pagination={false}
//                 onRow={(record) => ({
//                   onClick: () =>
//                     setModal({
//                       mode: "show",
//                       data: record,
//                       type: "showDetail",
//                     }),
//                   className: "cursor-pointer hover:!bg-sky-50/60",
//                 })}
//               />
//             </Card>
//           </div>
//         </main>

//         {modalType === "addPlan" && (
//           <PlanModal
//             refetch={refetch}
//             isOpen={isOpen}
//             modalMode={modalMode}
//             modalData={modalData}
//             closeModal={closeModal}
//           />
//         )}
//         {modalType === "showDetail" && (
//           <PlanDetailModal
//             setModal={setModal}
//             isOpen={isOpen}
//             modalData={modalData}
//             closeModal={closeModal}
//             refetch={refetch}
//             deleteActual={deleteActual}
//           />
//         )}
//         {modalType === "actualModal" && (
//           <ActualModal
//             isOpen={isOpen}
//             modalMode={modalMode}
//             modalData={modalData}
//             closeModal={closeModal}
//             refetch={refetch}
//           />
//         )}
//         {modalType === "periodModal" && (
//           <PeriodModal
//             isOpen={isOpen}
//             modalData={modalData}
//             closeModal={closeModal}
//             refetch={refetch}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Plan;

import { ArrowRightOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
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
import YearPerformanceReport from "./_components/YearPerformanceReport";
import { TableAntd } from "../../components/TableAntd/TableAntd";
import { getCurrentJalaliYear } from "./_components/plan.utils";

const Plan = () => {
  const navigate = useNavigate();
  const { setModal, modalMode, modalData, modalType, isOpen, closeModal } =
    useModal();

  const currentYear = useMemo(() => getCurrentJalaliYear(), []);

  // این تنها منبع فیلتر سال است — هم گزارش عملکرد سالانه هم جدول اصلی
  // پلن‌ها، هر دو مستقیماً همین year را به بک‌اند می‌فرستند.
  const [searchParams, setSearchParams] = useState({
    year: currentYear || "",
  });

  const {
    data: plans,
    isPending,
    refetch,
  } = useProductionPlanList({ year: searchParams.year });

  const deletePlan = useDeleteProductionPlan();
  const deleteActual = useDeleteProductionActual();

  const { data: yearPercentageOfPerformanceList, isFetching: isYearFetching } =
    useYearPercentageOfPerformanceList({
      year: searchParams.year,
    });

  // توجه: فیلتر ستون «سال» جدول دیگر استفاده نمی‌شود چون فیلتر سال از این به بعد
  // فقط از طریق باکس بالای صفحه و مستقیماً از بک‌اند انجام می‌شود. اگر ستون «سال»
  // در PlanCols.jsx هنوز getColumnSearchProps دارد، بهتر است حذف شود تا با این
  // فیلتر تداخل نکند (فیلتر دوباره‌ی client-side روی نتیجه‌ی از قبل فیلترشده).
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
                  <Tag color="blue" className="!m-0">
                    {isDefaultYear
                      ? `نمایش پیش‌فرض: فقط پلن‌های سال ${searchParams.year}`
                      : `فیلتر فعال: فقط پلن‌های سال ${searchParams.year}`}
                  </Tag>
                  <Button type="link" size="small" onClick={clearYearFilter}>
                    نمایش همه سال‌ها
                  </Button>
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
