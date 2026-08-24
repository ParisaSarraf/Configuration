import { useMutation } from "@tanstack/react-query";
import { useMyAxios } from "../../hooks/useMyAxios";
import { formApi } from "../../Services/forms/formApi";

const useFormMutation = (request) => {
  const { myAxios } = useMyAxios();
  return useMutation({ mutationFn: (payload) => request(myAxios, payload) });
};

export const useCreateFormCategory = () =>
  useFormMutation(formApi.createCategory);
export const useCreateFormDefinition = () =>
  useFormMutation(formApi.createDefinition);
export const useCreateFormField = () => useFormMutation(formApi.createField);
export const useCreateFormSubmission = () =>
  useFormMutation(formApi.createSubmission);

export const useFormApiMutations = () => {
  const { myAxios } = useMyAxios();
  return {
    category: useMutation({
      mutationFn: (payload) => formApi.createCategory(myAxios, payload),
    }),
    definition: useMutation({
      mutationFn: (payload) => formApi.createDefinition(myAxios, payload),
    }),
    field: useMutation({
      mutationFn: (payload) => formApi.createField(myAxios, payload),
    }),
    submission: useMutation({
      mutationFn: (payload) => formApi.createSubmission(myAxios, payload),
    }),
  };
};
