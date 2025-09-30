# NXL Beauty Bar - Frontend & Backend Connection

## How to run the complete application

### Prerequisites
1. Node.js installed on your system
2. Your backend server code saved in a separate directory

### Backend Setup (First Terminal)
1. Create a new directory for your backend:
   ```bash
   mkdir nxl-beauty-bar-backend
   cd nxl-beauty-bar-backend
   ```

2. Initialize npm and install dependencies:
   ```bash
   npm init -y
   npm install express mongodb dotenv cors body-parser
   ```

3. Create your backend file (`server.js`) with the code you provided

4. Create a `.env` file in the backend directory:
   ```
   PORT=3001
   MONGO_URI=your_mongodb_connection_string_here
   ```

5. Start the backend server:
   ```bash
   node server.js
   ```

### Frontend Setup (Second Terminal)
1. Navigate to your frontend directory:
   ```bash
   cd c:\Users\yanni\nxl-beauty-bar_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Verification
1. Your backend should be running on `http://localhost:3001`
2. Your frontend should be running on `http://localhost:3000`
3. Open your browser and go to `http://localhost:3000`
4. Check the browser console for connection success messages
5. You should see: "✅ Backend connection successful: { message: 'Backend connection successful!' }"

### API Endpoints Available
- `GET /api/ping` - Test connection
- `POST /api/user/signup` - User registration
- `POST /api/user/signin` - User login
- `GET /api/users` - Get all users
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get all appointments
- `POST /api/services` - Create service
- `GET /api/services` - Get all services
- `POST /api/employees` - Create employee
- `GET /api/employees` - Get all employees
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get all payments

### Environment Variables
The frontend uses `VITE_API_URL` environment variable which is set to `http://localhost:3001` for development.

### Troubleshooting
1. Make sure both servers are running
2. Check that ports 3000 and 3001 are not blocked
3. Verify MongoDB is connected in the backend
4. Check browser console for any error messages