import { useQuery } from "@tanstack/react-query";
import { useMyAxios } from "@/hooks/useMyAxios.js";

export const useExportExcelProductPurchase = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["confirmed-product", id],
    queryFn: () =>
      id
        ? myAxios
            .get(
              `/product/get-confirmed-product-purchases-list-csv-by-id/${id}`,
              {
                responseType: "blob",
              },
            )
            .then((response) => {
              const blob = new Blob([response.data], {
                type: "text/csv;charset=utf-8;",
              });
              return window.URL.createObjectURL(blob);
            })
        : Promise.resolve(null),
    ...queryOptions,
    enabled: !!id,
  });
};


export const useExportExcelMainProductPurchase = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["confirmed-main-product", id],
    queryFn: () =>
      id
        ? myAxios
            .get(
              `/product/get-all-confirmed-product-purchases-csv-by-product-id/${id}`,
              {
                responseType: "blob",
              },
            )
            .then((response) => {
              const blob = new Blob([response.data], {
                type: "text/csv;charset=utf-8;",
              });
              return window.URL.createObjectURL(blob);
            })
        : Promise.resolve(null),
    ...queryOptions,
    enabled: !!id,
  });
};

export const useExportExcelProductTable = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["confirmed-children", id],
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-product-children-info-csv-by-id/${id}`, {
              responseType: "blob",
            })
            .then((response) => {
              const blob = new Blob([response.data], {
                type: "text/csv;charset=utf-8;",
              });
              return window.URL.createObjectURL(blob);
            })
        : Promise.resolve(null),
    ...queryOptions,
    enabled: !!id,
  });
};

export const useExportExcelMyActivity = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["my-activities"],
    queryFn: () =>
      myAxios
        .get(`/core/get-expert-activity-csv/`, {
          responseType: "blob",
        })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: "text/csv;charset=utf-8;",
          });
          return window.URL.createObjectURL(blob);
        }),
    ...queryOptions,
    enabled: true,
  });
};

export const useExportExcelActivity = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["confirmed-activity", id],
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-product-activity-csv-by-id/${id}`, {
              responseType: "blob",
            })
            .then((response) => {
              const blob = new Blob([response.data], {
                type: "text/csv;charset=utf-8;",
              });
              return window.URL.createObjectURL(blob);
            })
        : Promise.resolve(null),
    ...queryOptions,
    enabled: !!id,
  });
};

export const useExportExcelProductIntroduction = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["confirmed-product", id],
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-product-children-csv-by-id/${id}`, {
              responseType: "blob",
            })
            .then((response) => {
              const blob = new Blob([response.data], {
                type: "text/csv;charset=utf-8;",
              });
              return window.URL.createObjectURL(blob);
            })
        : Promise.resolve(null),
    ...queryOptions,
    enabled: !!id,
  });
};

// export const useExportExcelProductChildrenBom = (id, queryOptions) => {
//   const { myAxios } = useMyAxios();
//   return useQuery({
//     queryKey: ["confirmed-product", id],
//     queryFn: async () => {
//       if (!id) return null;
//       const response = await myAxios.get(
//         `/product/get-product-csv-by-id/${id}`,
//         { responseType: "blob" },
//       );
//       const disposition = response.headers["content-disposition"];
//       let fileName = `lcl;sz;lfc.csv`;
//       if (disposition) {
//         const utf8Match = disposition.match(/filename\*=UTF-8''([^;\n]*)/i);
//         const plainMatch = disposition.match(/filename="?([^";\n]*)"?/i);

//         if (utf8Match?.[1]) {
//           fileName = decodeURIComponent(utf8Match[1]);
//         } else if (plainMatch?.[1]) {
//           fileName = plainMatch[1].trim();
//         }
//       }
//       const blob = new Blob([response.data], {
//         type: "text/csv;charset=utf-8;",
//       });


//       return { url: window.URL.createObjectURL(blob), fileName };
//     },
//     ...queryOptions,
//     enabled: !!id,
//   });
// };

export const useExportExcelProductChildrenBom = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: ["confirmed-product", id],
    queryFn: () =>
      id
        ? myAxios
            .get(`/product/get-product-csv-by-id/${id}`, {
              responseType: "blob",
            })
            .then((response) => {
              const blob = new Blob([response.data], {
                type: "text/csv;charset=utf-8;",
              });
              return window.URL.createObjectURL(blob);
            })
        : Promise.resolve(null),
    ...queryOptions,
    enabled: !!id,
  });
};
