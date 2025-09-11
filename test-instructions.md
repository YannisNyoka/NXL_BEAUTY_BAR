# Testing Instructions

## Setup

1. **Start API Server (Port 3001):**
   ```bash
   cd API_Endpoints
   node index.js
   ```
   Server should start on port 3001

2. **Start Web Application (Port 3000):**
   ```bash
   cd signup-ui
   npm install react-router-dom
   npm run dev
   ```
   App should start on port 3000

## Test Requirements

### ✅ 1. Signup Functionality
- Navigate to http://localhost:3000
- Click "Create Account" 
- Fill out the signup form with valid data
- Submit the form
- Should see success message and navigate back to home

### ✅ 2. Protected Route Access
- Try to access http://localhost:3000/dashboard directly
- Should be redirected to login page (protected route working)

### ✅ 3. Login and Dashboard Access
- Click "Sign In" from home page
- Use the credentials from step 1 to login
- Should see success message and automatically navigate to dashboard
- Dashboard should display user information and navigation options

### ✅ 4. Logout Functionality
- Click "Sign Out" on dashboard
- Should be logged out and can access login page again

## Expected Behavior

1. **Home Page:** Elegant nail salon theme with navigation links
2. **Signup:** Form validation, API integration, navigation back to home
3. **Login:** Basic auth, success redirect to dashboard
4. **Dashboard:** Protected route with user info and logout
5. **Navigation:** Smooth transitions between all pages

## API Endpoints Used

- `POST http://localhost:3001/api/user/signup` - User registration
- `POST http://localhost:3001/api/user/signin` - User authentication

## Features Implemented

- ✅ React Router setup with BrowserRouter
- ✅ Protected routes with authentication
- ✅ Navigation between signup, login, and dashboard
- ✅ Elegant nail salon theme throughout
- ✅ API integration with proper error handling
- ✅ Responsive design for all screen sizes
- ✅ Authentication context for state management 