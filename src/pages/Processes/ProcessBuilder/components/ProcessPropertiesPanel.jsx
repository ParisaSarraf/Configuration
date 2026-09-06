import { useMemo } from "react";
import { Alert, Button, Empty, Input, Select, Tag, Tooltip } from "antd";
import { Plus, Trash2 } from "lucide-react";

import { createAction, createPermission } from "../processGraph";
import {
  ACTION_TYPES,
  DEFAULT_GRANTEE_TYPE,
  PERMISSION_TYPES,
  STATE_TYPES,
  getActionType,
  getStateType,
} from "../processSchema";

const { TextArea } = Input;

const groupOptions = (groups) =>
  groups.map((group) => ({ value: group.id, label: group.name }));

/**
 * لیست دسترسی‌های یک موجودیت (فرایند / ایستگاه / عملیات).
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

  const nodeName = (nodeId) => {
    const node = graph.nodes.find((item) => String(item.id) === String(nodeId));
    return node?.name || "بدون نام";
  };

  /* ------------------------------ ایستگاه ------------------------------ */

  if (selectedNode) {
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
          <span className="process-panel__title">مشخصات ایستگاه</span>
          <span className="process-panel__subtitle">{stateType.label}</span>
        </div>

        <div className="process-panel__section">
          <div className="process-panel__field">
            <label className="process-panel__label">
              نام ایستگاه <span className="process-panel__required">*</span>
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
            <label className="process-panel__label">نوع ایستگاه</label>
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
          hint="دسترسی مشاهده برای دیدن درخواست‌های این ایستگاه و دسترسی ویرایش برای تکمیل فرم در این ایستگاه لازم است."
          {...permissionHandlers("node", selectedNode.id)}
        />

        <div className="process-panel__section">
          <div className="process-panel__section-head">
            <span className="process-panel__section-title">ارتباط‌ها</span>
          </div>

          <div className="process-panel__meta">
            <span>{`ورودی: ${incoming.length}`}</span>
            <span>{`خروجی: ${outgoing.length}`}</span>
          </div>

          {[...incoming, ...outgoing].length === 0 ? (
            <p className="process-panel__note">
              برای ایجاد ارتباط، از دایره‌ی پایین کارت ایستگاه استفاده کنید.
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
                  {`${(edge.actions ?? []).length} عملیات`}
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
            حذف ایستگاه
          </Button>
        </div>
      </aside>
    );
  }

  /* ------------------------------- ارتباط ------------------------------- */

  if (selectedEdge) {
    const attached = selectedEdge.actions ?? [];
    const available = graph.actions.filter(
      (action) =>
        !attached.some((link) => String(link.actionId) === String(action.id)),
    );

    return (
      <aside className="process-panel">
        <div className="process-panel__header">
          <span className="process-panel__title">مشخصات ارتباط</span>
          <span className="process-panel__subtitle">
            {`${nodeName(selectedEdge.source)} ← ${nodeName(selectedEdge.target)}`}
          </span>
        </div>

        <div className="process-panel__section">
          <div className="process-panel__field">
            <label className="process-panel__label">ایستگاه مبدأ</label>
            <Select
              value={selectedEdge.source}
              disabled={disabled}
              options={graph.nodes.map((node) => ({
                value: node.id,
                label: node.name || "بدون نام",
              }))}
              onChange={(value) => patchEdge(selectedEdge.id, { source: value })}
            />
          </div>

          <div className="process-panel__field">
            <label className="process-panel__label">ایستگاه مقصد</label>
            <Select
              value={selectedEdge.target}
              disabled={disabled}
              options={graph.nodes.map((node) => ({
                value: node.id,
                label: node.name || "بدون نام",
              }))}
              onChange={(value) => patchEdge(selectedEdge.id, { target: value })}
            />
          </div>

          <p className="process-panel__hint">
            مدل بک‌اند برای ارتباط فقط فرایند، ایستگاه مبدأ و ایستگاه مقصد دارد؛
            برچسب یا شرط ذخیره نمی‌شود.
          </p>
        </div>

        <div className="process-panel__section">
          <div className="process-panel__section-head">
            <span className="process-panel__section-title">عملیات این ارتباط</span>
          </div>

          <p className="process-panel__hint">
            درخواست فقط وقتی به ایستگاه بعد می‌رود که همه‌ی عملیات‌های این ارتباط انجام
            شود.
          </p>

          {attached.length === 0 ? (
            <p className="process-panel__note">عملیاتی متصل نشده است.</p>
          ) : (
            attached.map((link) => {
              const action = graph.actions.find(
                (item) => String(item.id) === String(link.actionId),
              );
              const actionType = getActionType(action?.actionTypeId);

              return (
                <div className="process-panel__action-card" key={link.id}>
                  <div className="process-panel__action-head">
                    <span>{action?.name || "عملیات حذف‌شده"}</span>
                    <div className="flex items-center gap-1">
                      <Tag className="process-panel__action-tag">
                        {actionType.label}
                      </Tag>
                      <Tooltip title="حذف عملیات از این ارتباط">
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
            <label className="process-panel__label">افزودن عملیات</label>
            <Select
              value={null}
              placeholder={
                graph.actions.length === 0
                  ? "اول از بخش فرایند یک عملیات بسازید"
                  : "انتخاب عملیات"
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
                    id: item.id ?? `tmp-transition-action-${value}-${attached.length}`,
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
            حذف ارتباط
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
          برای دیدن جزئیات بیشتر، یک ایستگاه یا ارتباط را انتخاب کنید.
        </span>
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
            مدل Process در بک‌اند فقط فیلد نام دارد؛ وضعیت، نسخه یا توضیحات ذخیره
            نمی‌شود.
          </span>
        </div>

        <div className="process-panel__meta">
          <span>{`${graph.nodes.length} ایستگاه`}</span>
          <span>{`${graph.edges.length} ارتباط`}</span>
          <span>{`${graph.actions.length} عملیات`}</span>
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
                <ul>
                  {validation.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
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
                <ul>
                  {validation.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
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
        hint="دسترسی مشاهده برای دیدن فرایند و دسترسی ویرایش برای مدیریت اجزای آن (ایستگاه، ارتباط، عملیات) لازم است."
        {...permissionHandlers("process", graph.id)}
      />

      <div className="process-panel__section">
        <div className="process-panel__section-head">
          <span className="process-panel__section-title">عملیات‌های فرایند</span>
          <Button
            size="small"
            icon={<Plus size={14} />}
            disabled={disabled}
            onClick={() =>
              updateGraph((current) => ({
                ...current,
                actions: [
                  ...current.actions,
                  createAction({ actionTypeId: ACTION_TYPES[0].id }),
                ],
              }))
            }
          >
            عملیات جدید
          </Button>
        </div>

        {graph.actions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="عملیاتی تعریف نشده است"
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
                      {`در ${usageCount(action.id)} ارتباط`}
                    </span>
                    <Tooltip title="حذف عملیات">
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
                    <label className="process-panel__label">نوع عملیات</label>
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
                    hint="مشخص می‌کند چه سمت‌هایی می‌توانند این عملیات را انجام دهند."
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
