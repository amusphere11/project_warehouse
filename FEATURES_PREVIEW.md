# 🎨 UI/UX Features Preview

## 🌟 Highlight Features

### 1. Dark Mode Toggle ☀️🌙
```
Lokasi: AppBar (kanan atas)
Fungsi: Toggle between light and dark theme
Animasi: Smooth transition 0.3s
Icon: Sun (light) / Moon (dark)
```

### 2. Gradient Sidebar 🌈
```css
Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Width: 280px
Text Color: White with opacity variations
Hover Effect: Transform translateX(4px)
Selected: Alpha white background (0.2)
```

### 3. Glassmorphism AppBar ✨
```css
Background: theme.palette.background.paper
Backdrop Filter: blur(10px)
Border: 1px solid divider
Elevation: 0 (flat design)
Height: 64px
```

### 4. Modern Stat Cards 📊
```
Layout: Grid 4 columns (responsive)
Features:
  - Icon dengan colored background (alpha 0.1)
  - Large number typography
  - Trend indicator (arrow + percentage)
  - Hover lift effect (translateY -4px)
  - Rounded corners (12px)
  - Border instead of shadow
```

### 5. Premium Charts 📈
```
BarChart:
  - Rounded top corners (radius [8,8,0,0])
  - Theme-aware colors
  - Custom tooltip styling
  
LineChart:
  - Stroke width: 3px
  - Active dot: radius 6px
  - Smooth curves (monotone)
  - Colored dots matching lines
```

---

## 🎨 Color Palette

### Light Mode
| Element | Color | Hex |
|---------|-------|-----|
| Primary | Indigo | `#6366f1` |
| Secondary | Pink | `#ec4899` |
| Success | Green | `#10b981` |
| Warning | Orange | `#f59e0b` |
| Error | Red | `#ef4444` |
| Background | Slate 50 | `#f8fafc` |
| Paper | White | `#ffffff` |

### Dark Mode
| Element | Color | Hex |
|---------|-------|-----|
| Primary | Light Indigo | `#818cf8` |
| Secondary | Light Pink | `#f472b6` |
| Success | Green | `#10b981` |
| Warning | Orange | `#f59e0b` |
| Error | Red | `#ef4444` |
| Background | Slate 900 | `#0f172a` |
| Paper | Slate 800 | `#1e293b` |

---

## 📐 Layout Measurements

```
Sidebar Width: 280px
AppBar Height: 64px
Content Padding: 24px (desktop), 16px (mobile)
Card Border Radius: 12px
Button Border Radius: 10px
Paper Border Radius: 12px
```

---

## ✨ Animations & Transitions

### Sidebar Items
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
hover: {
  transform: translateX(4px),
  backgroundColor: alpha(#ffffff, 0.15)
}
```

### Stat Cards
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
hover: {
  transform: translateY(-4px),
  boxShadow: theme.shadows[4]
}
```

### Buttons
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
hover: {
  transform: translateY(-2px),
  boxShadow: 0 4px 12px 0 rgb(0 0 0 / 0.15)
}
```

---

## 🔤 Typography

```typescript
Font Family: 'Inter'
Weights Available: 300, 400, 500, 600, 700, 800, 900

h1: 2.5rem, weight 800, -0.02em spacing
h2: 2rem, weight 700, -0.01em spacing
h3: 1.75rem, weight 700, -0.01em spacing
h4: 1.5rem, weight 600, -0.01em spacing
h5: 1.25rem, weight 600
h6: 1rem, weight 600
body1: 1rem, line-height 1.6
body2: 0.875rem, line-height 1.6
button: weight 600, 0.02em spacing, no transform
```

---

## 📱 Responsive Breakpoints

```typescript
xs: 0px (mobile)
sm: 600px (tablet)
md: 960px (desktop small)
lg: 1280px (desktop)
xl: 1920px (desktop large)
```

### Layout Behavior
- **< 600px**: Drawer slides in/out, stack cards vertically
- **600px - 960px**: Permanent sidebar, 2 columns cards
- **> 960px**: Full layout, 4 columns cards

---

## 🎯 Component Overrides

### MuiButton
```typescript
borderRadius: 10px
padding: 10px 24px
boxShadow: none
hover: {
  boxShadow: 0 4px 12px 0 rgb(0 0 0 / 0.15)
  transform: translateY(-2px)
}
```

### MuiCard
```typescript
borderRadius: 12px
boxShadow: none (custom implementation)
border: 1px solid divider
```

### MuiPaper
```typescript
borderRadius: 12px
elevation variants: 0-6 (Tailwind-inspired)
```

### MuiDrawer
```typescript
paper: {
  border: none
  width: 280px
  background: gradient (sidebar only)
}
```

---

## 🔧 Customization Examples

### Change Primary Color
```typescript
// frontend/src/theme.ts
primary: {
  main: '#0ea5e9', // Sky Blue
  light: '#38bdf8',
  dark: '#0284c7',
}
```

### Change Sidebar Gradient
```typescript
// frontend/src/components/Layout.tsx
background: theme.palette.mode === 'dark' 
  ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
  : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', // Sky Blue
```

### Change Font Family
```html
<!-- frontend/index.html -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
```

```typescript
// frontend/src/theme.ts
fontFamily: [
  'Poppins',
  // ...
].join(','),
```

---

## 📊 Dashboard Components

### Stat Cards (4 Items)
1. **Inbound Today** - Success color, TrendingUp icon
2. **Outbound Today** - Error color, TrendingDown icon
3. **Total Materials** - Primary color, Category icon
4. **Low Stock Items** - Warning color, Warning icon

Each card shows:
- Title
- Large number
- Trend percentage
- Icon with colored background
- "vs last week" text

### Charts (2 Items)
1. **Bar Chart** - Weekly Inbound vs Outbound (7 days)
2. **Line Chart** - Transaction Trend (7 days)

Both charts include:
- Responsive container
- Theme-aware colors
- Custom tooltips
- Gridlines
- Legend
- X/Y axis labels

---

## ✅ Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari iOS 14+
- ✅ Chrome Android 90+

---

## 🎉 Ready to Use!

All features are **production-ready** and **optimized** for performance!

Deploy sekarang untuk melihat hasilnya! 🚀
