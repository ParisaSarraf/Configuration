import {useQuery} from "@tanstack/react-query";
import {useMyAxios} from "@/hooks/useMyAxios.js";

export const useExportExcelProductPurchase = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ["confirmed-product", id],
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-confirmed-product-purchases-list-csv-by-id/${id}`, {
                        responseType: 'blob'
                    })
                    .then((response) => {
                        const blob = new Blob([response.data], {type: 'text/csv;charset=utf-8;'});
                        return window.URL.createObjectURL(blob);
                    })
                : Promise.resolve(null),
        ...queryOptions,
        enabled: !!id,
    });
};


export const useExportExcelProductTable = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ["confirmed-children", id],
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-product-children-info-csv-by-id/${id}`, {
                        responseType: 'blob'
                    })
                    .then((response) => {
                        const blob = new Blob([response.data], {type: 'text/csv;charset=utf-8;'});
                        return window.URL.createObjectURL(blob);
                    })
                : Promise.resolve(null),
        ...queryOptions,
        enabled: !!id,
    });
};

export const useExportExcelActivity = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ["confirmed-activity", id],
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-product-activity-csv-by-id/${id}`, {
                        responseType: 'blob'
                    })
                    .then((response) => {
                        const blob = new Blob([response.data], {type: 'text/csv;charset=utf-8;'});
                        return window.URL.createObjectURL(blob);
                    })
                : Promise.resolve(null),
        ...queryOptions,
        enabled: !!id,
    });
};


export const useExportExcelProductIntroduction = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ["confirmed-product", id],
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-product-children-csv-by-id/${id}`, {
                        responseType: 'blob'
                    })
                    .then((response) => {
                        const blob = new Blob([response.data], {type: 'text/csv;charset=utf-8;'});
                        return window.URL.createObjectURL(blob);
                    })
                : Promise.resolve(null),
        ...queryOptions,
        enabled: !!id,
    });
};


export const useExportExcelProductChildrenBom = (id, queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ["confirmed-product", id],
        queryFn: () =>
            id
                ? myAxios
                    .get(`/product/get-product-csv-by-id/${id}`, {
                        responseType: 'blob'
                    })
                    .then((response) => {
                        const blob = new Blob([response.data], {type: 'text/csv;charset=utf-8;'});
                        return window.URL.createObjectURL(blob);
                    })
                : Promise.resolve(null),
        ...queryOptions,
        enabled: !!id,
    });
};