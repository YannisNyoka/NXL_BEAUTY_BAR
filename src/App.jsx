import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home.jsx';
import SignupForm from './SignupForm.jsx';
import LoginForm from './LoginForm.jsx';
import Dashboard from './Dashboard.jsx';
import UserProfile from './UserProfile.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PaymentPage from './PaymentPage.jsx';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </div>
  );
}

export default App;
