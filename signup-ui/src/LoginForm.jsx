import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function LoginForm() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
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
        // Create Basic Auth header
        const credentials = btoa(`${form.email}:${form.password}`);
        const response = await fetch('http://localhost:3001/api/user/signin', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
          },
          body: JSON.stringify(form)
        });
        const data = await response.json();
        if (response.ok) {
          setApiSuccess('Welcome back! You have successfully signed in.');
          
          // Extract user info from the response
          const userData = {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            id: data.userId
          };
          
          // Login the user
          login(userData);
          
          // Navigate to dashboard after successful login
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          
          setForm({
            email: '',
            password: ''
          });
        } else {
          setApiError(data.message || 'Invalid email or password. Please try again.');
        }
      } catch (err) {
        setApiError('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h1>Welcome Back</h1>
        <p className="signup-subtitle">Sign in to your NXL Beauty Bar account</p>
      </div>
      
      <form className="signup-form" onSubmit={handleSubmit} noValidate>
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
            placeholder="Enter your password"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        
        {apiSuccess && <div className="success">{apiSuccess}</div>}
        {apiError && <div className="error">{apiError}</div>}
      </form>
      
      <div className="signup-footer">
        <p>Don't have an account? <Link to="/signup" className="login-link">Create Account</Link></p>
        <Link to="/" className="back-home">← Back to Home</Link>
      </div>
    </div>
  );
}

export default LoginForm; 