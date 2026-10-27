CRM Frontend
React + Vite frontend for the CRM application.

Requirements
- Node.js and npm
- Backend server running

Setup
1. Open a terminal in the client folder.
2. Install dependencies:npm install
3. Start the development server:npm run dev

Configuration
Check src/api/axios.js and set the backend API URL, for example:
baseURL: 'http://localhost:3000/api',
withCredentials: true,

Features
- User registration and login
- Cookie-based authentication
- Admin dashboard for managing users
- User profile viewing and editing
- Role-based page redirects

Pages
- /register — Create an account
- /login — Log in
- /userdata — Admin dashboard
- /profile — My profile