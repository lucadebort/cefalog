import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Auth } from '../components/Auth';

// Mock supabase
const mockSignUp = vi.fn();
const mockSignIn = vi.fn();

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: (...args: any[]) => mockSignUp(...args),
      signInWithPassword: (...args: any[]) => mockSignIn(...args),
    },
  },
}));

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form by default', () => {
    render(<Auth />);

    expect(screen.getByText('CefaLog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nome@esempio.com')).toBeInTheDocument();
    expect(screen.getByText('Accedi al Diario')).toBeInTheDocument();
    expect(screen.getByText('Registrati')).toBeInTheDocument();
  });

  it('should switch to signup mode when clicking Registrati', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    await user.click(screen.getByText('Registrati'));

    expect(screen.getByText('Crea Account')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('should show privacy consent checkbox only in signup mode', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    // In login mode, no checkbox
    expect(screen.queryByText(/acconsento al trattamento/i)).not.toBeInTheDocument();

    // Switch to signup
    await user.click(screen.getByText('Registrati'));

    // Now checkbox should be visible
    expect(screen.getByText(/acconsento al trattamento/i)).toBeInTheDocument();
  });

  it('should show error for password less than 8 characters', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    await user.type(screen.getByPlaceholderText('nome@esempio.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'short');
    await user.click(screen.getByText('Accedi al Diario'));

    await waitFor(() => {
      expect(screen.getByText('La password deve contenere almeno 8 caratteri')).toBeInTheDocument();
    });
  });

  it('should require privacy consent for signup', async () => {
    const user = userEvent.setup();
    render(<Auth />);

    // Switch to signup
    await user.click(screen.getByText('Registrati'));

    // Fill form without checking consent
    await user.type(screen.getByPlaceholderText('nome@esempio.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'validpassword123');
    await user.click(screen.getByText('Crea Account'));

    await waitFor(() => {
      expect(screen.getByText('Devi accettare la Privacy Policy per registrarti')).toBeInTheDocument();
    });
  });

  it('should call signUp with valid data and consent', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<Auth />);

    // Switch to signup
    await user.click(screen.getByText('Registrati'));

    // Fill form
    await user.type(screen.getByPlaceholderText('nome@esempio.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'validpassword123');

    // Check consent
    await user.click(screen.getByRole('checkbox'));

    // Submit
    await user.click(screen.getByText('Crea Account'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'validpassword123',
      });
    });
  });

  it('should call signIn for login', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<Auth />);

    await user.type(screen.getByPlaceholderText('nome@esempio.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'validpassword123');
    await user.click(screen.getByText('Accedi al Diario'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'validpassword123',
      });
    });
  });

  it('should show error message from Supabase', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    const user = userEvent.setup();
    render(<Auth />);

    await user.type(screen.getByPlaceholderText('nome@esempio.com'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpassword1');
    await user.click(screen.getByText('Accedi al Diario'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
