'use client';

import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, canAccessRoute } from '@/lib/rbac';

export function usePermissions() {
    const { userRole } = useAuth();

    const checkPermission = (resource: string, action: string) => {
        return hasPermission(userRole, resource, action);
    };

    const checkRouteAccess = (route: string) => {
        return canAccessRoute(userRole, route);
    };

    return {
        userRole,
        hasPermission: checkPermission,
        canAccessRoute: checkRouteAccess,
    };
}
