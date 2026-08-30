import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const useDeleteFormDefinition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (id) => formApi.deleteDefinition(myAxios, id),
  });
};

export const useCreateFormField = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => formApi.createField(myAxios, payload),
    onSuccess: (_, payload) => queryClient.invalidateQueries({
      queryKey: formDefinitionKey(payload.form_definition_id),
    }),
  });
};

export const useUpdateFormField = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => formApi.updateField(myAxios, id, payload),
    onSuccess: (_, variables) => {
      if (variables.formDefinitionId) queryClient.invalidateQueries({
        queryKey: formDefinitionKey(variables.formDefinitionId),
      });
    },
  });
};

export const useDeleteFormField = () => {
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => formApi.deleteField(myAxios, id),
    onSuccess: (_, variables) => {
      if (variables.formDefinitionId) queryClient.invalidateQueries({
        queryKey: formDefinitionKey(variables.formDefinitionId),
      });
    },
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

export const useDeleteFormCategory = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/forms/delete-form-category/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateFormCategory = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ FormCategoryId, ...params }) => {
      return myAxios
        .put(`/forms/update-form-category/${FormCategoryId}`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useFormCategoryByIdKey = (id) => ["form", "category", id];
export const useFormCategoryById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useFormCategoryByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/forms/get-category-forms-by-id/${id}`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

// ======================= form definition =================================
export const useCreateFormDefinition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .post(`/forms/add-form-definition/`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useUpdateFormDefinition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: ({ FormDefinitionId, ...params }) => {
      return myAxios
        .put(`/forms/update-form-definition/${FormDefinitionId}`, params)
        .then((response) => {
          return response?.data;
        });
    },
  });
};

export const useFormDefinitionByIdKey = (id) => ["form", "definition", id];
export const useFormDefinitionById = (id, queryOptions) => {
  const { myAxios } = useMyAxios();
  return useQuery({
    queryKey: useFormDefinitionByIdKey(id),
    queryFn: () =>
      id
        ? myAxios
            .get(`/forms/get-form-definition/${id}`)
            .then((response) => response?.data)
        : Promise.resolve(null),
    ...queryOptions,
  });
};

export const useDeleteDefinition = () => {
  const { myAxios } = useMyAxios();
  return useMutation({
    mutationFn: (params) => {
      return myAxios
        .delete(`/forms/delete-form-definition/${params}`)
        .then((response) => {
          return response?.data;
        });
    },
  });
};
