import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import CitizenDashboard from '../src/pages/CitizenDashboard';
import api from '../src/lib/axios';
import { useAuthStore } from '../src/store/useAuthStore';

vi.mock('../src/lib/axios', () => ({
  API_ORIGIN: '',
  default: { get: vi.fn(), post: vi.fn() }
}));

it('opens the chat assistant from the profile and requests a verified correction', async () => {
  const profile = { fullName: 'Test Citizen', dob: '2000-01-01T00:00:00.000Z', phone: '' };
  vi.mocked(api.get).mockImplementation(async path => ({
    data: path === '/citizen/profile' ? profile : []
  }));
  vi.mocked(api.post)
    .mockResolvedValueOnce({
      data: {
        verification: 'test-grant',
        suggestion: { category: 'PERSONAL', field: null },
        catalog: [{ id: 'PERSONAL', label: 'Personal Info', fields: [
          { key: 'fullName', label: 'Full Name', kind: 'text', required: true }
        ] }]
      }
    })
    .mockResolvedValueOnce({ data: {} });
  useAuthStore.setState({ user: { id: 'citizen-1', email: 'citizen@example.test', role: 'Citizen' } });

  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/citizen/profile']}>
      <Routes>
        <Route path="/citizen/*" element={<CitizenDashboard />} />
      </Routes>
    </MemoryRouter>
  );

  await user.click(await screen.findByRole('button', { name: 'Request correction' }));
  expect(screen.getByRole('button', { name: 'AI Assistant' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByLabelText('Field to correct')).toBeNull();
  await user.type(screen.getByLabelText('Current password'), '1234');
  await user.click(screen.getByRole('button', { name: 'Verify and open form' }));
  await user.selectOptions(await screen.findByLabelText('Field to correct'), 'fullName');
  const name = screen.getByLabelText('Full Name');
  expect(name).toHaveValue('Test Citizen');
  await user.clear(name);
  await user.type(name, 'Corrected Citizen');
  await user.type(screen.getByLabelText('Why is this information wrong?'), 'There was a spelling error.');
  await user.click(screen.getByRole('button', { name: 'Submit for review' }));

  expect(await screen.findByText('Request sent for admin review.')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Test Citizen' })).toBeVisible();
  expect(api.post).toHaveBeenNthCalledWith(1, '/citizen/change-requests/verify', {
    category: 'PERSONAL', password: '1234', message: ''
  });
  expect(api.post).toHaveBeenNthCalledWith(2, '/citizen/change-requests', {
    verification: 'test-grant',
    category: 'PERSONAL', reason: 'There was a spelling error.', changes: { fullName: 'Corrected Citizen' }
  });
  expect(sessionStorage.getItem('sctn:correction:citizen-1')).toBeNull();
});
