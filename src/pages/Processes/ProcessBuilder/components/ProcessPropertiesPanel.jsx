import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Empty, Input, Select, Tag, Tooltip } from "antd";
import { Plus, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";

import { createAction, createPermission } from "../processGraph";
import { issueJumpLabel } from "../processIssues";
import {
  ACTION_TYPES,
  DEFAULT_GRANTEE_TYPE,
  PERMISSION_TYPES,
  STATE_TYPES,
  getActionType,
  getStateType,
} from "../processSchema";

const { TextArea } = Input;

/**
 * ورودی می‌تواند خروجی نرمال‌شده‌ی صفحه‌ی بیلدر ({ value, label }) باشد یا
 * پاسخ خام سرویس سمت‌ها ({ id, name })؛ هر دو حالت پشتیبانی می‌شود.
 */
const groupOptions = (groups) =>
  (Array.isArray(groups) ? groups : [])
    .map((group) => ({
      value: group?.value ?? group?.id,
      label: group?.label ?? group?.name ?? `سمت ${group?.value ?? group?.id}`,
    }))
    .filter((option) => option.value !== undefined && option.value !== null);

/**
 * لیست دسترسی‌های یک موجودیت (فرایند / مرحله / دکمه).
 * فیلدها دقیقاً همان فیلدهای serializer بک‌اند هستند:
 * process/state → group_id + permission_type + grantee_type
 * action → group_id + grantee_type (این مدل permission_type ندارد)
 */
const PermissionList = ({
  permissions,
  groups,
  groupsLoading,
  disabled,
  withType = true,
  onChange,
  onRemove,
  onAdd,
  hint,
}) => (
  <div className="process-panel__section">
    <div className="process-panel__section-head">
      <span className="process-panel__section-title">دسترسی سمت‌ها</span>
      <Button
        size="small"
        icon={<Plus size={14} />}
        onClick={onAdd}
        disabled={disabled}
      >
        افزودن
      </Button>
    </div>

    {hint ? <p className="process-panel__hint">{hint}</p> : null}

    {!groupsLoading && (groups?.length ?? 0) === 0 ? (
      <p className="process-panel__note">
        لیست سمت‌ها در دسترس شما نیست. برای تعیین دسترسی، از مدیر سیستم بخواهید
        دسترسی مدیریت سمت‌ها را برای شما فعال کند.
      </p>
    ) : null}

    {permissions.length === 0 ? (
      <p className="process-panel__note">هنوز دسترسی‌ای ثبت نشده است.</p>
    ) : (
      permissions.map((permission) => (
        <div className="process-panel__field" key={permission.id}>
          <div className="flex items-center gap-2">
            <Select
              className="grow"
              value={permission.groupId ?? undefined}
              options={groupOptions(groups)}
              loading={groupsLoading}
              placeholder="انتخاب سمت"
              notFoundContent={
                groupsLoading ? "در حال دریافت سمت‌ها…" : "سمتی یافت نشد"
              }
              showSearch
              optionFilterProp="label"
              disabled={disabled}
              onChange={(value) => onChange(permission.id, { groupId: value })}
            />

            {withType ? (
              <Select
                style={{ minWidth: 104 }}
                value={permission.permissionType}
                options={PERMISSION_TYPES.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                disabled={disabled}
                onChange={(value) =>
                  onChange(permission.id, { permissionType: value })
                }
              />
            ) : null}

            <Tooltip title="حذف دسترسی">
              <Button
                danger
                icon={<Trash2 size={14} />}
                disabled={disabled}
                onClick={() => onRemove(permission.id)}
              />
            </Tooltip>
          </div>

          {permission.groupName && !permission.groupId ? (
            <span className="process-panel__hint">{permission.groupName}</span>
          ) : null}
        </div>
      ))
    )}
  </div>
);

const ProcessPropertiesPanel = ({
  graph,
  selection,
  groups,
  groupsLoading,
  validation,
  onSelect,
  updateGraph,
  onDeleteNode,
  onDeleteEdge,
  onAddEdgeAction,
  onFocusNode,
  issueTargets,
  disabled,
}) => {
  const selectedNode = useMemo(() => {
    if (selection?.type !== "node") return null;
    return (
      graph?.nodes.find((node) => String(node.id) === String(selection.id)) ??
      null
    );
  }, [graph, selection]);

  const selectedEdge = useMemo(() => {
    if (selection?.type !== "edge") return null;
    return (
      graph?.edges.find((edge) => String(edge.id) === String(selection.id)) ??
      null
    );
  }, [graph, selection]);

  /** تب فعال پنل: مشخصات مورد انتخاب‌شده یا مشخصات کل فرایند. */
  const [tab, setTab] = useState("selection");
  // فهرست بلند هشدارها پیش‌فرض خلاصه است تا پنل دیوار متن نشود.
  const [showAllWarnings, setShowAllWarnings] = useState(false);

  // با هر انتخاب جدید، خودبه‌خود به تب مورد انتخاب‌شده برمی‌گردد.
  useEffect(() => {
    setTab("selection");
  }, [selection?.type, selection?.id]);

  if (!graph) return <aside className="process-panel" />;

  /* ------------------------------ کمکی‌ها ------------------------------ */

  const patchNode = (nodeId, patch, options) =>
    updateGraph(
      (current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          String(node.id) === String(nodeId) ? { ...node, ...patch } : node,
        ),
      }),
      options,
    );

  const patchEdge = (edgeId, patch, options) =>
    updateGraph(
      (current) => ({
        ...current,
        edges: current.edges.map((edge) =>
          String(edge.id) === String(edgeId) ? { ...edge, ...patch } : edge,
        ),
      }),
      options,
    );

  const patchAction = (actionId, patch, options) =>
    updateGraph(
      (current) => ({
        ...current,
        actions: current.actions.map((action) =>
          String(action.id) === String(actionId)
            ? { ...action, ...patch }
            : action,
        ),
      }),
      options,
    );

  const patchPermissions = (owner, ownerId, updater) => {
    if (owner === "process")
      updateGraph((current) => ({
        ...current,
        permissions: updater(current.permissions ?? []),
      }));
    else if (owner === "node")
      updateGraph((current) => ({
        ...current,
        nodes: current.nodes.map((node) =>
          String(node.id) === String(ownerId)
            ? { ...node, permissions: updater(node.permissions ?? []) }
            : node,
        ),
      }));
    else
      updateGraph((current) => ({
        ...current,
        actions: current.actions.map((action) =>
          String(action.id) === String(ownerId)
            ? { ...action, permissions: updater(action.permissions ?? []) }
            : action,
        ),
      }));
  };

  const permissionHandlers = (owner, ownerId, withType = true) => ({
    onAdd: () =>
      patchPermissions(owner, ownerId, (list) => [
        ...list,
        createPermission({
          permissionType: withType ? PERMISSION_TYPES[0].value : undefined,
          granteeType: DEFAULT_GRANTEE_TYPE,
        }),
      ]),
    onChange: (permissionId, patch) =>
      patchPermissions(owner, ownerId, (list) =>
        list.map((permission) =>
          String(permission.id) === String(permissionId)
            ? { ...permission, ...patch }
            : permission,
        ),
      ),
    onRemove: (permissionId) =>
      patchPermissions(owner, ownerId, (list) =>
        list.filter(
          (permission) => String(permission.id) !== String(permissionId),
        ),
      ),
  });

  /**
   * هر خطا/هشدار، اگر محل مشخصی داشته باشد، کلیک‌پذیر می‌شود.
   * همان مورد متمرکز می‌شود. متن پیام‌ها دست‌نخورده است.
   */
  const renderIssue = (text) => {
    const target = issueTargets?.get?.(text) ?? null;
    if (!target) return <li key={text}>{text}</li>;
    return (
      <li key={text}>
        <button
          type="button"
          className="process-panel__issue-link"
          onClick={() => {
            if (target.type === "node") onFocusNode?.(target.id);
            else onSelect?.(target);
          }}
        >
          <span>{text}</span>
          <span className="process-panel__issue-jump">
            {issueJumpLabel(target)}
          </span>
        </button>
      </li>
    );
  };

  const nodeName = (nodeId) => {
    const node = graph.nodes.find((item) => String(item.id) === String(nodeId));
    return node?.name || "بدون نام";
  };

  /* ------------------------------ مرحله ------------------------------ */

  if (selectedNode && tab === "selection") {
    const stateType = getStateType(selectedNode.stateTypeId);
    const outgoing = graph.edges.filter(
      (edge) => String(edge.source) === String(selectedNode.id),
    );
    const incoming = graph.edges.filter(
      (edge) => String(edge.target) === String(selectedNode.id),
    );

    return (
      <aside className="process-panel">
        <div className="process-panel__header">
          <span className="process-panel__title">مشخصات مرحله</span>
          <span className="process-panel__subtitle">{stateType.label}</span>
          <div className="process-panel__tabs">
            <button
              type="button"
              className="process-panel__tab process-panel__tab--active"
            >
              مشخصات مرحله
            </button>
            <button
              type="button"
              className="process-panel__tab"
              onClick={() => setTab("process")}
            >
              فرایند و دکمه‌ها
            </button>
          </div>
        </div>

        <div className="process-panel__section">
          <div className="process-panel__field">
            <label className="process-panel__label">
              نام مرحله <span className="process-panel__required">*</span>
            </label>
            <Input
              value={selectedNode.name}
              maxLength={255}
              disabled={disabled}
              placeholder="مانند: بررسی مدیر"
              onChange={(event) =>
                patchNode(
                  selectedNode.id,
                  { name: event.target.value },
                  { history: false },
                )
              }
            />
          </div>

          <div className="process-panel__field">
            <label className="process-panel__label">توضیحات</label>
            <TextArea
              value={selectedNode.description}
              rows={3}
              maxLength={255}
              disabled={disabled}
              onChange={(event) =>
                patchNode(
                  selectedNode.id,
                  { description: event.target.value },
                  { history: false },
                )
              }
            />
          </div>

          <div className="process-panel__field">
            <label className="process-panel__label">نوع مرحله</label>
            <Select
              value={selectedNode.stateTypeId}
              disabled={disabled}
              options={STATE_TYPES.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
              onChange={(value) =>
                patchNode(selectedNode.id, { stateTypeId: value })
              }
            />
            <span className="process-panel__hint">{stateType.hint}</span>
          </div>
        </div>

        <PermissionList
          permissions={selectedNode.permissions ?? []}
          groups={groups}
          groupsLoading={groupsLoading}
          disabled={disabled}
          hint="دسترسی مشاهده برای دیدن درخواست‌های این مرحله و دسترسی ویرایش برای تکمیل فرم در این مرحله لازم است."
          {...permissionHandlers("node", selectedNode.id)}
        />

        <div className="process-panel__section">
          <div className="process-panel__section-head">
            <span className="process-panel__section-title">مسیرها</span>
          </div>

          <div className="process-panel__meta">
            <span>{`ورودی: ${incoming.length}`}</span>
            <span>{`خروجی: ${outgoing.length}`}</span>
          </div>

          {[...incoming, ...outgoing].length === 0 ? (
            <p className="process-panel__note">
              برای ایجاد مسیر، از دایره‌ی پایین کارت مرحله استفاده کنید.
            </p>
          ) : (
            [...incoming, ...outgoing].map((edge) => (
              <button
                key={edge.id}
                type="button"
                className="process-panel__action-card"
                onClick={() => onSelect({ type: "edge", id: edge.id })}
              >
                <span className="process-panel__action-head">
                  {`${nodeName(edge.source)} ← ${nodeName(edge.target)}`}
                </span>
                <span className="process-panel__action-usage">
                  {`${(edge.actions ?? []).length} دکمه`}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="process-panel__section">
          <Button
            danger
            block
            icon={<Trash2 size={14} />}
            disabled={disabled}
            onClick={() => onDeleteNode(selectedNode.id)}
          >
            حذف مرحله
          </Button>
        </div>
      </aside>
    );
  }

  /* ------------------------------- مسیر ------------------------------- */

  if (selectedEdge && tab === "selection") {
    const attached = selectedEdge.actions ?? [];
    const available = graph.actions.filter(
      (action) =>
        !attached.some((link) => String(link.actionId) === String(action.id)),
    );

    return (
      <aside className="process-panel">
        <div className="process-panel__header">
          <span className="process-panel__title">مشخصات مسیر</span>
          <span className="process-panel__subtitle">
            {`${nodeName(selectedEdge.source)} ← ${nodeName(selectedEdge.target)}`}
          </span>
          <div className="process-panel__tabs">
            <button
              type="button"
              className="process-panel__tab process-panel__tab--active"
            >
              مشخصات مسیر
            </button>
            <button
              type="button"
              className="process-panel__tab"
              onClick={() => setTab("process")}
            >
              فرایند و دکمه‌ها
            </button>
          </div>
        </div>

        <div className="process-panel__section">
          <div className="process-panel__field">
            <label className="process-panel__label">مرحله مبدأ</label>
            <Select
              value={selectedEdge.source}
              disabled={disabled}
              options={graph.nodes.map((node) => ({
                value: node.id,
                label: node.name || "بدون نام",
              }))}
              onChange={(value) =>
                patchEdge(selectedEdge.id, { source: value })
              }
            />
          </div>

          <div className="process-panel__field">
            <label className="process-panel__label">مرحله مقصد</label>
            <Select
              value={selectedEdge.target}
              disabled={disabled}
              options={graph.nodes.map((node) => ({
                value: node.id,
                label: node.name || "بدون نام",
              }))}
              onChange={(value) =>
                patchEdge(selectedEdge.id, { target: value })
              }
            />
          </div>

          <p className="process-panel__hint">
            برای هر مسیر فقط مرحله مبدأ و مقصد ذخیره می‌شود؛ برچسب یا شرط ذخیره
            نمی‌شود.
          </p>
        </div>

        <div className="process-panel__section">
          <div className="process-panel__section-head">
            <span className="process-panel__section-title">دکمه این مسیر</span>
          </div>

          <p className="process-panel__hint">
            درخواست فقط وقتی به مرحله بعد می‌رود که همه‌ی دکمه‌های این مسیر
            انجام شود.
          </p>

          {/* پرتکرارترین کار، در یک کلیک. */}
          <div className="process-panel__quick-actions">
            <Button
              size="small"
              icon={<ThumbsUp size={14} />}
              disabled={disabled}
              onClick={() => onAddEdgeAction?.(selectedEdge.id, "approve")}
            >
              افزودن دکمه‌ی تأیید
            </Button>
            <Button
              size="small"
              icon={<ThumbsDown size={14} />}
              disabled={disabled}
              onClick={() => onAddEdgeAction?.(selectedEdge.id, "deny")}
            >
              افزودن دکمه‌ی رد
            </Button>
          </div>

          {attached.length === 0 ? (
            <p className="process-panel__note">دکمه‌ای متصل نشده است.</p>
          ) : (
            attached.map((link) => {
              const action = graph.actions.find(
                (item) => String(item.id) === String(link.actionId),
              );
              const actionType = getActionType(action?.actionTypeId);

              return (
                <div className="process-panel__action-card" key={link.id}>
                  <div className="process-panel__action-head">
                    <span>{action?.name || "دکمه حذف‌شده"}</span>
                    <div className="flex items-center gap-1">
                      <Tag className="process-panel__action-tag">
                        {actionType.label}
                      </Tag>
                      <Tooltip title="حذف دکمه از این مسیر">
                        <Button
                          size="small"
                          danger
                          icon={<Trash2 size={13} />}
                          disabled={disabled}
                          onClick={() =>
                            patchEdge(selectedEdge.id, {
                              actions: attached.filter(
                                (item) => String(item.id) !== String(link.id),
                              ),
                            })
                          }
                        />
                      </Tooltip>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="process-panel__field">
            <div className="process-panel__field-head">
              <label className="process-panel__label">افزودن دکمه</label>
              <Button
                size="small"
                icon={<Plus size={14} />}
                disabled={disabled}
                onClick={() => {
                  // ساخت دکمه در سطح فرایند و اتصال فوری به همین مسیر، در یک کلیک.
                  const action = createAction({
                    actionTypeId: ACTION_TYPES[0].id,
                    name: ACTION_TYPES[0].label,
                  });
                  updateGraph((current) => ({
                    ...current,
                    actions: [...current.actions, action],
                    edges: current.edges.map((edge) =>
                      String(edge.id) === String(selectedEdge.id)
                        ? {
                            ...edge,
                            actions: [
                              ...(edge.actions ?? []),
                              {
                                id: `tmp-transition-action-${action.id}`,
                                actionId: action.id,
                              },
                            ],
                          }
                        : edge,
                    ),
                  }));
                }}
              >
                ساخت دکمه جدید
              </Button>
            </div>
            <Select
              value={null}
              placeholder={
                available.length === 0
                  ? "دکمه جدید بسازید"
                  : "انتخاب از دکمه‌های موجود"
              }
              disabled={disabled || available.length === 0}
              options={available.map((action) => ({
                value: action.id,
                label: `${action.name || "بدون نام"} · ${getActionType(action.actionTypeId).label}`,
              }))}
              onChange={(value) =>
                patchEdge(selectedEdge.id, {
                  actions: [
                    ...attached,
                    { id: undefined, actionId: value },
                  ].map((item) => ({
                    ...item,
                    id:
                      item.id ??
                      `tmp-transition-action-${value}-${attached.length}`,
                  })),
                })
              }
            />
          </div>
        </div>

        <div className="process-panel__section">
          <Button
            danger
            block
            icon={<Trash2 size={14} />}
            disabled={disabled}
            onClick={() => onDeleteEdge(selectedEdge.id)}
          >
            حذف مسیر
          </Button>
        </div>
      </aside>
    );
  }

  /* -------------------------------- فرایند -------------------------------- */

  const usageCount = (actionId) =>
    graph.edges.reduce(
      (total, edge) =>
        total +
        (edge.actions ?? []).filter(
          (link) => String(link.actionId) === String(actionId),
        ).length,
      0,
    );

  return (
    <aside className="process-panel">
      <div className="process-panel__header">
        <span className="process-panel__title">مشخصات فرایند</span>
        <span className="process-panel__subtitle">
          برای دیدن جزئیات بیشتر، یک مرحله یا مسیر را انتخاب کنید.
        </span>
        {selectedNode || selectedEdge ? (
          <div className="process-panel__tabs">
            <button
              type="button"
              className="process-panel__tab"
              onClick={() => setTab("selection")}
            >
              {selectedNode ? "مشخصات مرحله" : "مشخصات مسیر"}
            </button>
            <button
              type="button"
              className="process-panel__tab process-panel__tab--active"
            >
              فرایند و دکمه‌ها
            </button>
          </div>
        ) : null}
      </div>

      <div className="process-panel__section">
        <div className="process-panel__field">
          <label className="process-panel__label">
            نام فرایند <span className="process-panel__required">*</span>
          </label>
          <Input
            value={graph.name}
            maxLength={255}
            disabled={disabled}
            onChange={(event) =>
              updateGraph(
                (current) => ({ ...current, name: event.target.value }),
                { history: false },
              )
            }
          />
          <span className="process-panel__hint">
            برای فرایند فقط نام ذخیره می‌شود؛ وضعیت، نسخه یا توضیحات ذخیره
            نمی‌شود.
          </span>
        </div>

        <div className="process-panel__meta">
          <span>{`${graph.nodes.length} مرحله`}</span>
          <span>{`${graph.edges.length} مسیر`}</span>
          <span>{`${graph.actions.length} دکمه`}</span>
        </div>
      </div>

      {validation?.errors?.length > 0 || validation?.warnings?.length > 0 ? (
        <div className="process-panel__issues">
          {validation.errors.length > 0 ? (
            <Alert
              className="process-panel__alert"
              type="error"
              showIcon
              message="قبل از ذخیره باید اصلاح شود"
              description={
                <ul className="process-panel__issue-list">
                  {validation.errors.map((error) => renderIssue(error))}
                </ul>
              }
            />
          ) : null}

          {validation.warnings.length > 0 ? (
            <Alert
              className="process-panel__alert"
              type="warning"
              showIcon
              message="هشدارها"
              description={
                <>
                  <ul className="process-panel__issue-list">
                    {(showAllWarnings
                      ? validation.warnings
                      : validation.warnings.slice(0, 3)
                    ).map((warning) => renderIssue(warning))}
                  </ul>
                  {validation.warnings.length > 3 ? (
                    <Button
                      type="link"
                      size="small"
                      className="process-panel__issue-toggle"
                      onClick={() => setShowAllWarnings((prev) => !prev)}
                    >
                      {showAllWarnings
                        ? "خلاصه‌ی هشدارها"
                        : `نمایش ${validation.warnings.length - 3} هشدار دیگر`}
                    </Button>
                  ) : null}
                </>
              }
            />
          ) : null}
        </div>
      ) : null}

      <PermissionList
        permissions={graph.permissions ?? []}
        groups={groups}
        groupsLoading={groupsLoading}
        disabled={disabled}
        hint="دسترسی مشاهده برای دیدن فرایند و دسترسی ویرایش برای مدیریت اجزای آن (مرحله، مسیر، دکمه) لازم است."
        {...permissionHandlers("process", graph.id)}
      />

      <div className="process-panel__section">
        <div className="process-panel__section-head">
          <span className="process-panel__section-title">دکمه‌های فرایند</span>
          <Button
            size="small"
            icon={<Plus size={14} />}
            disabled={disabled}
            onClick={() =>
              updateGraph((current) => ({
                ...current,
                actions: [
                  ...current.actions,
                  createAction({
                    actionTypeId: ACTION_TYPES[0].id,
                    name: ACTION_TYPES[0].label,
                  }),
                ],
              }))
            }
          >
            دکمه جدید
          </Button>
        </div>

        {graph.actions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="دکمه‌ای تعریف نشده است"
          />
        ) : (
          <div className="process-panel__actions">
            {graph.actions.map((action) => {
              const actionType = getActionType(action.actionTypeId);

              return (
                <div className="process-panel__action-card" key={action.id}>
                  <div className="process-panel__action-head">
                    <Tag className="process-panel__action-tag">
                      {actionType.label}
                    </Tag>
                    <span className="process-panel__action-usage">
                      {`در ${usageCount(action.id)} مسیر`}
                    </span>
                    <Tooltip title="حذف دکمه">
                      <Button
                        size="small"
                        danger
                        icon={<Trash2 size={13} />}
                        disabled={disabled}
                        onClick={() =>
                          updateGraph((current) => ({
                            ...current,
                            actions: current.actions.filter(
                              (item) => String(item.id) !== String(action.id),
                            ),
                            edges: current.edges.map((edge) => ({
                              ...edge,
                              actions: (edge.actions ?? []).filter(
                                (link) =>
                                  String(link.actionId) !== String(action.id),
                              ),
                            })),
                          }))
                        }
                      />
                    </Tooltip>
                  </div>

                  <div className="process-panel__field">
                    <label className="process-panel__label">
                      نام <span className="process-panel__required">*</span>
                    </label>
                    <Input
                      value={action.name}
                      maxLength={255}
                      disabled={disabled}
                      placeholder="مانند: تأیید مدیر"
                      onChange={(event) =>
                        patchAction(
                          action.id,
                          { name: event.target.value },
                          { history: false },
                        )
                      }
                    />
                  </div>

                  <div className="process-panel__field">
                    <label className="process-panel__label">
                      توضیحات <span className="process-panel__required">*</span>
                    </label>
                    <TextArea
                      value={action.description}
                      rows={2}
                      disabled={disabled}
                      onChange={(event) =>
                        patchAction(
                          action.id,
                          { description: event.target.value },
                          { history: false },
                        )
                      }
                    />
                  </div>

                  <div className="process-panel__field">
                    <label className="process-panel__label">نوع دکمه</label>
                    <Select
                      value={action.actionTypeId}
                      disabled={disabled}
                      options={ACTION_TYPES.map((item) => ({
                        value: item.id,
                        label: item.label,
                      }))}
                      onChange={(value) =>
                        patchAction(action.id, { actionTypeId: value })
                      }
                    />
                  </div>

                  <PermissionList
                    permissions={action.permissions ?? []}
                    groups={groups}
                    groupsLoading={groupsLoading}
                    disabled={disabled}
                    withType={false}
                    hint="مشخص می‌کند چه سمت‌هایی می‌توانند این دکمه را انجام دهند."
                    {...permissionHandlers("action", action.id, false)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ProcessPropertiesPanel;
