# 🎨 Visual Component Guide - Material Dashboard Integration

## ComplexStatisticsCard Anatomy

```
┌─────────────────────────────────────┐
│                                     │
│     ╔══════╗  ← Floating Icon Box  │
│  ╔══╝  📈  ╚══╗  (position: absolute)│
│  ║  gradient  ║  top: -20px         │
│  ║  + shadow  ║  64x64px            │
│  ╚═══════════╝                      │
│                                     │
│              Inbound Today          │ ← Title
│                                     │
│                   150               │ ← Count (large)
│                                     │
│ ────────────────────────────────────│ ← Divider
│                                     │
│  ↗ +12.5%  than last week          │ ← Percentage
│                                     │
└─────────────────────────────────────┘
     ↑
  Hover: lift up 4px + shadow increase
```

---

## Color Coding System

### Success (Green)
```
┌─────────────────┐
│   ╔════╗        │
│   ║ 📈 ║  ← #10b981 gradient
│   ╚════╝        │
│   Inbound       │
│     150         │
│  ↗ +12%         │ ← Success color
└─────────────────┘
```

### Error (Red)
```
┌─────────────────┐
│   ╔════╗        │
│   ║ 📉 ║  ← #ef4444 gradient
│   ╚════╝        │
│   Outbound      │
│      80         │
│  ↗ +8%          │ ← Info/neutral
└─────────────────┘
```

### Primary (Indigo)
```
┌─────────────────┐
│   ╔════╗        │
│   ║ 📦 ║  ← #6366f1 gradient
│   ╚════╝        │
│   Materials     │
│     450         │
│  ↗ +5%          │ ← Success color
└─────────────────┘
```

### Warning (Orange)
```
┌─────────────────┐
│   ╔════╗        │
│   ║ ⚠️  ║  ← #f59e0b gradient
│   ╚════╝        │
│   Low Stock     │
│      3          │
│  ⚠ 3 items      │ ← Warning/error
└─────────────────┘
```

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│  Dashboard Overview                         ☀️ 👤  │ ← AppBar
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ 📈   │  │ 📉   │  │ 📦   │  │ ⚠️    │          │
│  │ 150  │  │  80  │  │ 450  │  │  3   │          │ ← Stats Row
│  │ +12% │  │  +8% │  │  +5% │  │ 3 it │          │
│  └──────┘  └──────┘  └──────┘  └──────┘          │
│                                                     │
│  ┌──────────────────────┐  ┌──────────────────┐   │
│  │                      │  │                  │   │
│  │   📊 Bar Chart      │  │  📈 Line Chart   │   │ ← Charts Row
│  │                      │  │                  │   │
│  └──────────────────────┘  └──────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Responsive Grid Breakpoints

### Desktop (lg: > 1280px)
```
┌─────────────────────────────────────────────┐
│  [Card 1]  [Card 2]  [Card 3]  [Card 4]   │ ← 4 columns
│  [  Chart 1  ]      [  Chart 2  ]          │ ← 2 columns
└─────────────────────────────────────────────┘
```

### Tablet (md: 600-960px)
```
┌─────────────────────────┐
│  [Card 1]  [Card 2]     │ ← 2 columns
│  [Card 3]  [Card 4]     │ ← 2 columns
│  [    Chart 1     ]     │ ← 1 column
│  [    Chart 2     ]     │ ← 1 column
└─────────────────────────┘
```

### Mobile (xs: < 600px)
```
┌──────────┐
│ [Card 1] │ ← 1 column
│ [Card 2] │ ← 1 column
│ [Card 3] │ ← 1 column
│ [Card 4] │ ← 1 column
│ [Chart1] │ ← 1 column
│ [Chart2] │ ← 1 column
└──────────┘
```

---

## Sidebar Structure

```
╔═══════════════════════╗
║  📦 Warehouse Pro     ║ ← Logo/Brand (gradient bg)
║  Production & Inv...  ║
╟───────────────────────╢
║                       ║
║  ▣ Dashboard     ←    ║ ← Active (highlighted)
║  ▢ Scanning           ║
║  ▢ Inventory          ║ ← Hover: slide right
║  ▢ Materials          ║
║  ▢ Products           ║
║  ▢ Reports            ║
║                       ║
╚═══════════════════════╝
     280px wide
```

---

## AppBar Structure

```
┌─────────────────────────────────────────────────┐
│  Dashboard      [space]        ☀️  John  (👤)  │
│  ↑ Page Title              ↑   ↑   ↑    ↑      │
│                         Toggle  Name  Avatar   │
└─────────────────────────────────────────────────┘
        Glassmorphism: blur(10px)
```

---

## Color Gradients

### Icon Box Gradients (195deg)
```
Success:  #10b981 → darker green
Error:    #ef4444 → darker red
Primary:  #6366f1 → darker indigo
Warning:  #f59e0b → darker orange
```

### Sidebar Gradient (135deg)
```
Light Mode: #667eea (indigo) → #764ba2 (purple)
Dark Mode:  #1e293b (slate) → #0f172a (darker slate)
```

---

## Shadow System

### Card Shadow (on hover)
```
Before: none (border only)
Hover:  elevation 6 (MUI shadow)
```

### Icon Box Shadow (colored)
```
boxShadow: 
  0 4px 20px 0 rgba(0,0,0,0.14),     ← Base shadow
  0 7px 10px -5px rgba(color, 0.4)   ← Colored shadow
```

Example for Success (green):
```
0 7px 10px -5px rgba(16, 185, 129, 0.4)
                    ↑ #10b981 with 40% opacity
```

---

## Typography Hierarchy

```
Page Title:       h4  (1.5rem, weight 700)
Card Title:       body2 (0.875rem, weight 500)
Card Count:       h4  (1.5rem, weight 700)
Percentage:       caption (0.75rem, weight 700)
Percentage Label: caption (0.75rem, regular)
```

---

## Animation Timings

```
Card Hover:       0.3s cubic-bezier(0.4, 0, 0.2, 1)
Sidebar Item:     0.3s cubic-bezier(0.4, 0, 0.2, 1)
Theme Toggle:     0.3s (smooth transition)
Page Transitions: 0.3s
```

---

## Spacing System

```
Card Padding:         24px (p: 3)
Icon Box Size:        64x64px
Icon Box Top Offset:  -20px (floating effect)
Grid Gap:             24px (spacing: 3)
Divider Margin:       16px top, 16px bottom
```

---

## Z-Index Layers

```
1. Base Content:      z-index: 0
2. Cards:             z-index: 1
3. Floating Icon Box: z-index: (auto, positioned absolute)
4. AppBar:            z-index: 1100 (MUI default)
5. Drawer:            z-index: 1200 (MUI default)
6. Modal:             z-index: 1300 (MUI default)
```

---

## Component Props Reference

### ComplexStatisticsCard
```typescript
<ComplexStatisticsCard
  color="success"              // Color variant
  icon={<TrendingUp />}        // Icon component
  title="Inbound Today"        // Card title
  count={150}                  // Main number
  percentage={{                // Optional percentage
    color: "success",          // Trend color
    amount: "+12.5%",          // Change amount
    label: "than last week"    // Description
  }}
/>
```

### MDBox (from MDComponents)
```typescript
<MDBox
  variant="gradient"           // or undefined for solid
  bgColor="#6366f1"           // Background color
  coloredShadow="#818cf8"     // Shadow color
  borderRadius={3}            // Border radius (theme.spacing)
  shadow={4}                  // MUI shadow elevation
  opacity={0.9}               // Optional opacity
  sx={{ p: 3 }}               // Additional styles
>
  Content
</MDBox>
```

---

## Browser DevTools Tips

### Inspect Icon Box Position
```css
.ComplexStatisticsCard .iconBox {
  position: absolute;
  top: -20px;           ← Check this
  left: 24px;           ← And this
  transform: none;      ← Should not move until hover
}
```

### Check Gradient
```css
.iconBox {
  background: linear-gradient(195deg, #10b981, rgba(16,185,129,0.7));
  ↑ Direction  ↑ Start color  ↑ End color with alpha
}
```

### Verify Shadow
```css
.iconBox {
  box-shadow: 
    0 4px 20px 0 rgba(0,0,0,0.14),
    0 7px 10px -5px rgba(16,185,129,0.4);
    ↑ This should show colored glow
}
```

---

## Common Issues & Solutions

### Issue: Icon box tidak floating
```
Problem: Icon box tidak keluar dari card
Solution: Check parent card overflow
  
// ComplexStatisticsCard.tsx
<Card sx={{ overflow: 'visible' }}>  ← Must be visible!
```

### Issue: Gradient tidak terlihat
```
Problem: Gradient terlihat flat/solid
Solution: Check coloredShadow prop

// Use alpha for end color
background: linear-gradient(195deg, 
  ${bgColor},                    // Start: full color
  ${alpha(bgColor, 0.7)}         // End: 70% opacity
)
```

### Issue: Hover effect tidak smooth
```
Problem: Card loncat saat hover
Solution: Check transition timing

// Should use cubic-bezier
transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
```

---

## Performance Tips

1. **Use CSS transforms** (not margin/top for animations)
   ```css
   ✅ transform: translateY(-4px)
   ❌ margin-top: -4px
   ```

2. **Avoid expensive properties in animations**
   ```css
   ✅ transform, opacity
   ❌ width, height, box-shadow (ok for hover only)
   ```

3. **Use will-change sparingly**
   ```css
   /* Only on elements that will animate */
   will-change: transform;
   ```

---

## Testing Checklist

Visual Tests:
- [ ] Icon boxes float above cards
- [ ] Gradients display correctly
- [ ] Colored shadows visible
- [ ] Hover animations smooth
- [ ] Responsive layout works
- [ ] Dark mode switches properly
- [ ] Typography readable
- [ ] Colors accessible (contrast)

Interaction Tests:
- [ ] Cards clickable (if needed)
- [ ] Hover states trigger
- [ ] Percentage changes update
- [ ] Charts interactive
- [ ] Dark mode toggle instant

Performance Tests:
- [ ] Page loads < 2s
- [ ] No layout shift
- [ ] Animations 60fps
- [ ] No console errors
- [ ] Memory usage stable

---

Ready to impress with Material Dashboard design! 🎨✨
