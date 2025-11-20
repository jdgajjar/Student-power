import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import University from '@/lib/db/models/University';
import Course from '@/lib/db/models/Course';
import Semester from '@/lib/db/models/Semester';
import Subject from '@/lib/db/models/Subject';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://student-power.vercel.app';

/**
 * Dynamic sitemap API route
 * This generates a sitemap at runtime with all database content
 * Access at: /api/sitemap-dynamic
 */
export async function GET() {
  try {
    await dbConnect();

    const urls: Array<{
      loc: string;
      lastmod: string;
      changefreq: string;
      priority: number;
    }> = [];

    // Add static pages
    urls.push({
      loc: BASE_URL,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    });

    urls.push({
      loc: `${BASE_URL}/universities`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    });

    // Fetch all universities
    const universities = await University.find({}).lean();

    for (const university of universities) {
      // Add university page
      urls.push({
        loc: `${BASE_URL}/universities/${university.slug}`,
        lastmod: university.updatedAt?.toISOString() || new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      });

      // Add courses page
      urls.push({
        loc: `${BASE_URL}/universities/${university.slug}/courses`,
        lastmod: university.updatedAt?.toISOString() || new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      });

      // Fetch courses for this university
      const courses = await Course.find({ universityId: university._id }).lean();

      for (const course of courses) {
        // Add semesters page
        urls.push({
          loc: `${BASE_URL}/universities/${university.slug}/courses/${course.slug}/semesters`,
          lastmod: course.updatedAt?.toISOString() || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6,
        });

        // Fetch semesters for this course
        const semesters = await Semester.find({ courseId: course._id }).lean();

        for (const semester of semesters) {
          // Add subjects page
          urls.push({
            loc: `${BASE_URL}/universities/${university.slug}/courses/${course.slug}/semesters/${semester.slug}/subjects`,
            lastmod: semester.updatedAt?.toISOString() || new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.5,
          });

          // Fetch subjects for this semester
          const subjects = await Subject.find({ semesterId: semester._id }).lean();

          for (const subject of subjects) {
            // Add PDFs page
            urls.push({
              loc: `${BASE_URL}/universities/${university.slug}/courses/${course.slug}/semesters/${semester.slug}/subjects/${subject.slug}/pdfs`,
              lastmod: subject.updatedAt?.toISOString() || new Date().toISOString(),
              changefreq: 'weekly',
              priority: 0.7,
            });
          }
        }
      }
    }

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}
