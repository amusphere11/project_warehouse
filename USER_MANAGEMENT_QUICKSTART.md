# Quick Start Guide - User Management

## 🚀 Quick Setup (5 Minutes)

### Step 1: Ensure Backend is Running

```bash
cd backend
npm install  # If not already done
npx prisma migrate dev  # Run migrations
npm run dev  # Start backend
```

### Step 2: Ensure Frontend is Running

```bash
cd frontend
npm install  # If not already done
npm run dev  # Start frontend
```

### Step 3: Login as Admin

1. Open browser: `http://localhost:5173`
2. Login with admin credentials:
   - Email: `admin@example.com`
   - Password: (your admin password)

### Step 4: Access User Management

1. Look for the **"Users"** menu item in the left sidebar (with People icon)
2. Click on it to open the User Management page

### Step 5: Create Your First User

1. Click **"Add User"** button (top right)
2. Fill in the form:
   ```
   Name: John Doe
   Email: john@example.com
   Password: SecurePass123!
   Role: OPERATOR
   Status: Active (toggle on)
   ```
3. Click **"Create"**
4. Success! ✅

## 📸 Screenshots

### Users Page
```
┌─────────────────────────────────────────────────────────┐
│  User Management                                [Add User] │
│  Manage user accounts, roles, and permissions           │
├─────────────────────────────────────────────────────────┤
│  [Search...] [Role ▼] [Status ▼] [Search] [Reset]      │
├─────────────────────────────────────────────────────────┤
│  Name      Email              Role      Status  Actions  │
│  Admin     admin@example.com  ADMIN     Active  [✏️][🗑️] │
│  John Doe  john@example.com   OPERATOR  Active  [✏️][🗑️] │
└─────────────────────────────────────────────────────────┘
```

### Menu (Sidebar)
```
┌──────────────────┐
│ 📦 Warehouse Pro │
│ Production...    │
├──────────────────┤
│ 📊 Dashboard     │
│ 📷 Scanning      │
│ 📦 Inventory     │
│ 📁 Materials     │
│ 🛒 Products      │
│ 📊 Reports       │
│ 👥 Users         │  ← New!
└──────────────────┘
```

## 🎯 Common Tasks

### Create a Manager
```
Role: MANAGER
Permissions: Can view reports, manage inventory
Cannot: Create/edit/delete users
```

### Create an Operator
```
Role: OPERATOR
Permissions: Can scan items, view inventory
Cannot: View reports, manage users
```

### Deactivate a User (Instead of Delete)
1. Click Edit (✏️) on user row
2. Toggle "Active" switch to OFF
3. Click "Update"
4. User can no longer login

### Reset User Password
1. Click Edit (✏️) on user row
2. Enter new password in "Password" field
3. Click "Update"

### Search Users
```
Search by: Name or Email
Example: "john" or "admin@"
Click Search or press Enter
```

### Filter Users
```
By Role: ADMIN, MANAGER, OPERATOR
By Status: Active, Inactive
Combine filters for precise results
```

## ⚠️ Important Notes

### Security Rules
- ✅ Only ADMIN can access User Management
- ✅ Users cannot delete themselves
- ✅ Deleted users are soft-deleted (data preserved)
- ✅ Passwords are always encrypted
- ✅ All actions are logged in audit trail

### User Roles Explained

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, including user management |
| **MANAGER** | Manage inventory, view reports, no user management |
| **OPERATOR** | Scan items, basic operations, no management access |

### Best Practices
1. **Create only necessary accounts** - Don't create users for testing
2. **Use strong passwords** - Min 8 chars, mix of letters/numbers
3. **Review user list regularly** - Deactivate unused accounts
4. **Don't share passwords** - Each user should have unique credentials
5. **Use correct roles** - Assign minimum required permissions

## 🔧 Troubleshooting

### "Users menu not showing"
- **Check**: Are you logged in as ADMIN?
- **Solution**: Logout and login with admin account

### "Failed to create user"
- **Check**: Is email already in use?
- **Solution**: Use different email address

### "Cannot delete user"
- **Check**: Are you trying to delete yourself?
- **Solution**: Use another admin account to delete users

### "Password validation failed"
- **Check**: Is password at least 8 characters?
- **Solution**: Use longer, stronger password

## 📱 Mobile/Tablet Access

The User Management page is fully responsive:
- ✅ Works on desktop (best experience)
- ✅ Works on tablets (optimized layout)
- ✅ Works on mobile (stacked columns)

## 🎨 Visual Features

### Status Indicators
- 🟢 **Green Chip**: Active user
- ⚫ **Gray Chip**: Inactive user

### Role Badges
- 🔴 **Red Chip**: ADMIN
- 🟡 **Yellow Chip**: MANAGER
- 🔵 **Blue Chip**: OPERATOR

### Interactive Elements
- Hover effects on table rows
- Click to sort columns
- Pagination at bottom
- Real-time search

## 📞 Getting Help

### Still stuck?
1. Check the full documentation: [USER_MANAGEMENT.md](./USER_MANAGEMENT.md)
2. Review API endpoints: [Backend Routes](./backend/src/routes/user.routes.ts)
3. Check browser console for errors (F12)
4. Contact system administrator

## 🎓 Training Resources

### For Administrators
- Learn about user roles and permissions
- Understand audit logging
- Best practices for user management

### For Users
- How to change your password
- Understanding your role
- Basic system navigation

---

**Ready to go?** Start by creating your first user! 🚀
