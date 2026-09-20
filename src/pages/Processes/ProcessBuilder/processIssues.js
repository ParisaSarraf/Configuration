/**
 * لایه‌ی کمکی و کاملاً نمایشی (UI-only).
 *
 * `validateGraph` در processGraph.js تنها مرجع تشخیص خطا و هشدار است و اینجا
 * هیچ قاعده‌ی تازه‌ای اضافه یا تغییر نمی‌شود. فقط برای هر پیام،
 * «محل مربوطه روی بوم» مشخص می‌شود تا کاربر با یک کلیک به همان مرحله یا
 * مسیر برود. اگر پیامی محل مشخصی نداشته باشد، null برمی‌گردد و پیام
 * دقیقاً مانند قبل فقط نمایش داده می‌شود.
 */
import { isStartStateType, isTerminalStateType } from "./processSchema";

const trimmed = (value) => (typeof value === "string" ? value.trim() : "");

const nodeTarget = (node) => ({ type: "node", id: node.id });
const edgeTarget = (edge) => ({ type: "edge", id: edge.id });

/**
 * نقشه‌ی «متن پیام → محل مشکل».
 * کلیدها عیناً همان رشته‌هایی هستند که validateGraph تولید می‌کند؛ اگر یک پیام
 * برای چند مورد تکرار شده باشد، اولین مورد ثبت می‌شود.
 */
export const buildIssueTargets = (graph) => {
  const targets = new Map();
  if (!graph) return targets;

  const remember = (message, target) => {
    if (!message || targets.has(message)) return;
    targets.set(message, target);
  };

  graph.nodes.forEach((node) => {
    if (!trimmed(node.name)) {
      remember("نام همه‌ی مراحل باید پر شود.", nodeTarget(node));
    }
    if (trimmed(node.name).length > 255) {
      remember(
        `نام مرحله «${node.name}» بیش از ۲۵۵ کاراکتر است.`,
        nodeTarget(node),
      );
    }
    (node.permissions ?? []).forEach((permission) => {
      if (permission.granteeType === "group" && !permission.groupId) {
        remember(
          `برای دسترسی مرحله «${node.name || "بی‌نام"}» باید سمت انتخاب شود.`,
          nodeTarget(node),
        );
      }
    });
  });

  const seenEdges = new Set();
  graph.edges.forEach((edge) => {
    const key = `${edge.source}->${edge.target}`;
    if (seenEdges.has(key)) {
      remember("بین دو مرحله مسیر تکراری وجود دارد.", edgeTarget(edge));
    }
    seenEdges.add(key);

    if ((edge.actions ?? []).length === 0) {
      remember(
        "برای یک مسیر هیچ عملیاتی تعریف نشده؛ درخواست در آن مرحله قابل پیشروی نیست.",
        edgeTarget(edge),
      );
    }
  });

  graph.nodes.forEach((node) => {
    const hasOutgoing = graph.edges.some(
      (edge) => String(edge.source) === String(node.id),
    );
    const hasIncoming = graph.edges.some(
      (edge) => String(edge.target) === String(node.id),
    );

    if (!hasOutgoing && !isTerminalStateType(node.stateTypeId)) {
      remember(
        `مرحله «${node.name || "بی‌نام"}» مسیر خروجی ندارد.`,
        nodeTarget(node),
      );
    }
    if (!hasIncoming && !isStartStateType(node.stateTypeId)) {
      remember(
        `مرحله «${node.name || "بی‌نام"}» مسیر ورودی ندارد و در دسترس قرار نمی‌گیرد.`,
        nodeTarget(node),
      );
    }
  });

  // مشکلات مربوط به عملیات را به اولین مسیری که آن عملیات رویش نشسته
  // وصل می‌کنیم تا کاربر بداند کدام مرحله از فرایند منظور است.
  const edgeOfAction = new Map();
  graph.edges.forEach((edge) => {
    (edge.actions ?? []).forEach((link) => {
      const actionId = String(link.actionId);
      if (!edgeOfAction.has(actionId)) edgeOfAction.set(actionId, edge);
    });
  });

  graph.actions.forEach((action) => {
    const edge = edgeOfAction.get(String(action.id));
    const label = action.name || "بی‌نام";
    if (!edge) return;

    if (!trimmed(action.description)) {
      remember(`توضیحات عملیات «${label}» الزامی است.`, edgeTarget(edge));
    }
    if ((action.permissions ?? []).length === 0) {
      remember(
        `عملیات «${label}» به هیچ سمتی داده نشده است.`,
        edgeTarget(edge),
      );
    }
    (action.permissions ?? []).forEach((permission) => {
      if (permission.granteeType === "group" && !permission.groupId) {
        remember(
          `برای دسترسی عملیات «${label}» باید سمت انتخاب شود.`,
          edgeTarget(edge),
        );
      }
    });
  });

  return targets;
};

/** برچسب کوتاه عملیات  پرش، بر اساس نوع محل مشکل. */
export const issueJumpLabel = (target) => {
  if (!target) return "";
  return target.type === "edge" ? "نمایش مسیر" : "نمایش مرحله";
};
