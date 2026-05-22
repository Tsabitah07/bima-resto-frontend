# BimaResto Frontend

A React.js web application for the BimaResto restaurant booking system.

## Prerequisites

- Node.js 16+
- BimaRestoAPI backend running on `http://localhost:8000`

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Configure the API URL (optional, defaults to localhost:8000)
cp .env.example .env
# Edit .env if your backend runs on a different URL

# 3. Start development server
npm start
```

App runs at: http://localhost:3000

## Project Structure

```
src/
├── api/
│   └── index.js          # All Axios API calls
├── components/
│   ├── Navbar.js          # Top navigation bar
│   └── ProtectedRoute.js  # Role-based route guard (role_id = 3 only)
├── context/
│   └── AuthContext.js     # Global auth state (JWT + user)
├── pages/
│   ├── LoginPage.js       # Login form
│   ├── RegisterPage.js    # Registration form → redirects to login
│   ├── DashboardPage.js   # About, Menus (with posters), Contact
│   ├── BookingPage.js     # New booking form + booking history
│   └── ProfilePage.js     # Edit profile + change password
├── App.js                 # Routes definition
├── index.js               # Entry point
└── styles.css             # Full design system (CSS variables)
```

## Access Control

Only users with `role_id = 3` can log in through this portal.
After registration, users are assigned `role_id = 3` by default (via the API).

## Pages

| Path         | Description                              |
|--------------|------------------------------------------|
| `/login`     | Login page                               |
| `/register`  | Registration page                        |
| `/dashboard` | Restaurant info, menus, contact (auth'd) |
| `/booking`   | Book a table + view reservation history  |
| `/profile`   | View/edit profile, change password       |

## Build for Production

```bash
npm run build
```

Output in `build/` folder — deploy to any static hosting.
