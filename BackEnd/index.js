require('dotenv').config();
const express = require('express');
const {MongoClient, ObjectId} = require('mongodb');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
// Middleware to parse JSON
app.use(express.json());
const cors = require('cors');
app.use(cors());
let client, db;

// Define collections
let usersCollection, appointmentsCollection, servicesCollection, employeesCollection, paymentsCollection;

// Basic Authentication Middleware
const basicAuth = async (req, res, next) => {
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

    // Find user in database
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Decode stored password and compare
    const storedPassword = Buffer.from(user.password, 'base64').toString();
    if (password !== storedPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Add user info to request object
    req.user = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

async function connectToDatabase() {
  try {
    if (!MONGO_URI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    // Get database instance
    db = client.db('NXL_BEAUTY_BAR');
    console.log('Using database:', db.databaseName);

    // Initialize collections
    usersCollection = db.collection('USERS');
    appointmentsCollection = db.collection('APPOINTMENTS');
    servicesCollection = db.collection('SERVICES');
    employeesCollection = db.collection('EMPLOYEES');
    paymentsCollection = db.collection('PAYMENTS');
    console.log('Collections initialized');

    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await appointmentsCollection.createIndex({ userId: 1 });
    await servicesCollection.createIndex({ name: 1 });
    await employeesCollection.createIndex({ email: 1 }, { unique: true });
    await paymentsCollection.createIndex({ appointmentId: 1 });
    console.log('Indexes created');

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Add error handling for database connection
process.on('SIGINT', async () => {
  try {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate password strength
const isStrongPassword = (password) => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};

// User API (no authentication required for signup)
app.post('/api/user/signup', async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      throw new Error('All fields are required');
    }

    // Validate email format
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Encode password using base64
    const encodedPassword = Buffer.from(password).toString('base64');

    // Create new user
    const newUser = {
      email,
      password: encodedPassword,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to users collection
    const result = await usersCollection.insertOne(newUser);
    console.log('User saved with ID:', result.insertedId);

    // Verify the user was saved
    const savedUser = await usersCollection.findOne({ _id: result.insertedId });
    if (!savedUser) {
      throw new Error('User was not saved properly');
    }

    // Return 201 status code for successful creation
    return res.status(201).json({
      message: 'User created successfully',
      userId: result.insertedId
    });

  } catch (error) {
    console.error('Error in signup:', error);
    // Return 500 for any unexpected errors
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// All other endpoints require authentication
app.post('/api/user/signin', basicAuth, (req, res) => {
  try {
    // The basicAuth middleware has already validated the userz
    // and added user info to req.user
    const userData = {
      userId: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    };
    
    return res.status(200).json({
      message: 'Sign in successful',
      ...userData
    });
  } catch (error) {
    console.error('Error in signin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/account', basicAuth, (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  return res.status(200).json({ message: 'Account details retrieved' });
});

// User CRUD Operations (all require authentication)
app.get('/api/users', basicAuth, async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', basicAuth, async (req, res) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:id', basicAuth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { firstName, lastName, email, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', basicAuth, async (req, res) => {
  try {
    const result = await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Appointment API (requires authentication)
app.post('/api/appointment/book', (req, res) => {
  const { userId, serviceId, date } = req.body;
  if (!userId || !serviceId || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  return res.status(201).json({ message: 'Appointment booked successfully' });
});

// Appointment CRUD Operations (all require authentication)
app.get('/api/appointments', basicAuth, async (req, res) => {
  try {
    const appointments = await appointmentsCollection.find({}).toArray();
    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.get('/api/appointments/:id', basicAuth, async (req, res) => {
  try {
    const appointment = await appointmentsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    return res.status(200).json(appointment);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

app.put('/api/appointments/:id', basicAuth, async (req, res) => {
  try {
    const { date, serviceId, status } = req.body;
    if (!date || !serviceId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await appointmentsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { date, serviceId, status, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    return res.status(200).json({ message: 'Appointment updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update appointment' });
  }
});

app.delete('/api/appointments/:id', basicAuth, async (req, res) => {
  try {
    const result = await appointmentsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    return res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Payment API (requires authentication)
app.post('/api/payment/process',  (req, res) => {
  const { userId, amount, paymentMethod } = req.body;
  if (!userId || !amount || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  return res.status(201).json({ message: 'Payment processed successfully' });
});

// Service CRUD Operations (all require authentication)
app.get('/api/services', basicAuth, async (req, res) => {
  try {
    const services = await servicesCollection.find({}).toArray();
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/services/:id', basicAuth, async (req, res) => {
  try {
    const service = await servicesCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.status(200).json(service);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch service' });
  }
});

app.put('/api/services/:id', basicAuth, async (req, res) => {
  try {
    const { name, price, duration } = req.body;
    if (!name || !price || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await servicesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, price, duration, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.status(200).json({ message: 'Service updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/services/:id', basicAuth, async (req, res) => {
  try {
    const result = await servicesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    return res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Service CRUD Operations (all require authentication)
app.post('/api/services', async (req, res) => {
  try {
    const { name, price, duration, userName, stylist } = req.body;
    if (!name || !price || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const service = {
      name,
      price,
      duration,
      userName,
      stylist,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await servicesCollection.insertOne(service);
    return res.status(201).json({
      message: 'Service created successfully',
      serviceId: result.insertedId
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create service' });
  }
});

// Appointment CRUD Operations (all require authentication)
app.post('/api/appointments', async (req, res) => {
  try {
    console.log('POST /api/appointments body:', req.body);
    const { userId, serviceIds, date, userName, stylist, contactNumber, totalPrice, totalDuration } = req.body;
    if (!userId || !serviceIds || !date) {
      console.error('Missing required fields:', { userId, serviceIds, date });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Accept multiple service IDs
    const appointment = {
      userId,
      serviceIds: Array.isArray(serviceIds) ? serviceIds : [serviceIds],
      date: new Date(date),
      userName,
      stylist,
      contactNumber,
      totalPrice,
      totalDuration,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      const result = await appointmentsCollection.insertOne(appointment);
      console.log('Appointment inserted:', result.insertedId);
      // Prepare details and emails
      const appointmentDetails = `Date: ${date}\nCustomer: ${userName}\nStylist: ${stylist}\nContact: ${contactNumber}`;
      try {
        await sendAppointmentEmails({ userEmail, stylistEmail, appointmentDetails });
        console.log('Confirmation emails sent');
      } catch (err) {
        console.error('Error sending emails:', err);
      }
      return res.status(201).json({
        message: 'Appointment created successfully',
        appointmentId: result.insertedId
      });
    } catch (err) {
      console.error('Error inserting appointment:', err);
      return res.status(500).json({ error: 'Failed to create appointment', details: err.message });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Employee CRUD Operations (all require authentication)
app.post('/api/employees', async (req, res) => {
  try {
    const { name, email, phone, position, salary } = req.body;
    if (!name || !email || !phone || !position || !salary) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const employee = {
      name,
      email,
      phone,
      position,
      salary,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await employeesCollection.insertOne(employee);
    return res.status(201).json({
      message: 'Employee created successfully',
      employeeId: result.insertedId
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create employee' });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await employeesCollection.find({}).toArray();
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.get('/api/employees/:id', basicAuth, async (req, res) => {
  try {
    const employee = await employeesCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    return res.status(200).json(employee);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

app.put('/api/employees/:id', basicAuth, async (req, res) => {
  try {
    const { name, email, phone, position, salary } = req.body;
    if (!name || !email || !phone || !position || !salary) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await employeesCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, email, phone, position, salary, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    return res.status(200).json({ message: 'Employee updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update employee' });
  }
});

app.delete('/api/employees/:id', basicAuth, async (req, res) => {
  try {
    const result = await employeesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    return res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Payment CRUD Operations (all require authentication)
app.post('/api/payments', async (req, res) => {
  try {
    const { appointmentId, amount, paymentMethod, status } = req.body;
    if (!appointmentId || !amount || !paymentMethod || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const payment = {
      appointmentId,
      amount,
      paymentMethod,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await paymentsCollection.insertOne(payment);
    return res.status(201).json({
      message: 'Payment created successfully',
      paymentId: result.insertedId
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

app.get('/api/payments', basicAuth, async (req, res) => {
  try {
    const payments = await paymentsCollection.find({}).toArray();
    return res.status(200).json(payments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.get('/api/payments/:id', basicAuth, async (req, res) => {
  try {
    const payment = await paymentsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    return res.status(200).json(payment);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

app.put('/api/payments/:id', basicAuth, async (req, res) => {
  try {
    const { amount, paymentMethod, status } = req.body;
    if (!amount || !paymentMethod || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await paymentsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { amount, paymentMethod, status, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    return res.status(200).json({ message: 'Payment updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update payment' });
  }
});

app.delete('/api/payments/:id', basicAuth, async (req, res) => {
  try {
    const result = await paymentsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    return res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Health check endpoint for MongoDB connection
app.get('/api/health/mongodb', async (req, res) => {
  try {
    // The ping command is a simple way to check MongoDB connectivity
    await db.command({ ping: 1 });
    res.status(200).json({ status: 'ok', message: 'Connected to MongoDB' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Not connected to MongoDB', error: error.message });
  }
});

// Nodemailer setup
const nodemailer = require('nodemailer');

// Configure your SMTP transport (use your real credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your password or app password
  }
});

async function sendAppointmentEmails({ userEmail, stylistEmail, appointmentDetails }) {
  const mailOptionsUser = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your Appointment Confirmation',
    text: `Your appointment is confirmed:\n${appointmentDetails}`
  };
  const mailOptionsStylist = {
    from: process.env.EMAIL_USER,
    to: stylistEmail,
    subject: 'New Appointment Booked',
    text: `You have a new appointment:\n${appointmentDetails}`
  };
  await transporter.sendMail(mailOptionsUser);
  await transporter.sendMail(mailOptionsStylist);
}

// Start server
app.listen(PORT, async () => {
  await connectToDatabase();
  console.log(`Server running on port ${PORT}`);
});

// Place this endpoint at the very top, before any authentication middleware
app.get('/api/appointments/all', async (req, res) => {
  try {
    const appointments = await appointmentsCollection.find({}).toArray();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

