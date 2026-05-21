# Fix: "Failed to download remote update" (Expo Go)

On Android, this means **Expo Go could not download your app from the dev server** on your PC. It is almost always a **network / wrong IP** problem, not a bug in your React code.

---

## Quick fix (try in order)

### 1. Use the phone start script (best for home Wi‑Fi)

On your PC, in the project folder:

```powershell
npm run start:phone
```

This picks a sensible LAN IP (prefers `192.168.x.x`) and prints a URL like `exp://192.168.1.2:8081`.

On the phone:

1. Same **Wi‑Fi** as the PC (not mobile data).
2. Open **Expo Go** → **Enter URL manually** → paste `exp://YOUR_IP:8081` from the terminal.
3. Wait until the PC terminal shows **Bundled** (first load can take 30–60 seconds).

### 2. Test connectivity on the phone

In **Chrome on your phone**, open:

`http://YOUR_PC_IP:8081`

- If the page **does not load**, the phone cannot reach your PC → firewall or wrong Wi‑Fi (see below).
- If it loads (even an error page), Expo Go should work with `exp://YOUR_PC_IP:8081`.

### 3. Tunnel (phone on cellular or school Wi‑Fi)

```powershell
npm run start:tunnel
```

Wait 1–2 minutes for a URL containing **`exp.direct`**. Scan that QR code.

Turn off **VPN** on PC and phone if tunnel fails.

### 4. Windows Firewall

Allow **Node.js** on **Private** networks, or allow inbound **TCP port 8081**.

### 5. Clear Expo Go cache (Android)

**Settings → Apps → Expo Go → Storage → Clear cache** (not always required).

Update **Expo Go** from the Play Store / App Store (this project uses **Expo SDK 52**).

---

## Why you saw `10.232.212.126`

Expo chose your **Wi‑Fi** address. Many phones on **`192.168.1.x` home routers** cannot reach `10.232.x.x`. That mismatch causes **Failed to download remote update**.

Your PC also has **`192.168.1.2` (Ethernet)** — use that IP when the phone is on the same home network.

---

## Do not use terminal `a` for a real phone

`Press a │ open Android` needs **Android Studio / adb**. For a physical device, use **Expo Go + QR or manual URL** only.

---

## Still stuck?

Use an **EAS development build** later (`eas build --profile development`). Expo Go is limited to LAN/tunnel reachability; dev builds install like a normal app.
