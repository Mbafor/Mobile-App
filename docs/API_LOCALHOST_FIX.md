# API Network Configuration Fix

## Problem
Your Expo mobile app couldn't reach your local API server because it was trying to use `localhost` or `127.0.0.1`, which on a mobile device refers to the phone itself, not your development machine.

## Solution
Replace `localhost` with your **machine's local IP address** (e.g., `192.168.1.2`).

---

## Setup Instructions

### Step 1: Find Your PC's Local IP Address

**On Windows (PowerShell):**
```powershell
ipconfig | findstr IPv4
```

Look for IPv4 Address in the format `192.168.x.x` or `10.0.x.x` (NOT `127.0.0.1` or `169.254.x.x`)

**Example output:**
```
IPv4 Address. . . . . . . . . : 192.168.1.2
```

### Step 2: Update `.env` File

Replace `192.168.1.2` with your actual IP:

```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.2:3000
EXPO_PUBLIC_API_PORT=3000
```

### Step 3: Make API Requests

Now use the HTTP client from anywhere in your code:

```typescript
import { http } from '@/services';

// GET request
const { ok, data, error } = await http.get('/api/users');

// POST request
const { ok, data, error } = await http.post('/api/users', {
  name: 'John',
  email: 'john@example.com'
});

// With error handling
const { ok, data, error } = await http.get('/api/profile');
if (!ok) {
  console.error('Failed:', error);
} else {
  console.log('Success:', data);
}
```

---

## Running Your Dev Server

### Browser (on same machine)
```bash
npm start  # or your local dev server command
# Access at http://localhost:3000
```

### Mobile via Expo
```bash
npm run start:phone
# OR manually:
npm run start:lan
# Open Expo Go and enter the URL with your IP instead of localhost
```

---

## Common Issues

### "Cannot reach http://192.168.1.2:3000"

Check:
1. ✅ Your API server is running on that IP and port
2. ✅ Your phone is on the **same Wi-Fi** as your PC
3. ✅ Windows Firewall allows Node.js on the private network (see below)

### Enable Windows Firewall Access

**Option A (Quick):** Use the existing script
```powershell
npm run start:phone
```

**Option B (Manual):**
1. Open **Windows Defender Firewall** → **Allow an app through firewall**
2. Find **Node.js** (or your server app)
3. Check **Private** networks
4. Restart your server

### Still Not Working?

1. Verify connectivity in browser on your phone:
   ```
   http://192.168.1.2:3000  (should show something, even an error page)
   ```

2. Check your server is binding to `0.0.0.0` (not just `127.0.0.1`)

3. Try tunneling instead:
   ```bash
   npm run start:tunnel
   ```

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `EXPO_PUBLIC_API_BASE_URL` | Full API base URL | `http://192.168.1.2:3000` |
| `EXPO_PUBLIC_API_PORT` | API server port (for error messages) | `3000` |

Both support `EXPO_PUBLIC_` prefix for Expo bundling.
