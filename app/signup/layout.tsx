import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create your TaskMaster account',
};

export default function SignUpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
