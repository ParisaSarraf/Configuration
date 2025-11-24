import { useMyAxios } from "@/hooks/useMyAxios.js";
import { useQuery } from "@tanstack/react-query";


export const useGetProductDocumentReport = (id, filters = {}, queryOptions = {}) => {
    const { myAxios } = useMyAxios();
    return useQuery({
        queryKey: [
            "product-document-report",
            id,
            filters,
        ],
        queryFn: () =>
            myAxios
                .get(`/product/get-product-document-report/${id}/`, {
                    params: {
                        ...filters
                    },
                })
                .then((response) => response.data),
        ...queryOptions,
    });
};


export const useGetProductDocumentReportCsv = (id, states, queryOptions = {}) => {
    console.log(`states in Hook : ${states}`)
    const { myAxios } = useMyAxios();
    return useQuery({
        queryKey: ["product-document-report-csv", id, states],
        queryFn: async () => {
            if (!id) return null;
            const response = await myAxios.get(
                `/product/get-product-document-report-csv/${id}/`,
                {
                    responseType: "blob",
                    params: { states }
                }
            );
            const disposition = response.headers["content-disposition"];
            let fileName = "download.csv";

            if (disposition) {
                const match = disposition.match(/filename="(.+)"/);
                if (match) fileName = match[1];
            }
            const blob = new Blob([response.data], {
                type: "text/csv;charset=utf-8;"
            });
            return {
                url: window.URL.createObjectURL(blob),
                fileName
            };
        },
        enabled: !!id,
        ...queryOptions,
    });
};




export const useGetEditionsCountReport = (id, filters = {}, queryOptions = {}) => {
    const { myAxios } = useMyAxios();
    return useQuery({
        queryKey: ['get-editions-count-report', id, filters,],
        queryFn: () =>
            myAxios
                .get(`/product/get-edition-count-report/${id}/`, {
                    params: {
                        ...filters,
                    }
                })
                .then((response) => response.data),
        ...queryOptions,
    })
}