# Quick Start - PWA & Skeleton Loading

## 🚀 Start Development

```bash
# Install dependencies
npm install

# Start development server (PWA disabled in dev)
npm run dev

# Open browser
open http://localhost:3000
```

## 📦 Build for Production

```bash
# Build production bundle
npm run build

# Start production server
npm start

# Open browser
open http://localhost:3000
```

## 🧪 Test PWA Features

### 1. Test Install Prompt
- Open http://localhost:3000 in Chrome
- Wait for install prompt in bottom-right
- Click "Install" to test installation
- Or click "Not now" to test dismissal

### 2. Test Offline Mode
- Open DevTools (F12)
- Go to Network tab
- Select "Offline" from throttling dropdown
- See offline indicator appear
- Try navigating (cached pages work)

### 3. Test Skeleton Loading
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Navigate to any page
- Watch skeleton appear instantly
- See shimmer animation
- Content loads and replaces skeleton

## 📱 Test on Mobile

### Option 1: Deploy to Production
```bash
# Deploy to Vercel/Netlify/etc
vercel deploy

# Or use your preferred hosting
```

### Option 2: Use Local Network
```bash
# Start server
npm start

# Find your local IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Open on mobile: http://YOUR_IP:3000
```

### Option 3: Use Tunneling
```bash
# Install ngrok
brew install ngrok  # macOS
# or download from ngrok.com

# Start tunnel
ngrok http 3000

# Use the https URL on mobile
```

## 🎯 What to Look For

### PWA Features
✓ Install prompt appears  
✓ App can be installed  
✓ Offline indicator shows when offline  
✓ App shortcuts work (right-click icon)  
✓ Standalone mode (no browser UI)  

### Skeleton Loading
✓ Appears instantly on page load  
✓ Shimmer animation visible  
✓ Matches page layout  
✓ Smooth transition to content  
✓ Works on all pages  

## 🔍 Debugging

### Check Service Worker
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
```

### Check PWA Install Status
```javascript
// In browser console
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA installable!', e);
});
```

### Check Offline Status
```javascript
// In browser console
console.log('Online:', navigator.onLine);
window.addEventListener('online', () => console.log('Back online!'));
window.addEventListener('offline', () => console.log('Gone offline!'));
```

## 📚 Documentation

- **Full Implementation Details**: `PWA_SKELETON_IMPLEMENTATION.md`
- **Testing Checklist**: `TESTING_CHECKLIST.md`
- **Main README**: `README.md`

## 🆘 Troubleshooting

### Install Prompt Not Showing
- Make sure you're in production mode (`npm start`)
- PWA is disabled in development
- Check if already installed (uninstall first)
- Check if dismissed (clear localStorage)

### Service Worker Not Registering
- Check browser console for errors
- Verify `public/sw.js` exists after build
- Try hard refresh (Cmd+Shift+R)
- Check HTTPS (required for PWA)

### Skeleton Not Showing
- Check if `loading` state is true
- Verify skeleton component imported
- Check browser console for errors
- Try clearing cache

### Offline Mode Not Working
- Service worker must be registered first
- Visit pages while online first (to cache)
- Check DevTools → Application → Cache Storage
- Verify network is actually offline

## 💡 Tips

1. **Always test in production mode** - PWA features are disabled in dev
2. **Use HTTPS in production** - Required for service workers
3. **Clear cache between tests** - Prevents stale data
4. **Test on real devices** - Mobile experience differs from desktop
5. **Check Lighthouse** - Run audit for PWA score

## 🎉 Success Criteria

Your PWA is working if:
- ✅ Lighthouse PWA score > 90
- ✅ Install prompt appears
- ✅ App can be installed
- ✅ Offline indicator works
- ✅ Skeleton loading on all pages
- ✅ Service worker registered
- ✅ Manifest valid

---

**Need Help?** Check the documentation files or open an issue.
