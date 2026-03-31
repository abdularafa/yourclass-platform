'use client';

import { useTenant } from '../lib/tenant-context';

function TeacherDashboard() {
  const { tenant, branding, isTenantMode } = useTenant();

  if (!isTenantMode) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Teacher Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          This is the teacher dashboard for {branding.appName}
        </p>
      </div>
    );
  }

  const stats = [
    { label: 'Total Students', value: '1,234', change: '+12%' },
    { label: 'Revenue', value: '₹45,000', change: '+8%' },
    { label: 'Courses', value: '12', change: '+2' },
    { label: 'Live Sessions', value: '5', change: '0' },
  ];

  const courses = [
    { id: '1', title: 'Physics Masterclass', students: 450, revenue: 22500, status: 'published' },
    { id: '2', title: 'Chemistry Complete', students: 320, revenue: 12800, status: 'published' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      <header
        style={{
          backgroundColor: 'var(--background-surface)',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={branding.appName} style={{ height: '40px' }} />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: branding.primaryColor,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}
              >
                {branding.appName.charAt(0)}
              </div>
            )}
            <span style={{ fontSize: '20px', fontWeight: '600' }}>{branding.appName}</span>
          </div>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
              Dashboard
            </a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>
              Courses
            </a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>
              Students
            </a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>
              Analytics
            </a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>
              Settings
            </a>
          </nav>
        </div>
      </header>

      <main style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Dashboard</h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {stats.map(stat => (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'var(--background-surface)',
                borderRadius: '10px',
                padding: '20px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
                {stat.label}
              </p>
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '24px',
                  fontWeight: '700',
                  fontFamily: 'JetBrains Mono',
                }}
              >
                {stat.value}
              </p>
              <span style={{ color: 'var(--accent-teal)', fontSize: '12px' }}>{stat.change}</span>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Your Courses</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          {courses.map(course => (
            <div
              key={course.id}
              style={{
                backgroundColor: 'var(--background-surface)',
                borderRadius: '10px',
                padding: '20px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    fontWeight: '600',
                    marginBottom: '4px',
                  }}
                >
                  {course.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {course.students} students
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--primary)', fontSize: '15px', fontWeight: '600' }}>
                  ₹{course.revenue}
                </p>
                <span style={{ color: 'var(--accent-teal)', fontSize: '12px' }}>
                  {course.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function TeacherDashboardPage() {
  return <TeacherDashboard />;
}
