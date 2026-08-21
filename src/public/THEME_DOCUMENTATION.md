# Theme System Documentation

Complete theming solution with Light Mode, Dark Mode, Black/White Variants, and Glassmorphism iOS Effects.

## 🎨 Available Themes

### Core Themes
- **dark** - Dark modern theme (default)
- **light** - Light professional theme

### Pure Variants
- **black** - Pure black (#000000) with white text
- **white** - Pure white (#FFFFFF) with black text

### Glass Morphism (iOS Style)
- **glass-light** - Frosted glass with light background
- **glass-dark** - Frosted glass with dark background

## 📦 Installation

1. **Include the theme script** in your HTML:
```html
<head>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <!-- Your content -->
  <script src="/theme.js"></script>
</body>
```

2. **Optional: Add theme switcher component**:
```html
<!-- Include the switcher in your navbar or sidebar -->
<div id="theme-switcher" class="theme-switcher">
  <button class="theme-switcher-btn" data-theme="dark" title="Dark Mode">🌙</button>
  <button class="theme-switcher-btn" data-theme="light" title="Light Mode">☀️</button>
  <button class="theme-switcher-btn" data-theme="glass-light" title="Glass Light">✨</button>
  <button class="theme-switcher-btn" data-theme="glass-dark" title="Glass Dark">🌌</button>
</div>

<!-- Load the theme switcher script -->
<script>
  // Theme switcher initialization (already included in theme-switcher.html)
  document.addEventListener('DOMContentLoaded', function() {
    const switcher = document.getElementById('theme-switcher');
    if (!switcher) return;

    const buttons = switcher.querySelectorAll('.theme-switcher-btn');
    const updateActiveButton = () => {
      const currentTheme = window.getTheme?.() || 'dark';
      buttons.forEach(btn => {
        if (btn.dataset.theme === currentTheme) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    };

    updateActiveButton();
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        window.setTheme?.(theme);
        updateActiveButton();
      });
    });

    window.addEventListener('themechange', updateActiveButton);
  });
</script>
```

## 🎯 Usage

### JavaScript API

```javascript
// Set a theme
setTheme('dark')          // dark, light, black, white, glass-light, glass-dark
setTheme('glass-light')

// Get current theme
const theme = getTheme()  // Returns: 'dark', 'light', 'black', etc.

// Toggle between two themes
toggleTheme()             // Toggles dark ↔ light

// Get all available themes
const themes = getAvailableThemes()
// Returns: 
// [
//   { id: 'dark', label: 'Dark', icon: '🌙' },
//   { id: 'light', label: 'Light', icon: '☀️' },
//   ...
// ]

// Access theme manager directly
window.themeManager.isDarkTheme()     // true if dark/black/glass-dark
window.themeManager.isGlassTheme()    // true if glass-light/glass-dark
```

### CSS Variables

All colors are CSS variables that automatically change with the theme:

```css
/* Base Colors */
--background          /* Main background color */
--foreground          /* Main text color */
--shell-bg            /* Application shell background */
--panel-bg            /* Panel/card background */

/* Interactive Colors */
--primary             /* Primary action color */
--primary-foreground  /* Primary text color */
--primary-hover       /* Hover state of primary */
--primary-soft        /* Soft variant of primary */

/* Status Colors */
--success, --success-bg
--warning, --warning-bg
--danger, --danger-bg

/* Glass Effect */
--glass-bg            /* Glass background with transparency */
--glass-border        /* Glass border color */
--glass-shadow        /* Glass shadow effect */

/* Design System */
--radius              /* Standard border radius */
--radius-lg           /* Large border radius */
--radius-xl           /* Extra large border radius */
--shadow              /* Standard shadow */
--shadow-lg           /* Large shadow */
```

### CSS Classes

#### Glassmorphism Components

```html
<!-- Glass Card -->
<div class="glass-card">
  Content with frosted glass effect
</div>

<!-- Glass Button -->
<button class="glass-button">Glass Button</button>

<!-- Glass Input -->
<input type="text" class="glass-input" placeholder="Glass input">

<!-- Glass Badge -->
<span class="glass-badge">Glass Badge</span>

<!-- Glass Popover -->
<div class="glass-popover">
  Popover content
</div>
```

#### Standard Components with Glass Option

```html
<!-- Card (normal or glass) -->
<div class="card">Normal card</div>
<div class="card glass">Glass card</div>

<!-- Button (normal or glass) -->
<button class="btn">Normal button</button>
<button class="btn glass">Glass button</button>

<!-- iOS Style Border Radius -->
<div class="ios-style">Large radius (20px)</div>
<div class="ios-style-sm">Small radius (12px)</div>
<div class="ios-style-lg">Large radius (20px)</div>

<!-- iOS Separator -->
<div class="divider-ios"></div>
```

## 🎨 Customization

### Creating Custom Themes

Add new themes by adding CSS variables to `styles.css`:

```css
[data-theme="custom-theme"] {
  color-scheme: dark;
  --background: #1a1a1a;
  --foreground: #f5f5f5;
  --shell-bg: #1a1a1a;
  --panel-bg: #2a2a2a;
  /* ... other variables ... */
  
  --glass-bg: rgba(26, 26, 26, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
}
```

### Applying Glass Effect Dynamically

```javascript
// Apply glass effect to specific elements
window.themeManager.applyGlassEffect('.card');

// Remove glass effect
window.themeManager.removeGlassEffect('.card');
```

## 🎯 Theme Detection

```javascript
// Listen for theme changes
window.addEventListener('themechange', (event) => {
  const { theme, label } = event.detail;
  console.log(`Theme changed to: ${label}`);
  // Update your app's state
});

// Check current theme properties
if (window.themeManager.isDarkTheme()) {
  // Handle dark theme specific logic
}

if (window.themeManager.isGlassTheme()) {
  // Handle glass theme specific logic
}
```

## 🔧 Advanced Features

### Auto Theme Detection
The theme system automatically detects system preferences:
- Respects `prefers-color-scheme` media query
- Falls back to light/dark based on system settings
- User's manual selection overrides system preference

### Persistent Storage
Theme preference is saved to `localStorage` and restored on page reload.

### Theme Transitions
All theme changes include smooth CSS transitions (200ms by default).

## 📱 Responsive Design

Glass effects and theme-specific styles are fully responsive:
- Mobile: Adjusted blur and transparency for better performance
- Desktop: Full glassmorphism effects enabled
- Tablet: Medium glass effects

## 🚀 Performance Optimization

- Minimal blur effect on mobile devices
- GPU-accelerated transforms
- Efficient CSS variable changes
- No layout recalculation on theme switch

## 🐛 Troubleshooting

### Theme not changing
1. Ensure `theme.js` is loaded after DOM
2. Check browser console for errors
3. Verify localStorage is enabled

### Glass effect not visible
1. Ensure your browser supports `backdrop-filter`
2. Check that backdrop-filter CSS is loaded
3. Verify `-webkit-backdrop-filter` is applied (Safari)

### Fallback for unsupported browsers
The theme system gracefully degrades on browsers without `backdrop-filter` support:
- Glass effects fall back to solid backgrounds
- All themes remain fully functional
- Performance is optimized automatically

## 📋 Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Variables | ✅ | ✅ | ✅ | ✅ |
| Backdrop Filter | ✅ | ✅ | ✅ (11.2+) | ✅ |
| Theme Storage | ✅ | ✅ | ✅ | ✅ |
| Transitions | ✅ | ✅ | ✅ | ✅ |

## 📝 Examples

### Example 1: Dark Mode Toggle Button
```html
<button onclick="toggleTheme()" class="theme-toggle">
  <span id="theme-label">Dark</span>
</button>

<script>
  window.addEventListener('themechange', (e) => {
    document.getElementById('theme-label').textContent = e.detail.label;
  });
</script>
```

### Example 2: Conditional Styling
```html
<div id="content"></div>

<script>
  function updateContent() {
    const isDark = window.themeManager.isDarkTheme();
    const theme = getTheme();
    
    const content = document.getElementById('content');
    if (theme === 'glass-dark') {
      content.classList.add('glass-card');
    } else if (isDark) {
      content.classList.remove('glass-card');
    }
  }

  updateContent();
  window.addEventListener('themechange', updateContent);
</script>
```

### Example 3: Theme-Aware Component
```html
<div class="card" id="my-card">
  <!-- Content -->
</div>

<script>
  const card = document.getElementById('my-card');
  
  window.addEventListener('themechange', (e) => {
    if (e.detail.theme.includes('glass')) {
      card.classList.add('glass');
    } else {
      card.classList.remove('glass');
    }
  });
</script>
```

## 📞 Support

For issues or questions about the theme system, refer to:
- CSS variables in `styles.css`
- Theme manager in `theme.js`
- Component examples in `theme-switcher.html`

---

**Created:** 2026-07-22
**Version:** 1.0
**Status:** Production Ready
