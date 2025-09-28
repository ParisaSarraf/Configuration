import {useLogList} from "@/QueryServises/LogQuery/index.js";

export const useAllLogs = (id) => {
    const states = [10, 20, 30, 40];

    const results = states?.map((state) =>
        useLogList({id, model: "product_document_edition", state})
    );
    const data = results.flatMap((r) => r.data || []);

    const isLoading = results.some((r) => r.isLoading);

    return {data, isLoading};
};