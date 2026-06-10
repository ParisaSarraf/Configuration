import { useCallback, useEffect, useState } from "react";
import { Button, Card, Collapse } from "antd";
import { CaretRightOutlined, FileExcelOutlined } from "@ant-design/icons";
import StateSpecificTable from "./StateSpecificTable.jsx";
import {
  ALL_STATES,
  getStateBackgroundColor,
  getStateColor,
  stateLabels,
} from "@/pages/Reports/components/utils.js";
import StateCountFetcher from "@/pages/Reports/components/StateCountFetcher.jsx";
import { handleDownload } from "../../../../utils/HandleDownload.js";
import { useGetProductDocumentReportCsv } from "../../../../QueryServises/ReportsQuery/index.js";

const ExcelExportButton = ({ productId, state, filters }) => {
  const { isLoading: isExporting, refetch } = useGetProductDocumentReportCsv(
    productId,
    state,
    { ...filters },
    { enabled: false },
  );

  const handleExcelExport = async (e) => {
    e.stopPropagation();
    try {
      const result = await refetch();
      if (result.data) {
        handleDownload(result.data.url, result.data.fileName);
      }
    } catch (error) {
      console.error("Error in Excel export:", error);
    }
  };

  return (
    <Button
      title="خروجی اکسل"
      className="text-green-500 border-green-500"
      onClick={handleExcelExport}
      icon={<FileExcelOutlined />}
      loading={isExporting}
    />
  );
};

export const DocumentStateList = ({ productId, filters = {} }) => {
  const [activeKeys, setActiveKeys] = useState([]);
  const [stateCounts, setStateCounts] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    const initialLoadingStates = ALL_STATES.reduce((acc, state) => {
      acc[String(state)] = true;
      return acc;
    }, {});

    setLoadingStates(initialLoadingStates);
    setStateCounts({});
  }, [filters, productId]);

  const handleCountChange = useCallback((state, count) => {
    setStateCounts((prev) => ({ ...prev, [String(state)]: count }));
    setLoadingStates((prev) => ({ ...prev, [String(state)]: false }));
  }, []);

  return (
    <Card title={"وضعیت اسناد"}>
      {ALL_STATES.map((state) => (
        <StateCountFetcher
          key={`fetcher-${String(state)}`}
          productId={productId}
          state={state}
          filters={filters}
          onCountChange={handleCountChange}
        />
      ))}

      <Collapse
        bordered={false}
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys)}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
      >
        {ALL_STATES?.map((state) => {
          const stateColor = getStateColor(state);
          const backgroundColor = getStateBackgroundColor(state);
          const isLoading = loadingStates[String(state)];
          const count = stateCounts[String(state)] || 0;

          return (
            <Collapse.Panel
              extra={
                <ExcelExportButton
                  productId={productId}
                  state={state}
                  filters={filters}
                />
              }
              key={String(state)}
              header={`${stateLabels[state]} (${isLoading ? "..." : count})`}
              style={{
                borderRight: `4px solid ${stateColor}`,
                borderRadius: "4px",
                background: backgroundColor,
                marginBottom: "8px",
              }}
            >
              {activeKeys.includes(String(state)) && (
                <StateSpecificTable
                  productId={productId}
                  state={state}
                  filters={filters}
                />
              )}
            </Collapse.Panel>
          );
        })}
      </Collapse>
    </Card>
  );
};
