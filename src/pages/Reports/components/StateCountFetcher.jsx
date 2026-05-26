import { useEffect } from "react";
import { useGetProductDocumentReport } from "@/QueryServises/ReportsQuery/index.js";
import { flatten } from "@/pages/Reports/components/utils.js";

const StateCountFetcher = ({
  productId,
  state,
  filters = {},
  onCountChange,
}) => {
  let finalFilters = { ...filters };
  if (state !== null) {
    finalFilters.states = state;
  } else {
    delete finalFilters.states;
  }

  const { data: reportData, isLoading } = useGetProductDocumentReport(
    productId,
    finalFilters,
    {
      enabled: !!productId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  useEffect(() => {
    if (!isLoading) {
      const count = reportData ? flatten(reportData).length : 0;
      onCountChange(state, count);
    }
  }, [reportData, isLoading, state, onCountChange]);
  return null;
};

export default StateCountFetcher;
