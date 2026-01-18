---
trigger: always_on
---

# reis-admin Code Style & Standards

This document defines coding standards and best practices for the `reis-admin` project.

---

## 🎯 Core Principles

### 1. Simplicity Over Cleverness
- Write code that a junior developer can understand
- Prefer explicit over implicit
- YAGNI: You Aren't Gonna Need It

### 2. Safety First (Inversion Thinking)
Before implementing, ask: **"What could go wrong?"**

**Never**:
- Run destructive commands (`rm -rf`) without explicit user confirmation
- Output secrets (`.env` contents, API keys) to terminal or logs
- Trust scraped/external data without sanitization
- Make breaking changes without user approval

### 3. Verification Before Implementation
- **Test-driven mindset**: Know how you'll verify it works before you build it
- **Fail fast**: Run linters, type checkers, tests frequently
- **No hallucinations**: Read error messages carefully; don't guess fixes

---

## 📝 HTML/JavaScript Standards

### HTML Structure

**DO**:
```html
<!-- Semantic, clean structure -->
<div class="card bg-base-200">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p class="text-base-content/70">Description</p>
  </div>
</div>
```

**DON'T**:
```html
<!-- Excessive nesting, inline styles -->
<div>
  <div>
    <div style="background: #f9fafb">
      <div class="wrapper">
        <h2>Title</h2>
      </div>
    </div>
  </div>
</div>
```

### JavaScript Best Practices

1. **Use modern JavaScript** (ES6+)
   ```javascript
   // ✅ Good
   const btn = document.getElementById('submit-btn');
   const { data, error } = await supabaseClient.auth.signIn(credentials);
   
   // ❌ Avoid
   var btn = document.getElementById('submit-btn');
   ```

2. **Error handling**
   ```javascript
   // ✅ Good
   try {
     const result = await apiCall();
     if (result.error) throw result.error;
     // Handle success
   } catch (error) {
     console.error('API call failed:', error.message);
     showErrorAlert(error.message);
   }
   
   // ❌ Bad
   const result = await apiCall(); // No error handling
   ```

3. **DOM manipulation**
   ```javascript
   // ✅ Good - Clear state management
   function showLoading() {
     submitBtn.disabled = true;
     submitBtn.innerHTML = '<span class="loading loading-spinner loading-xs"></span>';
   }
   
   function hideLoading() {
     submitBtn.disabled = false;
     submitBtn.textContent = 'Submit';
   }
   
   // ❌ Bad - Direct inline manipulation
   submitBtn.disabled = true;
   submitBtn.innerHTML = '<span class="loading loading-spinner"></span>';
   ```

---

## 🎨 CSS Standards (Tailwind/DaisyUI)

See [ui-guidelines.md](./ui-guidelines.md) for comprehensive UI rules.

**Quick rules**:
1. ✅ Use DaisyUI components: `btn btn-primary`, `card`, `alert`
2. ✅ Use semantic colors: `bg-base-200`, `text-primary`, `border-base-300`
3. ❌ No custom CSS classes in HTML
4. ❌ No hex codes in templates: `bg-[#79be15]`
5. ❌ No inline styles: `style="color: red"`

---

## 📁 File Organization

### Directory Structure
```
reis-admin/
├── .agent/              # Agent configuration
│   ├── rules/          # Coding standards, UI guidelines
│   └── workflows/      # Common workflows
├── img/                # Images and assets
├── *.html              # HTML pages
├── input.css           # Tailwind source
├── styles.css          # Generated CSS (do not edit)
├── tailwind.config.js  # UI configuration
└── package.json        # Dependencies and scripts
```

### File Naming
- **HTML files**: `kebab-case.html` (e.g., `index.html`, `dashboard.html`)
- **Config files**: Standard names (`package.json`, `tailwind.config.js`)
- **Assets**: Descriptive names (`favicon.png`, `logo-dark.svg`)

---

## 🔒 Security Standards

### 1. Authentication
```javascript
// ✅ Good - Check session before sensitive operations
const { data: { session } } = await supabaseClient.auth.getSession();
if (!session) {
  window.location.href = 'index.html';
  return;
}

// ❌ Bad - No auth check
// Proceed with sensitive operation
```

### 2. Environment Variables
```javascript
// ✅ Good - Use environment variables (future improvement)
const SUPABASE_URL = process.env.SUPABASE_URL;

// ⚠️ Current - Acceptable for now, but mark for improvement
const SUPABASE_URL = 'https://zvbpgkmnrqyprtkyxkwn.supabase.co';
// TODO: Move to environment variables
```

### 3. Input Sanitization
```javascript
// ✅ Good - Validate and sanitize
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const email = document.getElementById('email').value.trim();
if (!validateEmail(email)) {
  showError('Invalid email address');
  return;
}
```

---

## 🧪 Testing & Verification

### Before Committing

1. **Visual testing**: Test in browser (both light and dark themes)
2. **Responsive testing**: Check mobile, tablet, desktop viewports
3. **Error scenarios**: Test with invalid inputs, network errors
4. **Build verification**: Run `npm run build:css` successfully

### Manual Testing Checklist

For UI changes:
- [ ] Tested in `mendelu` theme (light)
- [ ] Tested in `mendelu-dark` theme
- [ ] Tested on mobile viewport (< 640px)
- [ ] Tested form validation (if applicable)
- [ ] Tested error states
- [ ] Tested loading states
- [ ] No console errors

---

## 📦 Dependency Management

### Adding Dependencies

**Think twice before adding**:
- Can I solve this with vanilla JS?
- Does DaisyUI already provide this?
- Is this dependency maintained?

**If adding**:
```bash
# Install as dev dependency (build tools)
npm install --save-dev package-name

# Install as dependency (runtime)
npm install package-name
```

### Current Stack
- **Tailwind CSS**: Utility-first CSS framework
- **DaisyUI**: Component library for Tailwind
- **PostCSS**: CSS processing
- **Autoprefixer**: Browser compatibility

**Keep it minimal**. Every dependency is technical debt.

---

## 🐛 Debugging Guidelines

### 1. Read Error Messages
```
❌ Bad approach: See error → Guess fix → Random changes
✅ Good approach: See error → Read message → Understand root cause → Fix
```

### 2. Git History for Regressions
```bash
# When something breaks that "used to work"
git log -p -n 5 --stat

# Find when it broke
git log --oneline --all -- path/to/file.html
```

### 3. Browser DevTools
- **Console**: Check for JS errors
- **Network**: Verify file loads (especially `styles.css`)
- **Elements**: Inspect computed styles
- **Application**: Check localStorage, session storage

---

## ✅ Code Review Self-Checklist

Before requesting review or committing:

**Functionality**:
- [ ] Code works as intended
- [ ] Error cases handled gracefully
- [ ] Loading states shown during async operations

**Code Quality**:
- [ ] No console.log() statements left in
- [ ] No commented-out code
- [ ] No TODO comments without GitHub issues
- [ ] Variable names are descriptive

**UI/UX**:
- [ ] Follows DaisyUI component patterns
- [ ] No custom CSS (or justified if present)
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Responsive design

**Security**:
- [ ] User input validated/sanitized
- [ ] No secrets in code
- [ ] Auth checks in place

**Performance**:
- [ ] No unnecessary re-renders/rebuilds
- [ ] CSS built and minified
- [ ] Images optimized

---

## 📚 References

- **Parent Project**: `../reis` (design system source of truth)
- **UI Guidelines**: [ui-guidelines.md](./ui-guidelines.md)
- **DaisyUI Docs**: https://daisyui.com
- **Tailwind Docs**: https://tailwindcss.com
- **Supabase Docs**: https://supabase.com/docs

---

**Remember**: Simple, safe, and tested code beats clever code every time.
