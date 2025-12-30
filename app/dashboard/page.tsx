'use client';

import DashboardView from '@/components/DashboardView';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardPage() {
  const handleBackToLanding = () => {
    window.location.href = '/';
  };

  return (
    <ProtectedRoute route="/dashboard">
      <DashboardView onBackToLanding={handleBackToLanding} />
    </ProtectedRoute>
  );
}
