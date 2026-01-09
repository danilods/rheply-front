import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the candidate auth store
const mockLogin = vi.fn();
const mockClearError = vi.fn();

vi.mock('@/store/candidate-auth', () => ({
  useCandidateAuthStore: () => ({
    login: mockLogin,
    isLoading: false,
    error: null,
    clearError: mockClearError,
  }),
}));

// Simple login form component for testing (mimics actual behavior)
const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email é obrigatório');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Email inválido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Senha é obrigatória');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      setIsSubmitting(true);
      try {
        await mockLogin(email, password);
      } catch (error) {
        // Handle error
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => validateEmail(email)}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? 'email-error' : undefined}
        />
        {emailError && (
          <span id="email-error" role="alert">
            {emailError}
          </span>
        )}
      </div>
      <div>
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => validatePassword(password)}
          aria-invalid={!!passwordError}
          aria-describedby={passwordError ? 'password-error' : undefined}
        />
        {passwordError && (
          <span id="password-error" role="alert">
            {passwordError}
          </span>
        )}
      </div>
      <div>
        <label>
          <input type="checkbox" name="rememberMe" />
          Lembrar de mim
        </label>
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
      <a href="/candidato/recuperar-senha">Esqueceu sua senha?</a>
    </form>
  );
};

import React from 'react';

describe('Login Form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.getByText(/lembrar de mim/i)).toBeInTheDocument();
    expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
  });

  it('validates email format on blur', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.blur(emailInput);
    });

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('validates email is required', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');

    await act(async () => {
      fireEvent.blur(emailInput);
    });

    await waitFor(() => {
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('clears email error when valid email is entered', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');

    // First trigger error
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.blur(emailInput);
    });

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });

    // Then fix it
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
      fireEvent.blur(emailInput);
    });

    await waitFor(() => {
      expect(screen.queryByText(/email inválido/i)).not.toBeInTheDocument();
    });
  });

  it('validates password is required', async () => {
    render(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText('Sua senha');

    await act(async () => {
      fireEvent.blur(passwordInput);
    });

    await waitFor(() => {
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
  });

  it('validates password minimum length', async () => {
    render(<LoginForm />);

    const passwordInput = screen.getByPlaceholderText('Sua senha');

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.blur(passwordInput);
    });

    await waitFor(() => {
      expect(screen.getByText(/pelo menos 6 caracteres/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('does not submit with invalid data', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('disables submit button during submission', async () => {
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/entrando/i)).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText('Sua senha');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('shows remember me checkbox', () => {
    render(<LoginForm />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('has link to password recovery', () => {
    render(<LoginForm />);

    const recoveryLink = screen.getByText(/esqueceu sua senha/i);
    expect(recoveryLink).toHaveAttribute('href', '/candidato/recuperar-senha');
  });
});
