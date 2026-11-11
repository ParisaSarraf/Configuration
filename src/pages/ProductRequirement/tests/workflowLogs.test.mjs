import test from 'node:test';
import assert from 'node:assert/strict';
import { orderWorkflowLogs, workflowLogsPath } from '../utils/workflowLogs.js';

test('orders and deduplicates logs across state responses without losing return transitions', () => {
  const one = {id: 1, from_state: 10, to_state: 20, changed_at: '2026-11-08T10:00:00Z'};
  const two = {id: 2, from_state: 20, to_state: 10, changed_at: '2026-11-08T11:00:00Z'};
  assert.deepEqual(orderWorkflowLogs([[two, one], [one], undefined]), [one, two]);
});
test('keeps distinct no-id events by actor and does not mutate input', () => {
  const late = {from_state: 10, to_state: 20, changed_at: '2026-11-09', changed_by: {id: 2}};
  const early = {from_state: 10, to_state: 20, changed_at: '2026-11-08', changed_by: {id: 1}};
  const input = [late, early];
  assert.deepEqual(orderWorkflowLogs([input, [early]]), [early, late]);
  assert.deepEqual(input, [late, early]);
});

test('uses the edition or assignment id, state and exact model in the API path', () => {
  assert.equal(workflowLogsPath(15, 20, 'product_requirement_edition'), '/product/get-change-state-logs/15/20/product_requirement_edition');
  assert.equal(workflowLogsPath(7, 30, 'product_requirement_edition_exported'), '/product/get-change-state-logs/7/30/product_requirement_edition_exported');
});
