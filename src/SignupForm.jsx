import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api.js';

function SignupForm() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) newErrors.password = 'Password must be at least 8 characters and contain uppercase, lowercase, and a number';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.firstName) newErrors.firstName = 'First name is required';
    if (!form.lastName) newErrors.lastName = 'Last name is required';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setApiError('');
    setApiSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const result = await api.signup(form);
        if (result.success) {
          // Store credentials in localStorage for API authentication
          localStorage.setItem('userEmail', form.email);
          localStorage.setItem('userPassword', form.password);
          
          setApiSuccess('Welcome to NXL Beauty Bar! Your account has been created successfully.');
          setSubmitted(true);
          setForm({
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: ''
          });

          // Navigate back to home after successful signup
          setTimeout(() => {
            navigate('/', { state: { user: form } });
          }, 2000);
        } else {
          setApiError(result.error || 'Signup failed. Please try again.');
          setSubmitted(false);
        }
      } catch (err) {
        setApiError('Network error. Please check your connection and try again.');
        setSubmitted(false);
      } finally {
        setLoading(false);
      }
    } else {
      setSubmitted(false);
    }
  };

  return (
    <div className="create-container">
      <div className="signup-header">
        <h1>Join NXL Beauty Bar</h1>
        <p className="signup-subtitle">Create your account to start booking your nail appointments</p>
      </div>

      <form className="signup-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter your first name"
          />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter your last name"
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter your email address"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="Create a strong password"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {apiSuccess && <div className="success">{apiSuccess}</div>}
        {apiError && <div className="error">{apiError}</div>}
      </form>

      <div className="signup-footer">
        <p>Already have an account? <Link to="/login" className="login-link">Sign In</Link></p>
        <Link to="/" className="back-home">← Back to Home</Link>
      </div>
    </div>
  );
}

export default SignupForm;