import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";

// Production Plan
export const useProductionPlanKey = ["lists", "production-paln"];
export const useProductionPlanList = ({ year, ...queryOptions } = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: [...useProductionPlanKey, { year: year || null }],
    queryFn: () =>
      myAxios
        .get(`/plan/get-production-plan/`, {
          params: year ? { year } : {},
        })
        .then((response) => {
          queryOptions?.onSuccess?.(response?.data);
          return response?.data;
        }),
    ...queryOptions,
  });
};

// get csv
export const useProductionPlanCsvKey = ["lists", "production-paln-csv"];
export const useProductionPlanCsvList = ({ year, ...queryOptions } = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: [...useProductionPlanCsvKey, { year: year || null }],
    queryFn: () =>
      myAxios
        .get(`/plan/get-production-plan-csv/`, {
          params: year ? { year } : {},
        })
        .then((response) => {
          queryOptions?.onSuccess?.(response?.data);
          return response?.data;
        }),
    ...queryOptions,
  });
};

// get pdf
export const useProductionPlanPdfKey = ["lists", "production-paln-pdf"];
export const useProductionPlanPdfList = ({ year, ...queryOptions } = {}) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: [...useProductionPlanPdfKey, { year: year || null }],
    queryFn: () =>
      myAxios
        .get(`/plan/get-production-plan-pdf/`, {
          params: year ? { year } : {},
        })
        .then((response) => {
          queryOptions?.onSuccess?.(response?.data);
          return response?.data;
        }),
    ...queryOptions,
  });
};


export const useYearPercentageOfPerformanceKey = [
  "lists",
  "year-percentage-of-performance",
];
export const useYearPercentageOfPerformanceList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useYearPercentageOfPerformanceKey,
    queryFn: () =>
      myAxios
        .get(`/plan/get-year-percentage-of-performane/`, {
          params: {
            year: queryOptions?.year,
          },
        })
        .then((response) => {
          queryOptions?.onSuccess?.(response?.data);
          return response?.data;
        }),
    ...queryOptions,
  });
};

export const useProductionPlanOne = ({ queryOptions, productionPlanId }) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["production-plan", productionPlanId],
    queryFn: () =>
      myAxios
        .get(`/plan/get-production-plan-by-id/${productionPlanId}`)
        .then((response) => {
          queryOptions?.onSuccess?.(response?.data);
          return response?.data;
        }),
    enabled: !!productionPlanId,
    ...queryOptions,
  });
};

export const useCreateProductionPlan = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/plan/add-production-plan/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useDeleteProductionPlan = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/plan/delete-production-plan/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateProductionPlan = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ productionPlanId, ...params }) => {
      return myAxios
        .put(`/plan/update-production-plan/${productionPlanId}`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

// Production Actual
export const useCreateProductionActual = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/plan/add-production-actual/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useDeleteProductionActual = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/plan/delete-production-actual/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateProductionActual = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ productionActualId, ...params }) => {
      return myAxios
        .put(`/plan/update-production-actual/${productionActualId}`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

// Production Plan Period
export const useCreateProductionPlanPeriod = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/plan/add-producion-plan-period/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useDeleteProductionPlanPeriod = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/plan/delete-production-plan-period/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateProductionPlanPeriod = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ productionPlanId, ...params }) => {
      return myAxios
        .put(`/plan/update-production-plan-period/${productionPlanId}`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};
