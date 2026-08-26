import { useMutation, useQuery } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";
import { formApi } from "../../Services/forms/formApi";

export const formCategoriesKey = ["forms", "categories"];
export const formDefinitionsKey = ["forms", "definitions"];
export const formDefinitionKey = (id) => ["forms", "definitions", id];

export const useFormCategories = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: formCategoriesKey,
    queryFn: () => formApi.getCategories(myAxios),
    ...queryOptions,
  });
};

export const useFormDefinitions = (queryOptions) => {
  const { myAxios } = useMyAxios();

  return useQuery({
    queryKey: formDefinitionsKey,
    queryFn: () => formApi.getDefinitions(myAxios),
    ...queryOptions,
  });
};

export const useFormDefinition = (id, queryOptions) => {
  const { myAxios } = useMyAxios();

  return useQuery({
    queryKey: formDefinitionKey(id),
    queryFn: () => formApi.getDefinition(myAxios, id),
    enabled: Boolean(id),
    ...queryOptions,
  });
};

// export const useCreateFormCategory = () => {
//   const { myAxios } = useMyAxios();
//   return useMutation({
//     mutationFn: (payload) => formApi.createCategory(myAxios, payload),
//   });
// };

export const useDeleteFormCategory = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (id) => formApi.deleteCategory(myAxios, id),
  });
};

export const useCreateFormDefinition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (payload) => formApi.createDefinition(myAxios, payload),
  });
};

export const useUpdateFormDefinition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ id, payload }) =>
      formApi.updateDefinition(myAxios, id, payload),
  });
};

export const useDeleteFormDefinition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (id) => formApi.deleteDefinition(myAxios, id),
  });
};

export const useCreateFormField = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (payload) => formApi.createField(myAxios, payload),
  });
};

export const useUpdateFormField = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ id, payload }) => formApi.updateField(myAxios, id, payload),
  });
};

export const useDeleteFormField = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (id) => formApi.deleteField(myAxios, id),
  });
};

export const useCreateFormSubmission = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (payload) => formApi.createSubmission(myAxios, payload),
  });
};

// ========================================== new =====================================
export const useFormCategoryKey = ["lists", "form", " category"];
export const useFormCategoryList = (queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useFormCategoryKey,
    queryFn: () =>
      myAxios.get(`/forms/get-form-category/`).then((response) => {
        queryOptions?.onSuccess?.(response?.data);
        return response?.data;
      }),
    ...queryOptions,
  });
};

export const useCreateFormCategory = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/forms/add-form-category/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

// export const useDeleteGenusProduct = () => {
//   const { myAxios } = useMyAxios();
//   return useMutation({
//     mutationFn: (params) => {
//       return myAxios
//         .delete(`/product/delete-genus/${params}/`)
//         .then((response) => {
//           return response?.data;
//         });
//     },
//   });
// };

// export const useUpdateGenusProduct = () => {
//   const { myAxios } = useMyAxios();
//   return useMutation({
//     mutationFn: ({ genusId, ...params }) => {
//       return myAxios
//         .put(`/product/update-genus/${genusId}/`, params)
//         .then((response) => {
//           return response?.data;
//         });
//     },
//   });
// };

// export const useStandardCodeGenusByIdKey = (
//   id,
//   name,
//   full_ware_house_code = {},
// ) => ["genus-id", id, name, full_ware_house_code];
// export const useStandardCodeGenusById = (
//   id,
//   name,
//   full_ware_house_code,
//   queryOptions,
// ) => {
//   const { myAxios } = useMyAxios();
//   return useQuery({
//     queryKey: useStandardCodeGenusByIdKey(id, name, full_ware_house_code),
//     queryFn: () =>
//       id
//         ? myAxios
//             .get(`/product/get-genus-by-id/${id}`, {
//               params: {
//                 ...(name && { name }),
//                 ...(full_ware_house_code && { full_ware_house_code }),
//               },
//             })
//             .then((response) => response?.data)
//         : Promise.resolve(null),
//     ...queryOptions,
//   });
// };
