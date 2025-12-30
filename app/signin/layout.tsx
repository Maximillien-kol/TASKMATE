import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to your TaskMaster account',
};

export default function SignInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
