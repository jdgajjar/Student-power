import { Metadata } from 'next';
import { generateUniversitiesMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateUniversitiesMetadata();

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
