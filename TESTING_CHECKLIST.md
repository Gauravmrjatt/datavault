# PWA & Skeleton Loading - Testing Checklist

## ✅ PWA Testing

### Desktop Installation
- [ ] Build production: `npm run build && npm start`
- [ ] Open http://localhost:3000 in Chrome/Edge
- [ ] Install prompt appears in bottom-right corner
- [ ] Click "Install" button
- [ ] App installs and opens in standalone window
- [ ] App icon appears in applications menu
- [ ] Click "Not now" dismisses prompt
- [ ] Refresh page - prompt doesn't show again (remembered)

### Mobile Installation (Android)
- [ ] Deploy to production or use ngrok
- [ ] Open in Chrome mobile browser
- [ ] Install banner appears
- [ ] Tap "Install" or menu → "Install app"
- [ ] App appears on home screen
- [ ] Open app - runs in standalone mode
- [ ] No browser UI visible

### Mobile Installation (iOS)
- [ ] Open in Safari
- [ ] Tap Share button
- [ ] Select "Add to Home Screen"
- [ ] App icon appears on home screen
- [ ] Open app - runs in standalone mode

### Offline Functionality
- [ ] Open app in browser
- [ ] Open DevTools → Network tab
- [ ] Select "Offline" from throttling dropdown
- [ ] Red "You're offline" badge appears at top
- [ ] Navigate to cached pages (should work)
- [ ] Try to upload/download (should show error)
- [ ] Switch back to "Online"
- [ ] Badge disappears automatically

### App Shortcuts
- [ ] Install PWA on desktop
- [ ] Right-click app icon
- [ ] See "Upload Files" shortcut
- [ ] See "My Files" shortcut
- [ ] Click shortcuts - opens correct page

### Service Worker
- [ ] Open DevTools → Application tab
- [ ] Check "Service Workers" section
- [ ] Service worker is registered
- [ ] Status shows "activated and running"
- [ ] Check "Cache Storage"
- [ ] Multiple caches present (workbox caches)

## 💀 Skeleton Loading Testing

### Dashboard Page
- [ ] Navigate to /dashboard
- [ ] Clear cache and hard refresh
- [ ] Skeleton appears immediately
- [ ] Shows header skeleton
- [ ] Shows storage card skeleton
- [ ] Shows metric cards skeleton
- [ ] Shows quick action cards skeleton
- [ ] Shimmer animation visible
- [ ] Transitions smoothly to real content

### Files Page
- [ ] Navigate to /dashboard/files
- [ ] Clear cache and hard refresh
- [ ] Skeleton appears immediately
- [ ] Shows toolbar skeleton
- [ ] Shows search bar skeleton
- [ ] Shows file grid skeleton (8 cards)
- [ ] Shimmer animation visible
- [ ] Transitions smoothly to real content

### Upload Page
- [ ] Navigate to /dashboard/upload
- [ ] Clear cache and hard refresh
- [ ] Skeleton appears immediately
- [ ] Shows header skeleton
- [ ] Shows queue status card skeleton
- [ ] Shows upload task skeletons (3 items)
- [ ] Shimmer animation visible
- [ ] Transitions smoothly to real content

### Settings Page
- [ ] Navigate to /dashboard/settings
- [ ] Clear cache and hard refresh
- [ ] Skeleton appears immediately
- [ ] Shows header skeleton
- [ ] Shows settings cards skeleton
- [ ] Shimmer animation visible
- [ ] Transitions smoothly to real content

### Trash Page
- [ ] Navigate to /dashboard/trash
- [ ] Clear cache and hard refresh
- [ ] Skeleton appears immediately
- [ ] Shows header skeleton
- [ ] Shows trash item skeletons (3 items)
- [ ] Shimmer animation visible
- [ ] Transitions smoothly to real content

## 🎨 Visual Testing

### Shimmer Animation
- [ ] Skeleton has subtle shimmer effect
- [ ] Shimmer moves left to right
- [ ] Animation is smooth (no jank)
- [ ] Works in light mode
- [ ] Works in dark mode

### Responsive Design
- [ ] Install prompt responsive on mobile
- [ ] Offline indicator visible on all screen sizes
- [ ] Skeletons match layout on mobile
- [ ] Skeletons match layout on tablet
- [ ] Skeletons match layout on desktop

### Theme Support
- [ ] Switch to dark mode
- [ ] Skeletons use correct dark colors
- [ ] Install prompt uses dark theme
- [ ] Offline indicator uses dark theme
- [ ] Switch to light mode
- [ ] All components use light theme

## 🔧 Technical Checks

### Build Output
- [ ] `npm run build` succeeds
- [ ] Service worker generated in public/sw.js
- [ ] Workbox file generated
- [ ] No TypeScript errors
- [ ] No ESLint errors

### Network Performance
- [ ] First page load < 3s
- [ ] Subsequent loads < 1s (cached)
- [ ] Skeleton visible within 100ms
- [ ] No layout shift when content loads

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works in Edge
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome

## 📊 Metrics to Check

- [ ] Lighthouse PWA score > 90
- [ ] Lighthouse Performance score > 80
- [ ] All PWA criteria met in Lighthouse
- [ ] Installability criteria met
- [ ] Service worker registered
- [ ] Manifest valid

## 🐛 Known Issues to Verify

- [ ] No console errors on page load
- [ ] No 404s for manifest or icons
- [ ] Service worker updates properly
- [ ] No infinite loading states
- [ ] Skeleton doesn't flash on fast connections

---

**Testing Date:** _____________

**Tested By:** _____________

**Browser/Device:** _____________

**Notes:**
