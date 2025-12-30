export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
}

export interface RBACPermission {
    resource: string;
    actions: string[];
}

const rolePermissions: Record<UserRole, RBACPermission[]> = {
    [UserRole.ADMIN]: [
        { resource: 'dashboard', actions: ['read', 'write', 'delete'] },
        { resource: 'users', actions: ['read', 'write', 'delete'] },
        { resource: 'tasks', actions: ['read', 'write', 'delete'] },
        { resource: 'settings', actions: ['read', 'write'] },
    ],
    [UserRole.USER]: [
        { resource: 'dashboard', actions: ['read'] },
        { resource: 'tasks', actions: ['read', 'write'] },
        { resource: 'settings', actions: ['read'] },
    ],
    [UserRole.GUEST]: [
        { resource: 'dashboard', actions: ['read'] },
    ],
};

export function hasPermission(
    role: UserRole,
    resource: string,
    action: string
): boolean {
    const permissions = rolePermissions[role];
    if (!permissions) return false;

    const resourcePermission = permissions.find((p) => p.resource === resource);
    if (!resourcePermission) return false;

    return resourcePermission.actions.includes(action);
}

export function getUserRole(userMetadata: any): UserRole {
    // Check user metadata for role
    const role = userMetadata?.role;

    if (role === UserRole.ADMIN) return UserRole.ADMIN;
    if (role === UserRole.USER) return UserRole.USER;

    // Default to USER for authenticated users
    return UserRole.USER;
}

export function canAccessRoute(role: UserRole, route: string): boolean {
    // Admin can access everything
    if (role === UserRole.ADMIN) return true;

    // Define route access by role
    const routeAccess: Record<string, UserRole[]> = {
        '/dashboard': [UserRole.ADMIN, UserRole.USER],
        '/admin': [UserRole.ADMIN],
        '/settings': [UserRole.ADMIN, UserRole.USER],
    };

    const allowedRoles = routeAccess[route];
    if (!allowedRoles) return true; // Public route

    return allowedRoles.includes(role);
}
