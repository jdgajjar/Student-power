'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Add home to the beginning
  const allItems = [{ name: 'Home', href: '/' }, ...items];

  // Generate structured data for breadcrumbs
  const structuredData = generateBreadcrumbSchema(
    allItems.map((item) => ({
      name: item.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://student-power.vercel.app'}${item.href}`,
    }))
  );

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Visual Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`w-full mb-6 ${className}`}
      >
        <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap min-w-min" itemScope itemType="https://schema.org/BreadcrumbList">
            {allItems.map((item, index) => {
              const isLast = index === allItems.length - 1;
              const isFirst = index === 0;

              return (
                <li
                  key={item.href}
                  className="flex items-center flex-shrink-0"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  {!isLast ? (
                    <>
                      <Link
                        href={item.href}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                        itemProp="item"
                      >
                        {isFirst && <Home className="h-4 w-4 mr-1 flex-shrink-0" />}
                        <span itemProp="name">{item.name}</span>
                      </Link>
                      <meta itemProp="position" content={String(index + 1)} />
                      <ChevronRight className="h-4 w-4 mx-2 text-gray-400 flex-shrink-0" aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <span
                        className="font-medium text-gray-900 dark:text-white flex items-center"
                        itemProp="name"
                        aria-current="page"
                      >
                        {item.name}
                      </span>
                      <meta itemProp="position" content={String(index + 1)} />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
