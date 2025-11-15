# 🛠️ Detailed Setup Guide

This guide provides step-by-step instructions for setting up and running the Plaibook Call Center Analytics Dashboard.

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version
```

If Node.js is not installed, download it from [nodejs.org](https://nodejs.org/).

## Step-by-Step Setup

### Step 1: Clone or Download the Repository

If you have the repository URL:
```bash
git clone https://github.com/YOUR_USERNAME/plaibook-call-center-dashboard.git
cd plaibook-call-center-dashboard
```

Or if you have a ZIP file:
1. Extract the ZIP file
2. Open terminal/command prompt in the extracted folder

### Step 2: Install Frontend Dependencies

```bash
npm install
```

This will install:
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- And other frontend dependencies

**Expected output:** `added XXX packages`

### Step 3: Install Backend Dependencies

```bash
cd service
npm install
cd ..
```

This will install:
- Express.js
- TypeScript
- Google Gemini AI SDK
- And other backend dependencies

**Expected output:** `added XXX packages`

### Step 4: Verify Data Files

Check that the `demo_calls/` folder exists and contains 451 JSON files:

```bash
# On Windows (PowerShell)
(Get-ChildItem -Path demo_calls -Filter *.json).Count

# On Mac/Linux
ls demo_calls/*.json | wc -l
```

Should show: `451`

### Step 5: (Optional) Set Up Gemini API Key

For LLM-powered transcript analysis:

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create `service/.env` file:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   PORT=3000
   ```

> **Note:** The dashboard works perfectly without this! All 451 calls use fast heuristics. LLM is only for a demo subset.

### Step 6: Start the Backend Server

Open Terminal/Command Prompt 1:

```bash
cd service
npm run dev
```

**Expected output:**
```
Loaded 451 calls from demo_calls folder
Precomputing metrics...
✓ Metrics precomputed and cached successfully
Server running on port 3000
```

✅ Backend is now running on `http://localhost:3000`

### Step 7: Start the Frontend Server

Open Terminal/Command Prompt 2 (new window):

```bash
npm run dev
```

**Expected output:**
```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

✅ Frontend is now running on `http://localhost:5173`

### Step 8: Open the Dashboard

1. Open your web browser
2. Navigate to: `http://localhost:5173`
3. You should see the dashboard!

## Verifying Everything Works

### Backend Health Check

Open: `http://localhost:3000/api/health`

Should return: `{"status":"ok"}`

### Frontend Check

1. Dashboard loads without errors
2. Nate's View shows 4 cards with metrics
3. Charts are visible
4. Filters work

## Common Issues & Solutions

### Issue: "Port 3000 already in use"

**Solution:**
1. Change port in `service/.env`: `PORT=3001`
2. Update `vite.config.ts` proxy target to `http://localhost:3001`

### Issue: "Cannot find module"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules service/node_modules
npm install
cd service && npm install && cd ..
```

### Issue: "No calls loaded"

**Solution:**
- Verify `demo_calls/` folder exists in project root
- Check that it contains 451 JSON files
- Ensure files are named `*_metadata.json`

### Issue: "Backend not responding"

**Solution:**
1. Check backend terminal for errors
2. Verify backend is running on port 3000
3. Check that `demo_calls/` folder is accessible

### Issue: "Frontend can't connect to backend"

**Solution:**
1. Verify backend is running
2. Check `vite.config.ts` proxy configuration
3. Try accessing backend directly: `http://localhost:3000/api/health`

## Project Structure

```
plaibook-dashboard/
├── demo_calls/              # 451 call metadata files (JSON)
├── screenshots/             # 12 dashboard screenshots
├── service/                 # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts        # Main server entry point
│   │   ├── data/           # Data loading
│   │   ├── analysis/       # Business logic
│   │   └── llm/            # LLM integration
│   └── package.json
├── src/                     # Frontend (React + TypeScript)
│   ├── components/          # React components
│   ├── types/               # TypeScript types
│   └── App.tsx              # Main app component
├── types/                   # Shared types
├── package.json             # Frontend dependencies
└── README.md                # Main documentation
```

## Next Steps

Once everything is running:

1. **Explore the Dashboard:**
   - Check Nate's View for key metrics
   - Try the global filters
   - Click charts to see drill-down panels

2. **Review the Code:**
   - Backend: `service/src/` - Analysis logic
   - Frontend: `src/components/` - UI components
   - Types: `types/` - Shared interfaces

3. **Read the README:**
   - Full feature documentation
   - Architecture details
   - API endpoints

## Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review error messages in terminal output
- Verify all prerequisites are installed
- Ensure both servers are running

---

**Happy exploring! 🚀**

