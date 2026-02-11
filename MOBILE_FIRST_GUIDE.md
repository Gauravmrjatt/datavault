# Mobile-First UI Guide

## What's New

Your app now has a completely redesigned mobile-first UI with persistent upload tracking, improved auth pages, and better micro-interactions throughout.

## Key Features

### 🚀 Persistent Upload Status
- **Always visible**: Upload status popup in bottom-right corner
- **Survives refresh**: Your uploads continue even if you close the browser
- **Works everywhere**: Upload from any page, status follows you
- **Smart resume**: Picks up exactly where it left off

### 📱 Mobile-First Design
- **Touch-optimized**: All buttons and inputs are properly sized for fingers
- **Responsive**: Looks great on phones, tablets, and desktops
- **Fast interactions**: No lag, smooth animations, instant feedback
- **Better spacing**: Everything is easier to tap and read

### ✨ Micro-Interactions
- **Laser scanning**: Visual effect shows active uploads
- **Smooth animations**: Everything transitions beautifully
- **Loading states**: Proper skeletons while content loads
- **Visual feedback**: You always know what's happening

## Testing Checklist

### Upload System
1. ✅ Upload a file from the upload page
2. ✅ Refresh the page - upload should continue
3. ✅ Navigate to another page - popup should follow
4. ✅ Close browser and reopen - upload should resume
5. ✅ Pause/resume an upload
6. ✅ Retry a failed upload
7. ✅ Clear completed uploads

### Auth Pages
1. ✅ Visit `/auth/login` - check mobile and desktop views
2. ✅ Toggle password visibility
3. ✅ Submit with wrong credentials - see error animation
4. ✅ Visit `/auth/register` - check all form fields
5. ✅ Test on actual mobile device

### Settings Page
1. ✅ Visit `/dashboard/settings`
2. ✅ Check loading skeleton animation
3. ✅ Toggle bot token visibility
4. ✅ Save telegram credentials
5. ✅ Check mobile layout (theme switcher should show)

### Mobile Testing
1. ✅ Open Chrome DevTools (F12)
2. ✅ Click device toolbar (Ctrl+Shift+M)
3. ✅ Test on iPhone SE (375px)
4. ✅ Test on iPad (768px)
5. ✅ Test on desktop (1920px)

## Mobile Breakpoints

```css
/* Mobile First - Default styles are for mobile */
.element {
  padding: 1rem; /* 16px on mobile */
}

/* Small devices and up (640px+) */
@media (min-width: 640px) {
  .element {
    padding: 1.5rem; /* 24px on tablet+ */
  }
}

/* Medium devices and up (768px+) */
@media (min-width: 768px) {
  .element {
    padding: 2rem; /* 32px on desktop */
  }
}
```

## Tailwind Mobile-First Classes

```jsx
// Mobile first approach
<div className="text-sm sm:text-base md:text-lg">
  {/* 14px on mobile, 16px on tablet, 18px on desktop */}
</div>

<div className="p-4 sm:p-6 md:p-8">
  {/* 16px → 24px → 32px padding */}
</div>

<div className="flex-col sm:flex-row">
  {/* Stack on mobile, row on tablet+ */}
</div>

<div className="hidden sm:block">
  {/* Hidden on mobile, visible on tablet+ */}
</div>

<div className="sm:hidden">
  {/* Visible on mobile, hidden on tablet+ */}
</div>
```

## Upload Context API

```javascript
import { useUpload } from '@/contexts/upload-context';

function MyComponent() {
  const {
    tasks,              // Array of all upload tasks
    addFiles,           // Add files to upload queue
    togglePause,        // Pause/resume an upload
    removeTask,         // Remove a task from queue
    clearCompleted,     // Clear all completed uploads
    retryTask,          // Retry a failed upload
    isMinimized,        // Popup minimized state
    setIsMinimized,     // Toggle popup
    activeCount,        // Number of active uploads
    queuedCount,        // Number of queued uploads
    hasActive           // Boolean: any active uploads?
  } = useUpload();

  return (
    <button onClick={() => addFiles(fileList)}>
      Upload Files
    </button>
  );
}
```

## Animation Classes

```css
/* Laser scanning effect */
.animate-laser {
  animation: laser 3s linear infinite;
}

/* Shimmer loading effect */
.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

/* Pulse glow effect */
.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

## Common Patterns

### Card with Icon Header
```jsx
<GaiaCard>
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--gaia-accent)/0.1)] flex items-center justify-center">
      <Icon icon="lucide:user" className="w-5 h-5 text-[hsl(var(--gaia-accent))]" />
    </div>
    <div>
      <p className="text-sm font-semibold">Title</p>
      <p className="text-xs text-[hsl(var(--gaia-muted))]">Description</p>
    </div>
  </div>
</GaiaCard>
```

### Password Input with Toggle
```jsx
const [showPassword, setShowPassword] = useState(false);

<div className="relative">
  <GaiaInput
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="pr-12"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-[hsl(var(--gaia-soft))] transition-colors"
  >
    <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="w-5 h-5" />
  </button>
</div>
```

### Animated Error Message
```jsx
{error && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20"
  >
    <div className="flex items-center gap-2">
      <Icon icon="lucide:alert-circle" className="w-4 h-4 text-red-500" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  </motion.div>
)}
```

### Loading Button
```jsx
<GaiaButton disabled={loading}>
  {loading ? (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span>Loading...</span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Icon icon="lucide:save" className="w-4 h-4" />
      <span>Save</span>
    </div>
  )}
</GaiaButton>
```

## Performance Tips

1. **Use framer-motion sparingly**: Only animate what needs attention
2. **Optimize images**: Use next/image for automatic optimization
3. **Lazy load**: Use React.lazy for code splitting
4. **Debounce inputs**: Prevent excessive re-renders
5. **Memoize expensive calculations**: Use useMemo and useCallback

## Accessibility

- All interactive elements have proper focus states
- Keyboard navigation works throughout
- Screen readers can navigate the app
- Color contrast meets WCAG AA standards
- Touch targets are minimum 44x44px

## Browser DevTools

### Test Responsive Design
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test touch events with device mode

### Test Animations
1. Open DevTools → More tools → Animations
2. Slow down animations to debug
3. Check for jank (dropped frames)

### Test Performance
1. Open DevTools → Lighthouse
2. Run mobile audit
3. Check performance score
4. Fix any issues

## Common Issues

### Upload not resuming after refresh
- Check browser localStorage is enabled
- Clear localStorage and try again: `localStorage.clear()`

### Animations stuttering
- Check if too many elements are animating
- Use `will-change` CSS property sparingly
- Reduce animation complexity

### Mobile layout broken
- Check viewport meta tag in layout
- Verify Tailwind breakpoints
- Test on actual device, not just DevTools

## Next Steps

1. Test on real mobile devices
2. Gather user feedback
3. Monitor performance metrics
4. Iterate based on usage patterns
5. Add more micro-interactions where needed

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Mobile UX Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/principles)
- [Touch Target Sizes](https://web.dev/accessible-tap-targets/)
