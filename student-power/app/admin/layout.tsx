import { Metadata } from 'next';
import { generateAdminMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateAdminMetadata('Dashboard');

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
