# Application Routes

## Public Routes
- `/login` - User login page
- `/register` - User registration page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token
- `/contact-support` - Contact support form

## Protected Routes (Require Authentication)

### Dashboard & Modules
All routes below use the shared dashboard layout with sidebar:

- **`/dashboard`** - Main dashboard overview
- **`/profile`** - User profile page (requires `modules~permission~profile` or super_admin)
- **`/activity`** - Activity log page (requires `modules~permission~activity` or super_admin)
- **`/settings`** - Settings page (requires `modules~permission~settings` or super_admin)
- **`/security`** - Security center page (requires `modules~permission~security` or super_admin)

### Admin Routes (Super Admin Only)
- **`/users`** - User management (requires `super_admin` role)
- **`/permissions`** - Permission management (requires `super_admin` role)

## Permission System

### Permission Format
Permissions follow the format: `modules~permission~{module_name}`

Example permissions:
- `modules~permission~profile`
- `modules~permission~activity`
- `modules~permission~settings`
- `modules~permission~security`

### Access Control
- Users with specific permissions can access corresponding module pages
- Users with `super_admin` role have access to ALL pages
- Unauthorized access returns **404 Not Found** (not "Access Denied")

## API Routes
- `/api/auth/login` - User authentication
- `/api/auth/register` - User registration
- `/api/auth/logout` - User logout
- `/api/auth/session` - Session verification
- `/api/auth/forgot-password` - Password reset request
- `/api/auth/reset-password` - Password reset with token
- `/api/contact/submit` - Submit contact form
- `/api/contact/list` - List contact submissions
- `/api/contact/[id]` - Get specific contact submission
