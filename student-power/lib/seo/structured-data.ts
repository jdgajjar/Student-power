import { BASE_URL, SITE_NAME } from './metadata';

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'University PDF library providing access to study materials, notes, and exam papers for college students worldwide.',
    sameAs: [
      // Add social media links here if available
    ],
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BASE_URL,
    description: 'Access university courses, study materials, and PDFs organized by university, course, semester, and subject.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/universities?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Breadcrumb List structured data
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate EducationalOrganization structured data for universities
 */
export function generateUniversitySchema(university: {
  name: string;
  description: string;
  location: string;
  url: string;
  logo?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: university.name,
    description: university.description,
    url: university.url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: university.location,
    },
    ...(university.logo && { logo: university.logo }),
  };
}

/**
 * Generate Course structured data
 */
export function generateCourseSchema(course: {
  name: string;
  description: string;
  provider: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: course.provider,
    },
    url: course.url,
    educationalLevel: 'Higher Education',
  };
}

/**
 * Generate LearningResource structured data for PDFs
 */
export function generatePDFSchema(pdf: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  fileFormat: string;
  subject: string;
  course: string;
  university: string;
  category: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: pdf.title,
    description: pdf.description,
    url: pdf.url,
    datePublished: pdf.datePublished,
    learningResourceType: getLearningResourceType(pdf.category),
    educationalLevel: 'Higher Education',
    about: {
      '@type': 'Thing',
      name: pdf.subject,
    },
    isPartOf: {
      '@type': 'Course',
      name: pdf.course,
      provider: {
        '@type': 'EducationalOrganization',
        name: pdf.university,
      },
    },
    fileFormat: pdf.fileFormat,
    inLanguage: 'en',
  };
}

/**
 * Generate CollectionPage structured data for listings
 */
export function generateCollectionSchema(collection: {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: collection.url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: collection.numberOfItems,
    },
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Helper function to map PDF category to learning resource type
 */
function getLearningResourceType(category: string): string {
  const mappings: Record<string, string> = {
    notes: 'Course Notes',
    assignments: 'Assignment',
    papers: 'Exam Paper',
    other: 'Educational Material',
  };
  return mappings[category] || 'Educational Material';
}

/**
 * Helper function to convert structured data to JSON string
 * Use this in components by creating a script tag manually
 */
export function stringifyJsonLd(data: any): string {
  return JSON.stringify(data);
}
