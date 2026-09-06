/* eslint-disable react/prop-types */
import { Tooltip } from "antd";

import { STATE_TYPES } from "../processSchema";

const DRAG_TYPE = "application/x-process-state-type";

/**
 * جعبه‌ابزار ایستگاه‌ها.
 * فقط همان ۵ نوع StateType موجود در بک‌اند نمایش داده می‌شود.
 */
const ProcessToolbox = ({ onAddNode, disabled }) => (
  <aside className="process-toolbox">
    <div className="process-toolbox__section">
      <p className="process-toolbox__title">ایستگاه‌ها</p>
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
                  <span className="process-toolbox__item-hint">{type.hint}</span>
                </span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>

    <div className="process-toolbox__section process-toolbox__section--muted">
      <p className="process-toolbox__title">راهنمای سریع</p>
      <ul className="process-toolbox__shortcuts">
        <li>
          <span>اتصال دو ایستگاه</span>
          <span className="process-toolbox__key">دکمه‌ی پایین ایستگاه</span>
        </li>
        <li>
          <span>حرکت در بوم</span>
          <span className="process-toolbox__key">درکگ زمینه</span>
        </li>
        <li>
          <span>بزرگ‌نمایی</span>
          <span className="process-toolbox__key">Ctrl + اسکرول</span>
        </li>
        <li>
          <span>حذف انتخاب‌شده</span>
          <span className="process-toolbox__key">Delete</span>
        </li>
        <li>
          <span>بازگردانی / انجام مجدد</span>
          <span className="process-toolbox__key">Ctrl + Z / Shift + Z</span>
        </li>
        <li>
          <span>لغو عملیات</span>
          <span className="process-toolbox__key">Esc</span>
        </li>
      </ul>
    </div>
  </aside>
);

export default ProcessToolbox;
