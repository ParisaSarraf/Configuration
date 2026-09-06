/**
 * مدل استاتیک فرایند دقیقاً مطابق Backend Contract.
 *
 * StateType و ActionType در بک‌اند دیتای ثابت (fixture) هستند و با
 * `python manage.py loaddata initial_work_flow_data.yaml` در دیتابیس قرار می‌گیرند؛
 * برای این دو مدل API لیست جداگانه‌ای وجود ندارد، بنابراین همان شناسه‌های ثابت
 * همین جا نگاشت می‌شوند و هیچ نوع تازه‌ای به آن اضافه نشده است.
 */
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DislikeOutlined,
  IssuesCloseOutlined,
  LikeOutlined,
  PlayCircleOutlined,
  ProfileOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";

/* ------------------------------ StateType ------------------------------ */

export const STATE_TYPE_IDS = Object.freeze({
  CANCELLED: 1,
  START: 2,
  NORMAL: 3,
  COMPLETE: 4,
  DENIED: 5,
});

/**
 * ترتیب نمایش در Toolbox: شروع ← عادی ← پایان ← رد ← لغو
 * shape فقط جنبه‌ی بصری دارد و در پایلود API ارسال نمی‌شود.
 */
export const STATE_TYPES = Object.freeze([
  {
    id: STATE_TYPE_IDS.START,
    key: "start",
    label: "ایستگاه شروع",
    shortLabel: "شروع",
    hint: "نقطه‌ی آغاز فرایند؛ درخواست از این ایستگاه وارد می‌شود.",
    Icon: PlayCircleOutlined,
    shape: "pill",
    stroke: "#059669",
    tone: {
      node: "process-node--start",
      icon: "bg-emerald-50 text-emerald-600",
      chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  },
  {
    id: STATE_TYPE_IDS.NORMAL,
    key: "normal",
    label: "ایستگاه عادی",
    shortLabel: "عادی",
    hint: "مرحله‌ی کاری میانی مانند بررسی کارشناس یا تأیید مدیر.",
    Icon: ProfileOutlined,
    shape: "box",
    stroke: "#2B3B50",
    tone: {
      node: "process-node--normal",
      icon: "bg-slate-100 text-slate-600",
      chip: "bg-slate-100 text-slate-700 border-slate-200",
    },
  },
  {
    id: STATE_TYPE_IDS.COMPLETE,
    key: "complete",
    label: "ایستگاه پایان",
    shortLabel: "پایان",
    hint: "درخواست پس از رسیدن به این ایستگاه خاتمه‌یافته تلقی می‌شود.",
    Icon: CheckCircleOutlined,
    shape: "pill",
    stroke: "#2563eb",
    tone: {
      node: "process-node--complete",
      icon: "bg-blue-50 text-blue-600",
      chip: "bg-blue-50 text-blue-700 border-blue-200",
    },
  },
  {
    id: STATE_TYPE_IDS.DENIED,
    key: "denied",
    label: "ایستگاه رد شده",
    shortLabel: "رد شده",
    hint: "پایان فرایند با نتیجه‌ی رد درخواست.",
    Icon: CloseCircleOutlined,
    shape: "pill",
    stroke: "#dc2626",
    tone: {
      node: "process-node--denied",
      icon: "bg-rose-50 text-rose-600",
      chip: "bg-rose-50 text-rose-700 border-rose-200",
    },
  },
  {
    id: STATE_TYPE_IDS.CANCELLED,
    key: "cancelled",
    label: "ایستگاه لغو شده",
    shortLabel: "لغو شده",
    hint: "پایان فرایند با لغو درخواست.",
    Icon: StopOutlined,
    shape: "pill",
    stroke: "#d97706",
    tone: {
      node: "process-node--cancelled",
      icon: "bg-amber-50 text-amber-600",
      chip: "bg-amber-50 text-amber-700 border-amber-200",
    },
  },
]);

/* ------------------------------ ActionType ------------------------------ */

export const ACTION_TYPE_IDS = Object.freeze({
  APPROVE: 1,
  DENY: 2,
  CANCEL: 3,
  RESTART: 4,
  RESOLVE: 5,
});

export const ACTION_TYPES = Object.freeze([
  {
    id: ACTION_TYPE_IDS.APPROVE,
    key: "approve",
    label: "تأیید",
    Icon: LikeOutlined,
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: ACTION_TYPE_IDS.DENY,
    key: "deny",
    label: "رد",
    Icon: DislikeOutlined,
    chip: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: ACTION_TYPE_IDS.CANCEL,
    key: "cancel",
    label: "لغو",
    Icon: StopOutlined,
    chip: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: ACTION_TYPE_IDS.RESTART,
    key: "restart",
    label: "شروع مجدد",
    Icon: ReloadOutlined,
    chip: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: ACTION_TYPE_IDS.RESOLVE,
    key: "resolve",
    label: "حل شده",
    Icon: IssuesCloseOutlined,
    chip: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
]);

/* ------------------------------ دسترسی‌ها ------------------------------ */

// PermissionType.choices در مدل بک‌اند: view / edit
export const PERMISSION_TYPES = Object.freeze([
  { value: "view", label: "مشاهده" },
  { value: "edit", label: "ویرایش" },
]);

// GranteeType.choices در مدل بک‌اند: group / creator
// طبق مستندات، فعلاً فقط group استفاده می‌شود.
export const GRANTEE_TYPES = Object.freeze([
  { value: "group", label: "سمت (گروه)" },
  { value: "creator", label: "ایجادکننده" },
]);

export const DEFAULT_GRANTEE_TYPE = "group";

/* ------------------------------ ابعاد بوم ------------------------------ */

export const NODE_WIDTH = 184;
export const NODE_HEIGHT = 76;
export const GRID_SIZE = 8;
export const CANVAS_PADDING = 48;
export const MIN_ZOOM = 0.4;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 0.1;

/* ------------------------------- کمکی ‑ها ------------------------------- */

export const getStateType = (stateTypeId) =>
  STATE_TYPES.find((type) => type.id === Number(stateTypeId)) ??
  STATE_TYPES.find((type) => type.id === STATE_TYPE_IDS.NORMAL);

export const getActionType = (actionTypeId) =>
  ACTION_TYPES.find((type) => type.id === Number(actionTypeId)) ??
  ACTION_TYPES.find((type) => type.id === ACTION_TYPE_IDS.APPROVE);

export const getStateTypeLabel = (stateTypeId) =>
  getStateType(stateTypeId).label;

export const getActionTypeLabel = (actionTypeId) =>
  getActionType(actionTypeId).label;

export const getPermissionTypeLabel = (value) =>
  PERMISSION_TYPES.find((item) => item.value === value)?.label ?? value;

export const getGranteeTypeLabel = (value) =>
  GRANTEE_TYPES.find((item) => item.value === value)?.label ?? value;

// ایستگاه‌های پایانی: پایان، رد شده، لغو شده
export const TERMINAL_STATE_TYPE_IDS = Object.freeze([
  STATE_TYPE_IDS.COMPLETE,
  STATE_TYPE_IDS.DENIED,
  STATE_TYPE_IDS.CANCELLED,
]);

export const isTerminalStateType = (stateTypeId) =>
  TERMINAL_STATE_TYPE_IDS.includes(Number(stateTypeId));

export const isStartStateType = (stateTypeId) =>
  Number(stateTypeId) === STATE_TYPE_IDS.START;
