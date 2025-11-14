import {useMyAxios} from "@/hooks/useMyAxios.js";
import {useQuery} from "@tanstack/react-query";

export const useGetExpertActivity = (queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ['expert_activity'],
        queryFn: () =>
            myAxios.get(`/core/get-expert-activity/`).then((response) => {
                queryOptions?.onSuccess?.(response?.data);
                return response?.data;
            }),
        ...queryOptions,
    });
};


export const useGetActivitiesInPlanState = (queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ['expert_activity-in-plan-state'],
        queryFn: () =>
            myAxios.get(`/core/get-activity-in-plan-state/`).then((response) => {
                queryOptions?.onSuccess?.(response?.data);
                return response?.data;
            }),
        ...queryOptions,
    });
};


export const useGetDocumentWorkflowTasks = (queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ['get-document-workflow-tasks'],
        queryFn: () =>
            myAxios.get(`/core/get-document-workflow-tasks/`).then((response) => {
                queryOptions?.onSuccess?.(response?.data);
                return response?.data;
            }),
        ...queryOptions,
    });
};


export const useGetActivityUserPerformance = (queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ['get-activity-user-performance'],
        queryFn: () =>
            myAxios.get(`/core/get-activity-user-performance/`).then((response) => {
                queryOptions?.onSuccess?.(response?.data);
                return response?.data;
            }),
        ...queryOptions,
    });
};


export const useGetExpertActivityInPlanState = (queryOptions) => {
    const {myAxios} = useMyAxios();
    return useQuery({
        queryKey: ['get-expert-activity-in-plan-state'],
        queryFn: () =>
            myAxios.get(`/core/get-expert-activity-in-plan-state/`).then((response) => {
                queryOptions?.onSuccess?.(response?.data);
                return response?.data;
            }),
        ...queryOptions,
    });
};
