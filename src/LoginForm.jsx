import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from './api.js';

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
        const result = await api.signin(form);
        if (result.success) {
          setApiSuccess('Welcome back! You have successfully signed in.');
          
          // Get user details from the users endpoint
          const usersResult = await api.getUsers();
          let userData = {
            email: form.email,
            firstName: 'User',
            lastName: '',
            id: result.data.userId
          };
          
          // Find the current user in the users list
          if (usersResult.success) {
            const currentUser = usersResult.data.find(user => user.email === form.email);
            if (currentUser) {
              userData = {
                email: form.email,
                firstName: currentUser.firstName || 'User',
                lastName: currentUser.lastName || '',
                id: currentUser._id || result.data.userId,
                isAdmin: currentUser.isAdmin || false
              };
            }
          }
          
          // Check if email contains "nxlbeautybar" - if so, grant admin access
          const emailLower = form.email.toLowerCase();
          const isNxlBeautyBarEmail = emailLower.includes('nxlbeautybar');
          
          if (isNxlBeautyBarEmail) {
            userData.isAdmin = true;
            localStorage.setItem('isAdmin', 'true');
          } else {
            // Remove admin flag if not nxlbeautybar email
            localStorage.removeItem('isAdmin');
            userData.isAdmin = false;
          }
          
          // Login the user
          login(userData);
          
          // Navigate based on user role
          setTimeout(() => {
            if (userData.isAdmin) {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }, 1500);
          
          setForm({
            email: '',
            password: ''
          });
        } else {
          setApiError(result.error || 'Invalid email or password. Please try again.');
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