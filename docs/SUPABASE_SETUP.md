# Setting Up Supabase Database for TaskMaster

## 📋 Overview
This guide will help you set up the Supabase database to store all your TaskMaster data (users, tasks, categories) instead of using localStorage.

## 🚀 Quick Setup (5 minutes)

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `vdlbscxnrxvbzqpimtul`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Schema Script
1. Open the file: `supabase/schema.sql`
2. **Copy ALL the SQL code**
3. **Paste it** into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Tables Created
1. Go to **Database** → **Tables** in the left sidebar
2. You should now see these tables:
   - ✅ `profiles` - User profile data
   - ✅ `tasks` - All user tasks
   - ✅ `categories` - Task categories
   - ✅ `task_categories` - Task-category relationships

### Step 4: Check Row Level Security
1. Click on any table (e.g., `tasks`)
2. Go to the **Policies** tab
3. You should see security policies that ensure users can only access their own data

## 📊 What This Creates

### 1. **Profiles Table**
Stores user profile information:
```
- id (linked to auth.users)
- email
- full_name
- avatar_url
- role (admin/user/guest)
- created_at, updated_at
```

### 2. **Tasks Table**
Stores all tasks:
```
- id
- user_id (who owns this task)
- title
- description
- status (pending/in_progress/completed/archived)
- priority (low/medium/high/urgent)
- due_date
- tags
- created_at, updated_at
```

### 3. **Categories Table**
Stores custom categories:
```
- id
- user_id
- name
- color
- icon
```

### 4. **Automatic Features**
✅ **Auto-create profile** when user signs up
✅ **Row Level Security** - users can only see their own data
✅ **Automatic timestamps** - created_at and updated_at
✅ **Indexes** for fast queries

## 🔍 Viewing Your Data

### See Registered Users:
1. **Authentication** → **Users** (NOT in Database/Tables!)
2. Here you'll see all registered users

### See User Data:
1. **Database** → **Tables** → **profiles**
2. You'll see extended user information

### See Tasks:
1. **Database** → **Tables** → **tasks**
2. All tasks from all users (filtered by RLS in app)

## 🧪 Testing the Database

### Test in SQL Editor:
```sql
-- See all profiles
SELECT * FROM profiles;

-- See all tasks
SELECT * FROM tasks;

-- See a specific user's tasks
SELECT * FROM tasks WHERE user_id = 'YOUR_USER_ID';
```

## 🔐 Security (Row Level Security - RLS)

The schema includes RLS policies that ensure:
- ✅ Users can only see/edit their own tasks
- ✅ Users can only see/edit their own profile
- ✅ Admins can see all profiles (for management)
- ✅ Data is secure even if API keys are exposed

## ✨ Next Steps

After running the SQL schema, you need to:

1. **Update the app code** to use Supabase instead of localStorage
2. **Migrate existing localStorage data** (if any) to Supabase
3. **Test CRUD operations** (Create, Read, Update, Delete)

Would you like me to:
- [ ] Update the app to use Supabase database
- [ ] Create API functions for tasks
- [ ] Build a migration script for localStorage data

## 🆘 Troubleshooting

### "Permission denied" errors:
- Make sure you ran ALL the SQL (including RLS policies)
- Check that you're logged in when testing

### "Table already exists" errors:
- The schema uses IF NOT EXISTS, so it's safe to run multiple times
- If you want to start fresh, drop tables first

### Can't see users:
- **Users** are in **Authentication → Users** NOT in Database tables
- **Profiles** (extended user data) are in **Database → Tables → profiles**

## 📚 Resources

- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview#the-sql-editor)
