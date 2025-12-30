# Authentication & RBAC Documentation

## Overview
TaskMaster now includes a complete authentication system with Role-Based Access Control (RBAC) powered by Supabase.

## Features

### 🔐 Authentication
- ✅ Email/Password Sign In
- ✅ Email/Password Sign Up
- ✅ Google OAuth Integration
- ✅ Password Reset
- ✅ Email Verification
- ✅ Session Management
- ✅ Protected Routes

### 👥 Role-Based Access Control (RBAC)
- ✅ User Roles: Admin, User, Guest
- ✅ Permission-based access control
- ✅ Route Protection
- ✅ Resource-level permissions

## User Roles

### Admin
- Full access to all features
- Can manage users
- Can read, write, and delete all resources
- Access to admin panel

### User (Default)
- Can access dashboard
- Can manage own tasks
- Can read/write tasks
- Limited settings access

### Guest
- Read-only dashboard access
- No task management

## Usage

### Protecting Routes

Wrap any page component with `ProtectedRoute`:

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute route="/dashboard">
      <YourComponent />
    </ProtectedRoute>
  );
}
```

### Checking Permissions in Components

Use the `usePermissions` hook:

```tsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { userRole, hasPermission, canAccessRoute } = usePermissions();

  const canEdit = hasPermission('tasks', 'write');
  const canDelete = hasPermission('tasks', 'delete');

  return (
    <div>
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
    </div>
  );
}
```

### Using Auth Context

Access user information anywhere:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, userRole, signOut } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <p>Role: {userRole}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Setting User Roles in Supabase

### Method 1: Supabase Dashboard
1. Go to Authentication > Users
2. Click on a user
3. Go to "User Metadata"
4. Add: `{ "role": "admin" }` or `{ "role": "user" }`

### Method 2: During Sign Up
Modify the sign-up function to include role:

```tsx
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: name,
      role: 'user', // or 'admin'
    },
  },
});
```

### Method 3: SQL Function (Recommended for Production)
Create a Supabase SQL function to assign default roles:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    raw_user_meta_data || '{"role": "user"}'::jsonb
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Available Routes

### Public Routes
- `/` - Landing page
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/forgot-password` - Password reset

### Protected Routes
- `/dashboard` - Main dashboard (User, Admin)
- `/admin` - Admin panel (Admin only)
- `/settings` - User settings (User, Admin)
- `/unauthorized` - Access denied page

## Permissions Matrix

| Resource | Admin | User | Guest |
|----------|-------|------|-------|
| Dashboard | Read, Write, Delete | Read | Read |
| Tasks | Read, Write, Delete | Read, Write | - |
| Users | Read, Write, Delete | - | - |
| Settings | Read, Write | Read | - |

## Security Best Practices

1. **Always validate on the server**: RBAC in the frontend is for UX, always validate permissions on the backend
2. **Use Row Level Security (RLS)** in Supabase for data protection
3. **Never trust client-side role checks** for sensitive operations
4. **Implement proper session management**
5. **Use HTTPS in production**

## Environment Variables

Make sure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Customizing Roles & Permissions

Edit `lib/rbac.ts` to add new roles or modify permissions:

```typescript
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator', // Add new role
  GUEST = 'guest',
}

const rolePermissions: Record<UserRole, RBACPermission[]> = {
  [UserRole.MODERATOR]: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'tasks', actions: ['read', 'write'] },
    { resource: 'users', actions: ['read'] },
  ],
  // ... other roles
};
```

## Troubleshooting

### Users can't access protected routes
- Check if user is authenticated
- Verify user role in Supabase dashboard
- Check browser console for errors

### Google OAuth not working
- Enable Google provider in Supabase Dashboard
- Add OAuth credentials
- Set correct redirect URLs

### Session not persisting
- Check if cookies are enabled
- Verify Supabase URL and keys
- Check browser storage

## Support

For issues or questions:
1. Check Supabase documentation
2. Review user metadata in Supabase dashboard
3. Check browser console for errors
