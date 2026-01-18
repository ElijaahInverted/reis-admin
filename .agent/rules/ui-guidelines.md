---
trigger: always_on
---

# reis-admin UI Guidelines

**CRITICAL**: This document defines the **STRICT UI/UX standards** for the `reis-admin` project. All UI work **MUST** adhere to these rules to maintain design parity with the main `reis` extension.

## 🎨 Design System Source of Truth

The **`../reis` extension** is the canonical design system. All UI patterns, components, and styling conventions **MUST** mirror the reis extension exactly.

### Design Parity Requirements

1. **Color Palette**: Use ONLY colors defined in the Tailwind config (copied from reis)
2. **Component Structure**: Follow the exact DaisyUI component patterns used in reis
3. **Typography**: Use the Inter font family and px-based sizing (not rem)
4. **Spacing**: Use px-based spacing from the Tailwind config
5. **Themes**: Support both `mendelu` (light) and `mendelu-dark` themes

---

## 🚫 The DaisyUI Law (Iron Rule)

> **DO NOT write custom CSS unless absolutely necessary and you can justify why DaisyUI cannot handle it.**

### What This Means:
- ✅ **YES**: Use `btn btn-primary`, `card card-body`, `input input-bordered`
- ❌ **NO**: Write custom classes like `.my-button { background: #79be15; }`
- ✅ **YES**: Use `bg-base-200`, `text-base-content`, `border-base-300`
- ❌ **NO**: Use hex codes like `#f9fafb` or `#111827` in HTML/components
- ✅ **YES**: Use `text-primary`, `btn-primary`, `bg-primary`
- ❌ **NO**: Use `text-[#79be15]` or `bg-[#79be15]`

### DaisyUI Component Priority

When building UI, use DaisyUI components in this order:

1. **Form Controls**: `input`, `select`, `textarea`, `checkbox`, `radio`, `toggle`, `range`
2. **Actions**: `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-sm`, `btn-lg`
3. **Data Display**: `card`, `badge`, `alert`, `table`, `stat`, `progress`
4. **Navigation**: `tabs`, `menu`, `breadcrumbs`, `navbar`, `drawer`
5. **Feedback**: `loading`, `loading-spinner`, `loading-dots`, `toast`, `modal`
6. **Layout**: `divider`, `stack`, `join`, `collapse`

### Semantic Class Usage

Always use semantic DaisyUI color classes:

```html
<!-- ✅ CORRECT -->
<button class="btn btn-primary">Submit</button>
<div class="alert alert-success">Success message</div>
<div class="bg-base-200 text-base-content">Content</div>
<span class="text-error">Error text</span>

<!-- ❌ WRONG -->
<button class="bg-[#79be15] text-white px-4 py-2 rounded-lg">Submit</button>
<div class="bg-green-100 text-green-800">Success message</div>
<div style="background: #f9fafb; color: #111827">Content</div>
```

---

## 🎯 Brand Colors (Mendelu)

### Primary Colors
- **Primary Green**: `#79be15` (accessed via `text-primary`, `bg-primary`, `btn-primary`)
- **Primary Green Hover**: `#6aab12` (accessed via `hover:bg-primary-hover`)
- **Accent Green**: `#8DC843` (accessed via `text-secondary`, `bg-secondary`)
- **Mendelu Dark**: `#444444` (accessed via `text-neutral`, `bg-neutral`)

### Theme Colors (DaisyUI Semantic)

Use these **semantic classes** instead of hex codes:

| Purpose | Light Theme | Dark Theme | Class Name |
|---------|-------------|------------|------------|
| Background (primary) | `#ffffff` | `#1f2937` | `bg-base-100` |
| Background (secondary) | `#f9fafb` | `#111827` | `bg-base-200` |
| Background (tertiary) | `#f3f4f6` | `#0f172a` | `bg-base-300` |
| Text (primary) | `#111827` | `#f3f4f6` | `text-base-content` |
| Border | — | — | `border-base-300` |
| Primary Action | `#79be15` | `#79be15` | `btn-primary`, `text-primary` |
| Success | `#22c55e` | `#22c55e` | `text-success`, `alert-success` |
| Warning | `#f59e0b` | `#f59e0b` | `text-warning`, `alert-warning` |
| Error | `#ef4444` | `#ef4444` | `text-error`, `alert-error` |
| Info | `#3b82f6` | `#3b82f6` | `text-info`, `alert-info` |

---

## 📐 Spacing & Sizing (px-based)

**CRITICAL**: The reis project uses **px-based spacing** (not rem) for Shadow DOM compatibility.

### Common Spacing Values

```css
gap-1     = 4px      p-1  = 4px      m-1  = 4px
gap-2     = 8px      p-2  = 8px      m-2  = 8px
gap-3     = 12px     p-3  = 12px     m-3  = 12px
gap-4     = 16px     p-4  = 16px     m-4  = 16px
gap-6     = 24px     p-6  = 24px     m-6  = 24px
gap-8     = 32px     p-8  = 32px     m-8  = 32px
```

### Typography Scale (px-based)

```css
text-xs   = 12px / 16px line-height
text-sm   = 14px / 20px
text-base = 16px / 24px
text-lg   = 18px / 28px
text-xl   = 20px / 28px
text-2xl  = 24px / 32px
text-3xl  = 30px / 36px
```

### Border Radius

```css
rounded-sm      = 2px
rounded         = 4px (DEFAULT)
rounded-md      = 6px
rounded-lg      = 8px
rounded-xl      = 12px
rounded-2xl     = 16px
rounded-full    = 9999px
rounded-card    = 12px (custom)
rounded-button  = 8px (custom)
```

---

## 🏗️ Component Patterns

### Card Pattern
```html
<div class="card w-full bg-base-200 shadow-xl border border-base-content/10">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

### Form Pattern
```html
<form class="space-y-4">
  <div class="form-control">
    <label class="label">
      <span class="label-text">Label</span>
    </label>
    <input type="text" class="input input-bordered w-full" />
  </div>
  
  <button type="submit" class="btn btn-primary w-full">
    Submit
  </button>
</form>
```

### Alert Pattern
```html
<div class="alert alert-info shadow-lg">
  <span>Info message</span>
</div>

<div class="alert alert-success shadow-lg">
  <span>Success message</span>
</div>

<div class="alert alert-error shadow-lg">
  <span>Error message</span>
</div>
```

### Loading Pattern
```html
<!-- Spinner -->
<span class="loading loading-spinner loading-sm text-primary"></span>
<span class="loading loading-spinner loading-md text-primary"></span>
<span class="loading loading-spinner loading-lg text-primary"></span>

<!-- Button loading state -->
<button class="btn btn-primary" disabled>
  <span class="loading loading-spinner loading-xs"></span>
  Loading...
</button>
```

---

## 🎨 Opacity Utilities

Use Tailwind's opacity utilities for subtle effects:

```html
<!-- Text opacity -->
<span class="text-base-content/60">Muted text (60%)</span>
<span class="text-base-content/50">More muted (50%)</span>
<span class="text-base-content/40">Subtle (40%)</span>

<!-- Background opacity -->
<div class="bg-primary/10">Light background tint</div>
<div class="bg-error/10">Light error background</div>

<!-- Border opacity -->
<div class="border border-base-content/10">Subtle border</div>
```

---

## ✨ Interactive States

### Hover Effects
```html
<!-- Button hover (built into DaisyUI) -->
<button class="btn btn-primary">Hovers automatically</button>

<!-- Custom hover on non-button elements -->
<div class="hover:bg-base-300 transition-colors">
  Hoverable item
</div>

<!-- Icon hover -->
<button class="text-base-content/70 hover:text-primary transition-colors">
  <Icon />
</button>
```

### Disabled States
```html
<!-- Disabled button (DaisyUI handles styling) -->
<button class="btn btn-primary" disabled>Disabled</button>

<!-- Manual disabled appearance -->
<div class="opacity-50 cursor-not-allowed">
  Disabled content
</div>
```

---

## 🚀 Performance & Build

### CSS Build Process

1. **Source**: `input.css` (Tailwind directives)
2. **Output**: `styles.css` (compiled with DaisyUI)
3. **Build Command**: `npm run build:css`
4. **Watch Command**: `npm run dev` (auto-rebuild on changes)

### When to Rebuild CSS

Rebuild CSS when you:
- Add new HTML files
- Use new Tailwind/DaisyUI classes
- Modify `tailwind.config.js`
- Change theme colors or spacing

---

## 📋 Checklist: Before Committing UI Work

- [ ] Used ONLY DaisyUI components (no custom CSS)
- [ ] Used semantic color classes (`text-primary`, `bg-base-200`, etc.)
- [ ] No hex codes in HTML/components
- [ ] Tested in both `mendelu` (light) and `mendelu-dark` themes
- [ ] Used px-based spacing (no rem values)
- [ ] Followed card/form/alert patterns from this guide
- [ ] Ran `npm run build:css` to regenerate styles
- [ ] Verified responsive behavior (mobile, tablet, desktop)

---

## 🔍 Common Mistakes to Avoid

### ❌ DON'T:
```html
<!-- Custom CSS classes -->
<div class="my-custom-button">Button</div>

<!-- Hex codes -->
<div class="bg-[#79be15]">Content</div>

<!-- Arbitrary values -->
<div class="p-[20px]">Content</div>

<!-- Inline styles -->
<div style="color: #79be15">Text</div>

<!-- Mixing design systems -->
<button class="bg-blue-500 text-white">Button</button>
```

### ✅ DO:
```html
<!-- DaisyUI components -->
<button class="btn btn-primary">Button</button>

<!-- Semantic colors -->
<div class="bg-primary text-primary-content">Content</div>

<!-- Standard spacing -->
<div class="p-5">Content</div>

<!-- DaisyUI utilities -->
<div class="text-primary">Text</div>

<!-- Consistent design system -->
<button class="btn btn-primary">Button</button>
```

---

## 📚 Additional Resources

- **DaisyUI Docs**: https://daisyui.com/components/
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **reis Tailwind Config**: `../reis/tailwind.config.js` (source of truth)
- **reis Components**: `../reis/src/components/` (reference implementations)

---

**Remember**: When in doubt, check how it's done in the `../reis` extension and mirror that pattern exactly.
