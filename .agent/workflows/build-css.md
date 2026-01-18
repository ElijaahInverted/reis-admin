---
description: Build or watch Tailwind CSS
---

# Build Tailwind CSS

This workflow compiles the Tailwind CSS with DaisyUI for the reis-admin project.

## Prerequisites

Ensure you have installed dependencies:
```bash
npm install
```

## Build Commands

### 1. Production Build (Minified)

Compile CSS for production (minified output):

```bash
npm run build:css
```

**When to use**: Before committing changes, before deploying, or after modifying Tailwind config.

**Output**: Generates `styles.css` (minified)

---

### 2. Development Mode (Watch)

Watch for changes and auto-rebuild:

// turbo
```bash
npm run dev
```

**When to use**: During active development when making frequent HTML/template changes.

**Behavior**: Automatically rebuilds `styles.css` whenever you modify:
- `*.html` files
- `tailwind.config.js`
- `input.css`

**How to stop**: Press `Ctrl+C` in the terminal

---

## Troubleshooting

### CSS not applying after changes?

1. **Rebuild CSS**:
   ```bash
   npm run build:css
   ```

2. **Hard refresh browser**: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

3. **Check browser console** for 404 errors on `styles.css`

### New DaisyUI classes not working?

1. Ensure the class is in your HTML/template files
2. Rebuild CSS: `npm run build:css`
3. Check `tailwind.config.js` has `content: ["./*.{html,js}"]`

### Build warnings about browserslist?

Safe to ignore, or run:
```bash
npx update-browserslist-db@latest
```

---

## File Structure

```
reis-admin/
├── input.css              # Source file (Tailwind directives)
├── styles.css             # Generated file (DO NOT EDIT MANUALLY)
├── tailwind.config.js     # Tailwind configuration
├── package.json           # Contains build scripts
└── *.html                 # HTML files using the styles
```

**IMPORTANT**: Never manually edit `styles.css` - it will be overwritten on rebuild!
