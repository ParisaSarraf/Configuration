/* eslint-disable react/prop-types */
import { Collapse, Select, Tooltip } from "antd";

import { STATE_TYPES } from "../processSchema";

const DRAG_TYPE = "application/x-process-state-type";

const SHORTCUTS = [
  { label: "اتصال دو مرحله", key: "درگ از دستگیرهٔ پایین" },
  { label: "تغییر نام مرحله", key: "دوبار کلیک" },
  { label: "منوی سریع مرحله و مسیر", key: "راست‌کلیک" },
  { label: "تکرار مرحله", key: "Ctrl + D" },
  { label: "حرکت در بوم", key: "درگ زمینه" },
  { label: "بزرگ‌نمایی", key: "Ctrl + اسکرول" },
  { label: "حذف انتخاب‌شده", key: "Delete" },
  { label: "بازگردانی / انجام مجدد", key: "Ctrl + Z / Shift + Z" },
  { label: "لغو کار جاری", key: "Esc" },
];

/**
 * جعبه‌ابزار مراحل.
 * فقط همان انواع StateType موجود در بک‌اند نمایش داده می‌شود.
 */
const ProcessToolbox = ({ onAddNode, disabled, nodes = [], onFocusNode }) => (
  <aside className="process-toolbox">
    {nodes.length > 0 ? (
      <div className="process-toolbox__section">
        <p className="process-toolbox__title">جست‌وجوی مرحله</p>
        <Select
          showSearch
          value={null}
          className="process-toolbox__search"
          placeholder="نام مرحله را بنویسید"
          optionFilterProp="label"
          notFoundContent="مرحلهی با این نام پیدا نشد"
          options={nodes.map((node) => ({
            value: node.id,
            label: node.name || "بدون نام",
          }))}
          onChange={(value) => {
            if (value !== null && value !== undefined) onFocusNode?.(value);
          }}
        />
      </div>
    ) : null}

    <div className="process-toolbox__section">
      <p className="process-toolbox__title">مراحل</p>
      <p className="process-toolbox__hint">
        بکشید و روی بوم رها کنید یا روی کارت کلیک کنید.
      </p>

      <div className="process-toolbox__list">
        {STATE_TYPES.map((type) => {
          const Icon = type.Icon;
          return (
            <Tooltip key={type.id} title={type.hint} placement="left">
              <button
                type="button"
                className="process-toolbox__item"
                draggable={!disabled}
                disabled={disabled}
                onDragStart={(event) => {
                  event.dataTransfer.setData(DRAG_TYPE, String(type.id));
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => onAddNode(type.id)}
              >
                <span className={`process-toolbox__icon ${type.tone.icon}`}>
                  <Icon />
                </span>
                <span className="process-toolbox__item-body">
                  <span className="process-toolbox__item-label">
                    {type.label}
                  </span>
                  <span className="process-toolbox__item-hint">
                    {type.hint}
                  </span>
                </span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>

    {/* میان‌بُرها پیش‌فرض بسته‌اند تا جعبه‌ابزار شلوغ نشود. */}
    <Collapse
      ghost
      size="small"
      className="process-toolbox__shortcuts-collapse"
      items={[
        {
          key: "shortcuts",
          label: "راهنمای سریع و میان‌بُرها",
          children: (
            <ul className="process-toolbox__shortcuts">
              {SHORTCUTS.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <span className="process-toolbox__key">{item.key}</span>
                </li>
              ))}
            </ul>
          ),
        },
      ]}
    />
  </aside>
);

export default ProcessToolbox;
