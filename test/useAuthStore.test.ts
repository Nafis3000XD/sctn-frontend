import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../src/store/useAuthStore';

beforeEach(() => {
  sessionStorage.clear();
  useAuthStore.setState({ user: null, token: null });
});

describe('useAuthStore', () => {
  const user = { id: 'u1', email: 'a@b.com', role: 'Citizen' };

  it('login stores user + token in state and sessionStorage', () => {
    useAuthStore.getState().login(user, 'tok123');
    const s = useAuthStore.getState();
    expect(s.user).toEqual(user);
    expect(s.token).toBe('tok123');
    expect(sessionStorage.getItem('token')).toBe('tok123');
    expect(JSON.parse(sessionStorage.getItem('user')!)).toEqual(user);
  });

  it('logout clears state and sessionStorage', () => {
    useAuthStore.getState().login(user, 'tok123');
    useAuthStore.getState().logout();
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  it('updateProfilePicture updates the user and persists it', () => {
    useAuthStore.getState().login(user, 'tok123');
    useAuthStore.getState().updateProfilePicture('/uploads/pic.png');
    expect(useAuthStore.getState().user?.profilePicture).toBe('/uploads/pic.png');
    expect(JSON.parse(sessionStorage.getItem('user')!).profilePicture).toBe('/uploads/pic.png');
  });

  it('updateProfilePicture is a no-op when logged out', () => {
    useAuthStore.getState().updateProfilePicture('/uploads/pic.png');
    expect(useAuthStore.getState().user).toBeNull();
  });
});
