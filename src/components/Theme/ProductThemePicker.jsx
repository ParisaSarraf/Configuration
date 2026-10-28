import { useState } from "react";
import { BgColorsOutlined } from "@ant-design/icons";
import { Button, Popover, Radio, Tooltip } from "antd";
import { useProductTheme } from "./ProductThemeContext";
import { PRODUCT_THEME_OPTIONS, getProductThemeVariables } from "./productThemes";

const ProductThemePicker = ({ moduleKey, moduleLabel }) => {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState("module");
  const {
    globalTheme,
    moduleThemes,
    setGlobalTheme,
    setModuleTheme,
  } = useProductTheme();

  const selectedTheme =
    scope === "module"
      ? moduleThemes[moduleKey] || globalTheme
      : globalTheme;
  const pickerStyle = getProductThemeVariables(selectedTheme);

  const handleThemeChange = (themeId) => {
    if (scope === "global") {
      setGlobalTheme(themeId);
    } else {
      setModuleTheme(moduleKey, themeId);
    }
  };

  const content = (
    <div className="pw-theme-picker" dir="rtl" style={pickerStyle}>
      <div className="pw-theme-picker__heading">اعمال تم برای</div>
      <Radio.Group
        className="pw-theme-picker__scope"
        value={scope}
        onChange={(event) => setScope(event.target.value)}
        optionType="button"
        buttonStyle="solid"
        size="small"
      >
        <Radio.Button value="module">فقط {moduleLabel}</Radio.Button>
        <Radio.Button value="global">پیش‌فرض همه بخش‌ها</Radio.Button>
      </Radio.Group>
      <div className="pw-theme-picker__heading">رنگ‌بندی</div>
      <Radio.Group
        className="pw-theme-picker__options"
        value={selectedTheme}
        onChange={(event) => handleThemeChange(event.target.value)}
      >
        {PRODUCT_THEME_OPTIONS.map((theme) => (
          <Radio key={theme.id} value={theme.id}>
            <span className="pw-theme-option">
              <span
                className="pw-theme-option__swatch"
                style={{ backgroundColor: theme.accent }}
                aria-hidden="true"
              />
              {theme.label}
            </span>
          </Radio>
        ))}
      </Radio.Group>
      {scope === "module" && moduleThemes[moduleKey] ? (
        <Button
          type="link"
          size="small"
          className="pw-theme-picker__reset"
          onClick={() => setModuleTheme(moduleKey, null)}
        >
          استفاده از تم همه بخش‌ها
        </Button>
      ) : null}
    </div>
  );

  return (
    <Popover
      content={content}
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomLeft"
    >
      <Tooltip title="تغییر تم">
        <Button
          className="pw-theme-trigger"
          icon={<BgColorsOutlined />}
          style={pickerStyle}
          aria-label="تغییر تم رنگی"
          aria-expanded={open}
        />
      </Tooltip>
    </Popover>
  );
};

export default ProductThemePicker;