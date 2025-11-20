import { Metadata } from 'next';

// Base URL - should be set from environment variable in production
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://student-power.vercel.app';
export const SITE_NAME = 'Student Power';
export const SITE_DESCRIPTION = 'Access university courses, study materials, PDFs, notes, assignments, and exam papers organized by university, course, semester, and subject. AI-powered PDF analysis and summaries.';

// SEO Keywords
export const COMMON_KEYWORDS = [
  'university',
  'college',
  'study materials',
  'PDF notes',
  'lecture notes',
  'exam papers',
  'previous year papers',
  'important questions',
  'study guide',
  'education',
  'student resources',
  'academic materials',
  'course materials',
  'online learning',
];

/**
 * Generate metadata for the home page
 */
export function generateHomeMetadata(): Metadata {
  return {
    title: `${SITE_NAME} - University PDF Library & Study Materials`,
    description: SITE_DESCRIPTION,
    keywords: [...COMMON_KEYWORDS, 'university library', 'student portal', 'educational platform'].join(', '),
    alternates: {
      canonical: BASE_URL,
    },
    openGraph: {
      type: 'website',
      url: BASE_URL,
      title: `${SITE_NAME} - University PDF Library & Study Materials`,
      description: SITE_DESCRIPTION,
      siteName: SITE_NAME,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} - University PDF Library & Study Materials`,
      description: SITE_DESCRIPTION,
      images: [`${BASE_URL}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Generate metadata for universities listing page
 */
export function generateUniversitiesMetadata(): Metadata {
  return {
    title: `Universities - Browse All Available Universities | ${SITE_NAME}`,
    description: 'Explore study materials from top universities worldwide. Find your university and access course materials, PDFs, notes, assignments, and exam papers.',
    keywords: [...COMMON_KEYWORDS, 'universities list', 'college list', 'top universities', 'university search'].join(', '),
    alternates: {
      canonical: `${BASE_URL}/universities`,
    },
    openGraph: {
      type: 'website',
      url: `${BASE_URL}/universities`,
      title: `Universities - Browse All Available Universities | ${SITE_NAME}`,
      description: 'Explore study materials from top universities worldwide. Find your university and access course materials.',
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Universities - Browse All Available Universities | ${SITE_NAME}`,
      description: 'Explore study materials from top universities worldwide.',
    },
  };
}

/**
 * Generate metadata for a specific university
 */
export function generateUniversityMetadata(universityName: string, description: string, location: string): Metadata {
  const title = `${universityName} - Courses & Study Materials | ${SITE_NAME}`;
  const desc = `Access ${universityName} study materials, course PDFs, lecture notes, assignments, and exam papers. ${description}`;
  const keywords = [...COMMON_KEYWORDS, universityName, location, `${universityName} notes`, `${universityName} papers`].join(', ');

  return {
    title,
    description: desc,
    keywords,
    alternates: {
      canonical: `${BASE_URL}/universities/${encodeURIComponent(universityName.toLowerCase().replace(/\s+/g, '-'))}`,
    },
    openGraph: {
      type: 'website',
      title,
      description: desc,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    },
  };
}

/**
 * Generate metadata for courses page
 */
export function generateCoursesMetadata(universityName: string): Metadata {
  const title = `${universityName} - All Courses | ${SITE_NAME}`;
  const desc = `Browse all available courses at ${universityName}. Access study materials, PDFs, notes, and exam papers for each course.`;

  return {
    title,
    description: desc,
    keywords: [...COMMON_KEYWORDS, universityName, `${universityName} courses`, 'course list', 'programs'].join(', '),
    alternates: {
      canonical: `${BASE_URL}/universities/${encodeURIComponent(universityName.toLowerCase().replace(/\s+/g, '-'))}/courses`,
    },
    openGraph: {
      type: 'website',
      title,
      description: desc,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary',
      title,
      description: desc,
    },
  };
}

/**
 * Generate metadata for a specific course
 */
export function generateCourseMetadata(universityName: string, courseName: string, courseDescription: string): Metadata {
  const title = `${courseName} - ${universityName} | ${SITE_NAME}`;
  const desc = `${courseName} at ${universityName}. ${courseDescription} Access semesters, subjects, study materials, and PDFs.`;

  return {
    title,
    description: desc,
    keywords: [...COMMON_KEYWORDS, universityName, courseName, `${courseName} notes`, `${courseName} materials`].join(', '),
    openGraph: {
      type: 'website',
      title,
      description: desc,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary',
      title,
      description: desc,
    },
  };
}

/**
 * Generate metadata for semesters page
 */
export function generateSemestersMetadata(universityName: string, courseName: string): Metadata {
  const title = `${courseName} Semesters - ${universityName} | ${SITE_NAME}`;
  const desc = `View all semesters for ${courseName} at ${universityName}. Access semester-wise subjects, notes, PDFs, and study materials.`;

  return {
    title,
    description: desc,
    keywords: [...COMMON_KEYWORDS, universityName, courseName, 'semesters', 'semester materials'].join(', '),
    openGraph: {
      type: 'website',
      title,
      description: desc,
      siteName: SITE_NAME,
    },
  };
}

/**
 * Generate metadata for subjects page
 */
export function generateSubjectsMetadata(
  universityName: string,
  courseName: string,
  semesterName: string
): Metadata {
  const title = `${semesterName} Subjects - ${courseName} - ${universityName} | ${SITE_NAME}`;
  const desc = `Explore all subjects for ${semesterName} in ${courseName} at ${universityName}. Access study materials, PDFs, notes, assignments, and exam papers for each subject.`;

  return {
    title,
    description: desc,
    keywords: [...COMMON_KEYWORDS, universityName, courseName, semesterName, 'subjects', 'subject list'].join(', '),
    openGraph: {
      type: 'website',
      title,
      description: desc,
      siteName: SITE_NAME,
    },
  };
}

/**
 * Generate metadata for PDFs page (subject materials)
 */
export function generatePDFsMetadata(
  universityName: string,
  courseName: string,
  semesterName: string,
  subjectName: string,
  subjectDescription?: string
): Metadata {
  const title = `${subjectName} Study Materials - ${semesterName} - ${courseName} | ${SITE_NAME}`;
  const desc = `Download ${subjectName} PDFs, notes, assignments, and previous year papers for ${semesterName} in ${courseName} at ${universityName}. ${subjectDescription || ''} AI-powered PDF analysis available.`;

  return {
    title,
    description: desc,
    keywords: [
      ...COMMON_KEYWORDS,
      universityName,
      courseName,
      semesterName,
      subjectName,
      `${subjectName} notes`,
      `${subjectName} PDF`,
      `${subjectName} papers`,
      `${subjectName} important questions`,
    ].join(', '),
    openGraph: {
      type: 'website',
      title,
      description: desc,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    },
  };
}

/**
 * Generate metadata for admin pages (no-index)
 */
export function generateAdminMetadata(pageName: string): Metadata {
  return {
    title: `Admin - ${pageName} | ${SITE_NAME}`,
    description: 'Admin dashboard - restricted area',
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}
