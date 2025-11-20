import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Import models
import University from '../lib/db/models/University';
import Course from '../lib/db/models/Course';
import Semester from '../lib/db/models/Semester';
import Subject from '../lib/db/models/Subject';
import PDF from '../lib/db/models/PDF';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Removing old data...');
    await PDF.deleteMany({});
    await Subject.deleteMany({});
    await Semester.deleteMany({});
    await Course.deleteMany({});
    await University.deleteMany({});
    console.log('✅ Old data removed');

    // Create Universities
    console.log('🎓 Creating universities...');
    const universities = await University.insertMany([
      {
        name: 'Massachusetts Institute of Technology',
        description: 'MIT is a world-renowned research university known for innovation in science, technology, and engineering.',
        location: 'Cambridge, Massachusetts, USA',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg',
      },
      {
        name: 'Stanford University',
        description: 'Stanford is a leading research university with seven schools, known for entrepreneurship and innovation.',
        location: 'Stanford, California, USA',
        logo: 'https://identity.stanford.edu/wp-content/uploads/sites/3/2020/06/block-s-right.png',
      },
      {
        name: 'University of California, Berkeley',
        description: 'UC Berkeley is a public research university known for academic excellence and social activism.',
        location: 'Berkeley, California, USA',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Seal_of_University_of_California%2C_Berkeley.svg',
      },
      {
        name: 'Carnegie Mellon University',
        description: 'CMU is a private research university known for its programs in computer science, robotics, and business.',
        location: 'Pittsburgh, Pennsylvania, USA',
        logo: 'https://www.cmu.edu/brand/brand-guidelines/images/seal-600x600-min.jpg',
      },
    ]);
    console.log(`✅ Created ${universities.length} universities`);

    // Create Courses for each university
    console.log('📚 Creating courses...');
    const courses = [];
    
    // MIT Courses
    courses.push(
      await Course.create({
        universityId: universities[0]._id,
        name: 'Computer Science',
        code: 'CS',
        description: 'Study algorithms, data structures, artificial intelligence, and software engineering.',
        duration: '4 years',
      }),
      await Course.create({
        universityId: universities[0]._id,
        name: 'Electrical Engineering',
        code: 'EE',
        description: 'Focus on circuits, signals, systems, and electronic devices.',
        duration: '4 years',
      }),
      await Course.create({
        universityId: universities[0]._id,
        name: 'Mechanical Engineering',
        code: 'ME',
        description: 'Learn about mechanics, thermodynamics, and design engineering.',
        duration: '4 years',
      })
    );

    // Stanford Courses
    courses.push(
      await Course.create({
        universityId: universities[1]._id,
        name: 'Computer Science',
        code: 'CS',
        description: 'Comprehensive CS program covering AI, HCI, systems, and theory.',
        duration: '4 years',
      }),
      await Course.create({
        universityId: universities[1]._id,
        name: 'Business Administration',
        code: 'MBA',
        description: 'Top-ranked MBA program focusing on leadership and innovation.',
        duration: '2 years',
      })
    );

    // UC Berkeley Courses
    courses.push(
      await Course.create({
        universityId: universities[2]._id,
        name: 'Computer Science',
        code: 'EECS',
        description: 'Combined program in electrical engineering and computer sciences.',
        duration: '4 years',
      }),
      await Course.create({
        universityId: universities[2]._id,
        name: 'Data Science',
        code: 'DS',
        description: 'Interdisciplinary program combining statistics, computing, and domain expertise.',
        duration: '4 years',
      })
    );

    // CMU Courses
    courses.push(
      await Course.create({
        universityId: universities[3]._id,
        name: 'Computer Science',
        code: 'SCS',
        description: 'World-class CS program with strengths in AI, robotics, and software engineering.',
        duration: '4 years',
      }),
      await Course.create({
        universityId: universities[3]._id,
        name: 'Robotics',
        code: 'RI',
        description: 'Pioneering robotics program covering perception, cognition, and action.',
        duration: '4 years',
      })
    );

    console.log(`✅ Created ${courses.length} courses`);

    // Create Semesters for CS courses
    console.log('📅 Creating semesters...');
    const semesters = [];
    const csCourses = courses.filter(c => c.name === 'Computer Science');
    
    for (const course of csCourses) {
      for (let i = 1; i <= 8; i++) {
        semesters.push(
          await Semester.create({
            courseId: course._id,
            name: `Semester ${i}`,
            number: i,
          })
        );
      }
    }
    console.log(`✅ Created ${semesters.length} semesters`);

    // Create Subjects for semesters
    console.log('📖 Creating subjects...');
    const subjects = [];
    
    // Semester 1 subjects (common across universities)
    const sem1Subjects = [
      { name: 'Introduction to Programming', code: 'CS101', description: 'Learn programming fundamentals using Python' },
      { name: 'Calculus I', code: 'MATH101', description: 'Differential calculus and applications' },
      { name: 'Physics I', code: 'PHYS101', description: 'Mechanics and thermodynamics' },
      { name: 'English Composition', code: 'ENG101', description: 'Academic writing and communication' },
    ];

    // Semester 2 subjects
    const sem2Subjects = [
      { name: 'Data Structures', code: 'CS102', description: 'Arrays, linked lists, trees, and graphs' },
      { name: 'Calculus II', code: 'MATH102', description: 'Integral calculus and sequences' },
      { name: 'Physics II', code: 'PHYS102', description: 'Electricity and magnetism' },
      { name: 'Discrete Mathematics', code: 'MATH201', description: 'Logic, sets, and combinatorics' },
    ];

    // Semester 3 subjects
    const sem3Subjects = [
      { name: 'Algorithms', code: 'CS201', description: 'Algorithm design and analysis' },
      { name: 'Computer Architecture', code: 'CS202', description: 'Digital logic and computer organization' },
      { name: 'Linear Algebra', code: 'MATH203', description: 'Matrices, vectors, and linear transformations' },
      { name: 'Probability and Statistics', code: 'MATH204', description: 'Probability theory and statistical methods' },
    ];

    // Semester 4 subjects
    const sem4Subjects = [
      { name: 'Operating Systems', code: 'CS301', description: 'Process management, memory, and file systems' },
      { name: 'Database Systems', code: 'CS302', description: 'Relational databases, SQL, and data modeling' },
      { name: 'Web Development', code: 'CS303', description: 'HTML, CSS, JavaScript, and web frameworks' },
      { name: 'Software Engineering', code: 'CS304', description: 'SDLC, design patterns, and agile methods' },
    ];

    // Semester 5 subjects
    const sem5Subjects = [
      { name: 'Artificial Intelligence', code: 'CS401', description: 'AI fundamentals, search, and machine learning' },
      { name: 'Computer Networks', code: 'CS402', description: 'Network protocols, TCP/IP, and internet' },
      { name: 'Theory of Computation', code: 'CS403', description: 'Automata, computability, and complexity' },
      { name: 'Computer Graphics', code: 'CS404', description: '2D/3D graphics, rendering, and animation' },
    ];

    // Semester 6 subjects
    const sem6Subjects = [
      { name: 'Machine Learning', code: 'CS501', description: 'Supervised and unsupervised learning algorithms' },
      { name: 'Distributed Systems', code: 'CS502', description: 'Distributed computing, consensus, and cloud' },
      { name: 'Cybersecurity', code: 'CS503', description: 'Cryptography, network security, and ethical hacking' },
      { name: 'Mobile App Development', code: 'CS504', description: 'iOS and Android application development' },
    ];

    // Semester 7 subjects
    const sem7Subjects = [
      { name: 'Deep Learning', code: 'CS601', description: 'Neural networks, CNNs, RNNs, and transformers' },
      { name: 'Cloud Computing', code: 'CS602', description: 'AWS, Azure, microservices, and DevOps' },
      { name: 'Blockchain Technology', code: 'CS603', description: 'Cryptocurrencies, smart contracts, and DApps' },
      { name: 'Research Methods', code: 'CS604', description: 'Scientific research and technical writing' },
    ];

    // Semester 8 subjects
    const sem8Subjects = [
      { name: 'Capstone Project I', code: 'CS701', description: 'First part of final year project' },
      { name: 'Advanced Topics in AI', code: 'CS702', description: 'Latest advances in artificial intelligence' },
      { name: 'Ethics in Technology', code: 'CS703', description: 'Ethical considerations in computing' },
      { name: 'Capstone Project II', code: 'CS704', description: 'Final project completion and presentation' },
    ];

    const subjectsBySemester = [
      sem1Subjects, sem2Subjects, sem3Subjects, sem4Subjects,
      sem5Subjects, sem6Subjects, sem7Subjects, sem8Subjects
    ];

    // Create subjects for each semester
    for (let semNum = 1; semNum <= 8; semNum++) {
      const semestersForNum = semesters.filter(s => s.number === semNum);
      const subjectsData = subjectsBySemester[semNum - 1];
      
      for (const semester of semestersForNum) {
        for (const subjectData of subjectsData) {
          subjects.push(
            await Subject.create({
              semesterId: semester._id,
              name: subjectData.name,
              code: subjectData.code,
              description: subjectData.description,
            })
          );
        }
      }
    }

    console.log(`✅ Created ${subjects.length} subjects`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Universities: ${universities.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Semesters: ${semesters.length}`);
    console.log(`   - Subjects: ${subjects.length}`);
    console.log('\n✨ Demo data is ready to use!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run the seed function
seedDatabase();
