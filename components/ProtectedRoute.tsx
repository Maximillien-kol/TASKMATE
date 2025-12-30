'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, canAccessRoute, getUserRole } from '@/lib/rbac';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: UserRole;
    route?: string;
}

export default function ProtectedRoute({
    children,
    requiredRole,
    route,
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Not authenticated - redirect to sign in
            if (!user) {
                router.push('/signin');
                return;
            }

            // Check role-based access if route is specified
            if (route) {
                const userRole = getUserRole(user.user_metadata);
                const hasAccess = canAccessRoute(userRole, route);

                if (!hasAccess) {
                    router.push('/unauthorized');
                    return;
                }
            }

            // Check specific role requirement
            if (requiredRole) {
                const userRole = getUserRole(user.user_metadata);
                if (userRole !== requiredRole) {
                    router.push('/unauthorized');
                    return;
                }
            }
        }
    }, [user, loading, router, requiredRole, route]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return null;
    }

    return <>{children}</>;
}
