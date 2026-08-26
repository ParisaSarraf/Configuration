/* eslint-disable react/prop-types, no-unused-vars */
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  App as AntApp,
  Button,
  ConfigProvider,
  Empty,
  Modal,
  Popconfirm,
  Select,
  Spin,
  Tag,
  theme as antTheme,
} from "antd";
import { FolderOpen, Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { useMyAxios } from "../../hooks/useMyAxios";
import { formApi } from "../../Services/forms/formApi";
import {
  extractEntityId,
  getApiErrorMessage,
} from "../../Services/forms/formUtils";
import {
  useFormCategories,
  formCategoriesKey,
  useCreateFormDefinition,
  useCreateFormField,
  useDeleteFormDefinition,
  useDeleteFormField,
  useFormDefinitions,
  formDefinitionsKey,
  formDefinitionKey,
  useUpdateFormDefinition,
  useUpdateFormField,
} from "../../QueryServises/formsQuery";
import {
  toDefinitionPayload,
  toFieldPayload,
} from "../../Services/forms/formPayloads";
import BuilderHeader from "./form-builder/BuilderHeader";
import ComponentLibrary from "./form-builder/ComponentLibrary";
import FormCanvas from "./form-builder/FormCanvas";
import PropertiesPanel from "./form-builder/PropertiesPanel";
import { createField, INITIAL_FIELDS } from "./form-builder/fieldConfig";
import "./form-builder/form-builder.css";
import FormStudioDashboard from "./form-builder/FormStudioDashboard";

const emptyDraft = (categoryId) => ({
  id: null,
  categoryId,
  title: "Untitled form",
  description: "",
  fields: INITIAL_FIELDS.map((field) => ({ ...field })),
});

const Dashboard = FormStudioDashboard;

const apiFieldToEditor = (field) => ({
  id: crypto.randomUUID?.() || `field-${field.id}`,
  serverId: field.id,
  type:
    { text: "shortText", textarea: "longText" }[field.field_type] ||
    field.field_type ||
    "shortText",
  label: field.field_label || "",
  fieldName: field.field_name || "",
  helperText: field.help_text || "",
  placeholder: field.placeholder || "",
  defaultValue: field.default_value || "",
  cssClass: field.css_class || "",
  required: Boolean(field.required),
  min: field.min_value ?? 0,
  max: field.max_value ?? 0,
  minLength: field.min_length ?? 0,
  maxLength: field.max_length ?? 0,
  regexValidation: field.regex_validation || "",
  regexErrorMessage: field.regex_error_message || "",
  options: field.choices || [],
  allowedExtensions: field.allowed_extensions || "",
  maxFileSizeMb: field.max_file_size_mb ?? 0,
});

function Workspace({ draft, onBack, onRefresh }) {
  const { message } = AntApp.useApp();
  const createDefinition = useCreateFormDefinition();
  const createFieldMutation = useCreateFormField();
  const updateDefinition = useUpdateFormDefinition();
  const updateFieldMutation = useUpdateFormField();
  const deleteFieldMutation = useDeleteFormField();
  const [title, setTitle] = useState(draft.title),
    [description, setDescription] = useState(draft.description),
    [fields, setFields] = useState(draft.fields),
    [selectedId, setSelectedId] = useState(draft.fields[0]?.id || null),
    [viewMode, setViewMode] = useState("edit"),
    [saveState, setSaveState] = useState("saved"),
    [settingsOpen, setSettingsOpen] = useState(false);
  const formId = useRef(draft.id),
    deletedFieldIds = useRef([]),
    snapshot = useRef(null),
    timer = useRef(null);
  const sync = useCallback(async () => {
    const current = snapshot.current;
    if (!current) return;
    setSaveState("saving");
    try {
      const definitionPayload = toDefinitionPayload(
        {
          name: current.title,
          slug: current.title,
          description: current.description,
          is_active: true,
          version: 1,
          enable_auto_save: true,
        },
        draft.categoryId,
      );
      if (!formId.current) {
        const created = await createDefinition.mutateAsync(definitionPayload);
        formId.current = extractEntityId(created);
        if (!formId.current)
          throw new Error("The server did not return a form id.");
      } else
        await updateDefinition.mutateAsync({
          id: formId.current,
          payload: definitionPayload,
        });
      await Promise.all(
        deletedFieldIds.current
          .splice(0)
          .map((id) => deleteFieldMutation.mutateAsync(id)),
      );
      const nextFields = await Promise.all(
        current.fields.map(async (field, index) => {
          const payload = toFieldPayload(field, formId.current, index);
          if (field.serverId) {
            const { form_definition_id, ...update } = payload;
            await updateFieldMutation.mutateAsync({
              id: field.serverId,
              payload: update,
            });
            return field;
          }
          const created = await createFieldMutation.mutateAsync(payload);
          return { ...field, serverId: extractEntityId(created) };
        }),
      );
      setFields(nextFields);
      setSaveState("saved");
      onRefresh();
    } catch (error) {
      setSaveState("dirty");
      message.error(getApiErrorMessage(error));
    }
  }, [
    createDefinition,
    createFieldMutation,
    deleteFieldMutation,
    draft.categoryId,
    message,
    onRefresh,
    updateDefinition,
    updateFieldMutation,
  ]);
  const markDirty = useCallback(() => {
    setSaveState("dirty");
    clearTimeout(timer.current);
    timer.current = setTimeout(sync, 700);
  }, [sync]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    snapshot.current = { title, description, fields };
  }, [title, description, fields]);
  const updateField = (id, patch) => {
    setFields((all) =>
      all.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    );
    markDirty();
  };
  const addField = (type, targetIndex) => {
    const field = createField(type);
    setFields((all) => {
      const next = [...all];
      next.splice(
        Number.isInteger(targetIndex) ? targetIndex : next.length,
        0,
        field,
      );
      return next;
    });
    setSelectedId(field.id);
    markDirty();
  };
  const deleteField = (id) => {
    setFields((all) => {
      const removed = all.find((field) => field.id === id);
      if (removed?.serverId) deletedFieldIds.current.push(removed.serverId);
      const next = all.filter((field) => field.id !== id);
      setSelectedId(next[0]?.id || null);
      return next;
    });
    markDirty();
  };
  const duplicateField = (id) => {
    const source = fields.find((field) => field.id === id);
    if (!source) return;
    const copy = {
      ...source,
      id: crypto.randomUUID?.() || `field-${Date.now()}`,
      serverId: undefined,
      options: source.options ? [...source.options] : undefined,
    };
    setFields((all) => {
      const index = all.findIndex((field) => field.id === id);
      return [...all.slice(0, index + 1), copy, ...all.slice(index + 1)];
    });
    setSelectedId(copy.id);
    markDirty();
  };
  const reorderFields = (from, to) => {
    if (from === to) return;
    setFields((all) => {
      const next = [...all];
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
    markDirty();
  };
  const selected = fields.find((field) => field.id === selectedId);
  return (
    <div className="form-builder-shell" dir="rtl">
      <BuilderHeader
        title={title}
        viewMode={viewMode}
        saveState={saveState}
        fieldCount={fields.length}
        onTitleChange={(value) => {
          setTitle(value);
          markDirty();
        }}
        onViewChange={setViewMode}
        onSave={sync}
        onPublish={sync}
        onSettings={() => setSettingsOpen(true)}
        onBack={onBack}
      />
      <div className={`form-builder-workspace is-${viewMode}`} dir="ltr">
        {viewMode === "edit" && <ComponentLibrary onAdd={addField} />}
        <FormCanvas
          title={title}
          description={description}
          fields={fields}
          selectedId={selectedId}
          viewMode={viewMode}
          onSelect={setSelectedId}
          onAdd={addField}
          onDuplicate={duplicateField}
          onDelete={deleteField}
          onReorder={reorderFields}
        />
        {viewMode === "edit" && (
          <PropertiesPanel
            field={selected}
            onChange={updateField}
            onDelete={deleteField}
          />
        )}
      </div>
      <Modal
        title={
          <span>
            <Settings size={17} /> تنظیمات فرم
          </span>
        }
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        onOk={() => {
          setSettingsOpen(false);
          markDirty();
        }}
      >
        <label>توضیح فرم</label>
        <textarea
          className="builder-native-textarea"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            markDirty();
          }}
          rows={4}
        />
      </Modal>
    </div>
  );
}

function FormStudio() {
  const { message } = AntApp.useApp();
  const { myAxios } = useMyAxios();
  const queryClient = useQueryClient();
  const categoriesQuery = useFormCategories();
  const definitionsQuery = useFormDefinitions();
  const deleteDefinition = useDeleteFormDefinition();
  const [draft, setDraft] = useState(null);
  const categories = categoriesQuery.data || [];
  const refetch = categoriesQuery.refetch;
  const definitions = definitionsQuery.data || [];
  const loading = categoriesQuery.isPending || definitionsQuery.isPending;
  const refreshForms = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: formCategoriesKey }),
        queryClient.invalidateQueries({ queryKey: formDefinitionsKey }),
      ]),
    [queryClient],
  );

  useEffect(() => {
    const error = categoriesQuery.error || definitionsQuery.error;
    if (error) message.error(getApiErrorMessage(error));
  }, [categoriesQuery.error, definitionsQuery.error, message]);

  const edit = async (id) => {
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: formDefinitionKey(id),
        queryFn: () => formApi.getDefinition(myAxios, id),
      });
      const form = Array.isArray(detail) ? detail[0] : detail;
      setDraft({
        id: form.id,
        categoryId: form.category?.id || form.category_id,
        title: form.name || "Untitled form",
        description: form.description || "",
        fields: (form.fields || []).map(apiFieldToEditor),
      });
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  const remove = async (id) => {
    try {
      await deleteDefinition.mutateAsync(id);
      message.success("فرم حذف شد");
      await refreshForms();
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };
  return draft ? (
    <Workspace
      draft={draft}
      onBack={() => {
        setDraft(null);
        refreshForms();
      }}
      onRefresh={refreshForms}
    />
  ) : (
    <Dashboard
      refetch={refetch}
      categories={categories}
      definitions={definitions}
      loading={loading}
      onEdit={edit}
      onDelete={remove}
    />
  );
}

const lightTheme = {
  algorithm: antTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#9a7135",
    colorInfo: "#9a7135",
    colorBgBase: "#f7f8fa",
    colorBorder: "#e4e7ec",
    colorText: "#20242c",
    colorTextSecondary: "#667085",
    borderRadius: 10,
    fontFamily: "Vazir, Vazirmatn, IRANSans, sans-serif",
  },
};

export default function FormBuilder() {
  return (
    <ConfigProvider direction="rtl" theme={lightTheme}>
      <AntApp>
        <FormStudio />
      </AntApp>
    </ConfigProvider>
  );
}
