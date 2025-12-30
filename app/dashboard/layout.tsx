import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Manage your tasks and boost productivity',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
