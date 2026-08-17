import { useCallback, useMemo, useState } from "react";
import { App as AntApp, ConfigProvider, Modal, theme as antTheme } from "antd";
import { Settings, SlidersHorizontal } from "lucide-react";
import BuilderHeader from "./form-builder/BuilderHeader";
import ComponentLibrary from "./form-builder/ComponentLibrary";
import FormCanvas from "./form-builder/FormCanvas";
import PropertiesPanel from "./form-builder/PropertiesPanel";
import { createField, INITIAL_FIELDS } from "./form-builder/fieldConfig";
import "./form-builder/form-builder.css";

const STORAGE_KEY = "studio-form-builder-draft";

const loadDraft = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(value?.fields)) return value;
  } catch {
    // A malformed or unavailable localStorage should never block the editor.
  }
  return null;
};

function FormBuilderWorkspace() {
  const { message } = AntApp.useApp();
  const savedDraft = useMemo(loadDraft, []);
  const [title, setTitle] = useState(savedDraft?.title || "فرم درخواست همکاری");
  const [description, setDescription] = useState(
    savedDraft?.description || "برای پیوستن به تیم ما، اطلاعات زیر را تکمیل کنید."
  );
  const [fields, setFields] = useState(savedDraft?.fields || INITIAL_FIELDS);
  const [selectedId, setSelectedId] = useState(fields[0]?.id ?? null);
  const [viewMode, setViewMode] = useState("edit");
  const [saveState, setSaveState] = useState(savedDraft ? "saved" : "idle");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const markDirty = useCallback(() => setSaveState("dirty"), []);

  const addField = useCallback((type, targetIndex) => {
    const field = createField(type);
    setFields((current) => {
      const next = [...current];
      const index = Number.isInteger(targetIndex) ? targetIndex : next.length;
      next.splice(index, 0, field);
      return next;
    });
    setSelectedId(field.id);
    setViewMode("edit");
    markDirty();
  }, [markDirty]);

  const updateField = useCallback((id, patch) => {
    setFields((current) => current.map((field) => (
      field.id === id ? { ...field, ...patch } : field
    )));
    markDirty();
  }, [markDirty]);

  const deleteField = useCallback((id) => {
    setFields((current) => {
      const index = current.findIndex((field) => field.id === id);
      const next = current.filter((field) => field.id !== id);
      setSelectedId((selected) => {
        if (selected !== id) return selected;
        return next[Math.min(index, next.length - 1)]?.id ?? null;
      });
      return next;
    });
    markDirty();
  }, [markDirty]);

  const duplicateField = useCallback((id) => {
    setFields((current) => {
      const index = current.findIndex((field) => field.id === id);
      if (index < 0) return current;
      const duplicate = {
        ...current[index],
        id: crypto.randomUUID?.() || `field-${Date.now()}`,
        label: `${current[index].label} (کپی)`,
        options: current[index].options ? [...current[index].options] : undefined,
      };
      const next = [...current];
      next.splice(index + 1, 0, duplicate);
      setSelectedId(duplicate.id);
      return next;
    });
    markDirty();
  }, [markDirty]);

  const reorderFields = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setFields((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return current;
      next.splice(toIndex, 0, moved);
      return next;
    });
    markDirty();
  }, [markDirty]);

  const persistDraft = (notify = true) => {
    setSaveState("saving");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ title, description, fields }));
      window.setTimeout(() => setSaveState("saved"), 450);
      if (notify) message.success("پیش‌نویس با موفقیت ذخیره شد");
      return true;
    } catch {
      setSaveState("dirty");
      message.error("ذخیره پیش‌نویس ممکن نبود");
      return false;
    }
  };

  const saveDraft = () => persistDraft(true);

  const publish = () => {
    if (persistDraft(false)) message.success("فرم منتشر شد و آماده دریافت پاسخ است");
  };

  const selectedField = fields.find((field) => field.id === selectedId) || null;

  return (
    <div className="form-builder-shell" dir="rtl">
      <BuilderHeader
        title={title}
        viewMode={viewMode}
        saveState={saveState}
        fieldCount={fields.length}
        onTitleChange={(value) => { setTitle(value); markDirty(); }}
        onViewChange={setViewMode}
        onSave={saveDraft}
        onPublish={publish}
        onSettings={() => setSettingsOpen(true)}
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
            field={selectedField}
            onChange={updateField}
            onDelete={deleteField}
          />
        )}
      </div>

      <Modal
        title={<span className="builder-modal-title"><Settings size={17} /> تنظیمات فرم</span>}
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        onOk={() => { setSettingsOpen(false); markDirty(); }}
        okText="اعمال تغییرات"
        cancelText="انصراف"
        centered
        width={520}
        className="builder-settings-modal"
      >
        <div className="builder-modal-body">
          <div className="builder-modal-icon"><SlidersHorizontal size={22} /></div>
          <div>
            <h3>تجربه تکمیل فرم</h3>
            <p>تنظیمات پیشرفته مانند اعلان‌ها، پیام پایان و سطح دسترسی در نسخه اتصال به API قرار می‌گیرند.</p>
          </div>
        </div>
        <label className="builder-modal-label" htmlFor="form-description">توضیح فرم</label>
        <textarea
          id="form-description"
          className="builder-native-textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
        />
      </Modal>
    </div>
  );
}

const lightTheme = {
  algorithm: antTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#9a7135",
    colorInfo: "#9a7135",
    colorBgBase: "#f7f8fa",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBorder: "#e4e7ec",
    colorText: "#20242c",
    colorTextSecondary: "#667085",
    borderRadius: 10,
    fontFamily: "Vazir, Vazirmatn, IRANSans, sans-serif",
    controlHeight: 38,
    boxShadowSecondary: "0 18px 50px rgba(16,24,40,.14)",
  },
  components: {
    Button: { primaryShadow: "none", defaultBg: "#ffffff" },
    Input: { activeShadow: "0 0 0 3px rgba(154,113,53,.10)" },
    Select: { optionSelectedBg: "rgba(154,113,53,.10)" },
    Switch: { handleBg: "#ffffff" },
  },
};

export default function FormBuilder() {
  return (
    <ConfigProvider direction="rtl" theme={lightTheme}>
      <AntApp>
        <FormBuilderWorkspace />
      </AntApp>
    </ConfigProvider>
  );
}
