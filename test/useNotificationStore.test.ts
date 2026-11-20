import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '../src/store/useNotificationStore';

beforeEach(() => {
  localStorage.clear();
  useNotificationStore.setState({ readIds: [] });
});

describe('useNotificationStore', () => {
  it('markAsRead adds an id and persists it', () => {
    useNotificationStore.getState().markAsRead('n1');
    expect(useNotificationStore.getState().readIds).toContain('n1');
    expect(JSON.parse(localStorage.getItem('read_notifications')!)).toContain('n1');
  });

  it('markAsRead does not duplicate ids', () => {
    useNotificationStore.getState().markAsRead('n1');
    useNotificationStore.getState().markAsRead('n1');
    expect(useNotificationStore.getState().readIds.filter((x) => x === 'n1')).toHaveLength(1);
  });

  it('markAllRead merges unique ids', () => {
    useNotificationStore.getState().markAsRead('n1');
    useNotificationStore.getState().markAllRead(['n1', 'n2', 'n3']);
    const ids = useNotificationStore.getState().readIds;
    expect(ids).toEqual(expect.arrayContaining(['n1', 'n2', 'n3']));
    expect(ids).toHaveLength(3);
  });
});
