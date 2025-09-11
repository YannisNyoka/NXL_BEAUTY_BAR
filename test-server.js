const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// In-memory storage for testing
let users = [];

// Helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password) => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};

// Signup endpoint
app.post('/api/user/signup', async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'All fields are required',
        message: 'All fields are required'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers',
        message: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Passwords do not match',
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        message: 'User already exists'
      });
    }

    // Encode password using base64
    const encodedPassword = Buffer.from(password).toString('base64');

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: encodedPassword,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to users array
    users.push(newUser);
    console.log('User saved:', newUser.email);

    // Return 201 status code for successful creation
    return res.status(201).json({
      message: 'User created successfully',
      userId: newUser.id
    });

  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Signin endpoint
app.post('/api/user/signin', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Basic authentication required' });
    }

    // Extract credentials from Authorization header
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString();
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Invalid credentials format' });
    }

    // Find user in array
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Decode stored password and compare
    const storedPassword = Buffer.from(user.password, 'base64').toString();
    if (password !== storedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return success with user info
    return res.status(200).json({
      message: 'Sign in successful',
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Test server is running',
    usersCount: users.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Signup: POST http://localhost:${PORT}/api/user/signup`);
  console.log(`Signin: POST http://localhost:${PORT}/api/user/signin`);
}); 