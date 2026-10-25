process.env.NODE_ENV = 'test';
import { startServer } from '../index.js';

let server: any;
import { config } from '../config/env.js';

const PORT = config.port;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

const makeRequest = async (
  endpoint: string,
  options: { method?: string; headers?: Record<string, string>; body?: any } = {}
) => {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
};

const runTests = async () => {
  console.log('\n========================================');
  console.log('RUNNING AUTOMATED TEST SUITE');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    server = await startServer();

    // 1. Health endpoint test
    const health = await makeRequest('/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'GET /api/health returns healthy');

    // 2. Real stats endpoint test
    const stats = await makeRequest('/stats');
    assert(stats.status === 200 && stats.data.stats.totalCourses >= 8, 'GET /api/stats returns accurate seeded course count');

    // 3. Public Course catalog
    const courses = await makeRequest('/courses');
    assert(courses.status === 200 && courses.data.courses.length > 0, 'GET /api/courses returns course catalog with pagination');

    // 4. Course search and filtering
    const searchResult = await makeRequest('/courses?q=React');
    assert(searchResult.status === 200 && searchResult.data.courses.some((c: any) => c.title.includes('React')), 'GET /api/courses?q=React filters correctly by keyword');

    // 5. Educational Resources Library
    const resources = await makeRequest('/resources');
    assert(resources.status === 200 && resources.data.resources.length >= 10, 'GET /api/resources returns library with >= 10 items');

    // 6. User Authentication: Student Login
    const studentLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'emma.watson@student.edu', password: 'Password@123' },
    });
    assert(studentLogin.status === 200 && !!studentLogin.data.token, 'POST /api/auth/login succeeds for student');
    const studentToken = studentLogin.data.token;

    // 7. Security: Student CANNOT access Instructor-only route
    const studentAccessInstructor = await makeRequest('/instructor/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentAccessInstructor.status === 403, 'Security: Student is forbidden (403) from accessing instructor dashboard');

    // 8. Security: Student CANNOT access Admin-only route
    const studentAccessAdmin = await makeRequest('/admin/dashboard', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentAccessAdmin.status === 403, 'Security: Student is forbidden (403) from accessing admin dashboard');

    // 9. Instructor Login & Access
    const instructorLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'alex.dev@oblivion.edu', password: 'Password@123' },
    });
    assert(instructorLogin.status === 200 && !!instructorLogin.data.token, 'POST /api/auth/login succeeds for instructor');
    const instructorToken = instructorLogin.data.token;

    const instructorDashboard = await makeRequest('/instructor/dashboard', {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert(instructorDashboard.status === 200 && instructorDashboard.data.success, 'Instructor accesses instructor dashboard with statistics');

    // 10. Admin Login & Access
    const adminLogin = await makeRequest('/auth/login', {
      method: 'POST',
      body: { email: 'admin@oblivion.edu', password: 'Admin@123456' },
    });
    assert(adminLogin.status === 200 && !!adminLogin.data.token, 'POST /api/auth/login succeeds for administrator');
    const adminToken = adminLogin.data.token;

    const adminDashboard = await makeRequest('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminDashboard.status === 200 && adminDashboard.data.stats.totalUsers >= 5, 'Admin accesses admin dashboard with metrics');

    // 11. Public Certificate Verification Endpoint
    const certVerify = await makeRequest('/certificates/verify/CERT-DEMO-2026-EMMA99');
    assert(certVerify.status === 200 && certVerify.data.valid === true, 'GET /api/certificates/verify/:id returns authentic verification');

    // 12. Student Enrollments & Persistent Progress Retention
    const myEnrollments = await makeRequest('/enrollments/me', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const c1Enrollment = myEnrollments.data.enrollments.find((e: any) => e.progressPercentage === 100);
    assert(myEnrollments.status === 200 && !!c1Enrollment, 'Persistent Progress: Student enrollment retains verified 100% completion in database');

    console.log('\n----------------------------------------');
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('----------------------------------------\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
