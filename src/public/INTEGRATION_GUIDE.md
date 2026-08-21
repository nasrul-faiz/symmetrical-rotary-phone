# Theme System Integration Guide

Quick start guide to integrate the new theme system into your existing HTML files.

## 🚀 Quick Start

### Step 1: Update Your HTML

Add the theme script **before the closing `</body>` tag**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <!-- Your content -->

  <!-- ADD THIS SCRIPT -->
  <script src="/theme.js"></script>
</body>
</html>
```

### Step 2: Use the API

```javascript
// Set a theme
setTheme('glass-light')
setTheme('glass-dark')
setTheme('dark')

// Get current theme
const currentTheme = getTheme()

// Toggle between themes
toggleTheme()

// Listen for theme changes
window.addEventListener('themechange', (event) => {
  console.log('Theme changed to:', event.detail.theme);
});
```

### Step 3: Add Theme Switcher (Optional)

Add this anywhere in your HTML to show a theme selector:

```html
<!-- Theme Switcher -->
<div id="theme-switcher" class="theme-switcher">
  <button class="theme-switcher-btn" data-theme="dark" title="Dark Mode">🌙</button>
  <button class="theme-switcher-btn" data-theme="light" title="Light Mode">☀️</button>
  <button class="theme-switcher-btn" data-theme="glass-light" title="Glass Light">✨</button>
  <button class="theme-switcher-btn" data-theme="glass-dark" title="Glass Dark">🌌</button>
</div>

<script>
  // Theme switcher initialization
  document.addEventListener('DOMContentLoaded', function() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) return;

    const buttons = switcher.querySelectorAll('.theme-switcher-btn');
    
    const updateActiveButton = () => {
      const currentTheme = window.getTheme?.() || 'dark';
      buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
      });
    };

    updateActiveButton();
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        window.setTheme?.(btn.dataset.theme);
        updateActiveButton();
      });
    });

    window.addEventListener('themechange', updateActiveButton);
  });
</script>
```

## 🎨 Using Glass Effects

### Apply Glass Effect to Any Element

```html
<!-- Normal Card -->
<div class="card">Standard card</div>

<!-- Card with Glass Effect -->
<div class="card glass">Glass card</div>

<!-- Direct Glass Components -->
<div class="glass-card">Glass card with built-in styling</div>
<button class="glass-button">Glass button</button>
<input type="text" class="glass-input" placeholder="Glass input">
<div class="glass-popover">Glass popover</div>
<span class="glass-badge">Glass badge</span>
```

### Dynamic Glass Application

```javascript
// Apply glass effect to elements
document.querySelectorAll('.card').forEach(card => {
  card.classList.add('glass');
});

// Or use the theme manager
window.themeManager.applyGlassEffect('.card');
window.themeManager.applyGlassEffect('.btn');

// Remove glass effect
window.themeManager.removeGlassEffect('.card');
```

## 📱 Integration Examples

### Example 1: Update Dashboard to Use Glass

```html
<!-- Before -->
<div class="card">
  <h3>Stats</h3>
  <p>Your data here</p>
</div>

<!-- After (Glass Light/Dark) -->
<div class="card glass">
  <h3>Stats</h3>
  <p>Your data here</p>
</div>
```

### Example 2: Add Theme Toggle to Navbar

```html
<header class="top-nav">
  <div class="top-nav-inner">
    <h1>My App</h1>
    
    <!-- Theme Toggle Button -->
    <button id="theme-toggle" class="btn glass" title="Toggle Theme">
      <span id="theme-icon">🌙</span>
    </button>
  </div>
</header>

<script>
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');

  const updateIcon = () => {
    const isDark = window.themeManager.isDarkTheme();
    icon.textContent = isDark ? '☀️' : '🌙';
  };

  toggle.addEventListener('click', () => {
    window.themeManager.toggleTheme('dark', 'light');
    updateIcon();
  });

  updateIcon();
  window.addEventListener('themechange', updateIcon);
</script>
```

### Example 3: Conditional Glass Effects Based on Theme

```javascript
window.addEventListener('themechange', (event) => {
  const isGlass = event.detail.theme.includes('glass');
  const cards = document.querySelectorAll('.card');
  
  cards.forEach(card => {
    if (isGlass) {
      card.classList.add('glass');
    } else {
      card.classList.remove('glass');
    }
  });
});
```

## 🔧 Advanced Customization

### Add Custom Theme Variables

Edit `styles.css` and add:

```css
[data-theme="my-custom"] {
  --background: #1a1a2e;
  --foreground: #e0e0e0;
  --panel-bg: #16213e;
  --primary: #0f3460;
  --primary-foreground: #e0e0e0;
  
  /* Glass Effect */
  --glass-bg: rgba(22, 33, 62, 0.7);
  --glass-border: rgba(224, 224, 224, 0.1);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}
```

Then use it:
```javascript
setTheme('my-custom');
```

### iOS Styles for Components

```html
<!-- iOS Rounded Corners -->
<div class="card ios-style">iPhone-style card</div>
<div class="card ios-style-sm">Smaller radius (12px)</div>
<div class="card ios-style-lg">Larger radius (20px)</div>

<!-- iOS Separator -->
<div class="divider-ios"></div>
```

## 📋 File Structure

```
public/
├── styles.css                    # Main stylesheet with all themes
├── theme.js                      # Theme manager logic
├── theme-switcher.html           # Theme switcher component
├── THEME_DEMO.html               # Demo page (view in browser)
├── THEME_DOCUMENTATION.md        # Full documentation
├── INTEGRATION_GUIDE.md           # This file
└── app.js                        # Your app script
```

## 🎯 Testing

### View Demo Page

1. Start your server
2. Open `http://localhost:your-port/THEME_DEMO.html`
3. Try switching between themes
4. Inspect the colors and glass effects

### Test in Your App

1. Update your HTML to include `theme.js`
2. Open browser console
3. Run: `setTheme('glass-light')`
4. Verify theme changes
5. Check CSS variables: `getComputedStyle(document.documentElement).getPropertyValue('--primary')`

## 🐛 Troubleshooting

### Theme script not loading?
- Check that `theme.js` is in `/src/public/`
- Verify the script tag path is correct
- Check browser console for errors

### Glass effect not visible?
- Ensure `styles.css` is loaded
- Check browser support for `backdrop-filter`
- Verify `-webkit-backdrop-filter` is applied

### Theme not persisting?
- Check if localStorage is enabled
- Clear browser cache
- Try in an incognito window

### Colors not updating?
- Ensure `data-theme` attribute is set correctly
- Verify CSS variables are being applied
- Check browser DevTools Elements tab

## 💡 Pro Tips

1. **Combine Glass with Dark Mode**: Use `glass-dark` for premium look
2. **Auto-detect System Preference**: Theme system does this automatically
3. **Smooth Transitions**: All theme changes include smooth CSS transitions
4. **Performance**: Glass effects use GPU acceleration for smooth performance
5. **Mobile Friendly**: Effects are optimized for all screen sizes

## 🚀 Production Tips

1. **Minify CSS/JS**: Compress `styles.css` and `theme.js` for production
2. **Bundle**: Include theme.js in your main bundle
3. **Cache**: Set appropriate cache headers for CSS/JS
4. **Fallbacks**: Theme gracefully degrades on older browsers
5. **Testing**: Test all themes on target devices

## 📞 Support

For detailed information, see:
- `THEME_DOCUMENTATION.md` - Complete API reference
- `THEME_DEMO.html` - Live examples
- `theme.js` - Source code with comments
- `styles.css` - All CSS variables and styles

---

**Last Updated:** 2026-07-22
**Version:** 1.0
