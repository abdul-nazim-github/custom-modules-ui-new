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

- **`/dashboard`** - Main dashboard overview (all authenticated users)
- **`/profile`** - User profile page (requires `modules~permission~profile` or `super_admin`)
- **`/activity`** - Activity log page (requires `modules~permission~activity` or `super_admin`)
- **`/settings`** - Settings page (requires `modules~permission~settings` or `super_admin`)
- **`/security`** - Security center page (requires `modules~permission~security` or `super_admin`)

### Management Routes
- **`/users`** - User management (requires `modules~permission~manage_users` or `super_admin`)
- **`/permissions`** - Permission management (requires `modules~permission~manage_permissions` or `super_admin`)
- **`/contact-submissions`** - Contact form submissions (requires `modules~permission~contact_form` or `super_admin`)

## Permission System

### Permission Format
Permissions follow the format: `modules~permission~{module_name}`

### Available Permissions
- `modules~permission~profile` - Access to profile page
- `modules~permission~activity` - Access to activity page
- `modules~permission~settings` - Access to settings page
- `modules~permission~security` - Access to security page
- `modules~permission~manage_users` - Access to user management (view and edit names)
- `modules~permission~manage_permissions` - Access to permission management
- `modules~permission~contact_form` - Access to contact form submissions

### Access Control
- Users with specific permissions can access corresponding pages
- Users with `super_admin` role have access to ALL pages and features
- Unauthorized access returns **404 Not Found** (not "Access Denied")

### User Management Rules
- Users with `manage_users` permission can:
  - View all users
  - Edit user names (except their own)
- Users with `manage_permissions` permission can:
  - Modify user permissions
  - See the "Manage Permissions" button in the users list
  - **Cannot modify their own permissions** (security protection)
- Users WITHOUT `manage_permissions` see a disabled permissions button with tooltip

## API Routes
### Authentication
- `/api/auth/login` - User authentication
- `/api/auth/register` - User registration
- `/api/auth/logout` - User logout
- `/api/auth/session` - Session verification
- `/api/auth/forgot-password` - Password reset request
- `/api/auth/reset-password` - Password reset with token

### User Management
- `/api/auth/users` - Get users list (with pagination)
- `/api/auth/users/[id]/permissions` - Update user permissions
- `/api/auth/users/[id]/role` - Update user role
- `/api/auth/profile/edit` - Edit user profile (name)

### Contact
- `/api/contact/submit` - Submit contact form
- `/api/contact/list` - List contact submissions (requires permission)
- `/api/contact/[id]` - Get specific contact submission
