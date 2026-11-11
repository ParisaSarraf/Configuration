// IDs, state and model are all path parameters in the change-state logs API.
export function workflowLogsPath(id, state, model) {
  return `/product/get-change-state-logs/${encodeURIComponent(id)}/${encodeURIComponent(state)}/${encodeURIComponent(model)}`;
}

// Different state requests may return the same transition. Keep each event once.
export function orderWorkflowLogs(responses) {
  const seen = new Set();
  return responses.flatMap((items) => Array.isArray(items) ? items : [])
    .filter((log) => {
      if (!log) return false;
      const key = log.id != null ? `id:${log.id}` : JSON.stringify([log.from_state, log.to_state, log.changed_at, log.changed_by?.id, log.comment]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (Date.parse(a.changed_at) || 0) - (Date.parse(b.changed_at) || 0));
}
