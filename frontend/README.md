# PayFlow Frontend

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   This will start the frontend on http://localhost:3000 or http://localhost:5173

3. **Make sure Java backend is running:**
   - Backend should be running on http://localhost:4000
   - Start backend: `cd java-backend && mvn spring-boot:run`
   - Or from root: `npm run backend`

## Project Structure

```
client/
├── src/
│   ├── pages/          # Page components (Signup, Login, Dashboard, etc.)
│   ├── context/        # React Context (AuthContext for global auth state)
│   ├── services/       # API service layer (api.js)
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
