'use client';

import { useTenant } from '../../lib/tenant-context';
import { useState } from 'react';

function StudentAppView() {
  const { tenant, branding, isTenantMode, isLoading } = useTenant();
  const [phone, setPhone] = useState('');

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!isTenantMode || !tenant) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p>Teacher not found</p>
      </div>
    );
  }

  const courses = [
    { id: '1', title: 'Physics Fundamentals', price: 499, students: 450, thumbnail: null },
    { id: '2', title: 'Chemistry Basics', price: 399, students: 320, thumbnail: null },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      <header style={{ backgroundColor: branding.primaryColor, padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {tenant.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={branding.appName}
              style={{ height: '36px', borderRadius: '8px' }}
            />
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: 'white',
              }}
            >
              {branding.appName.charAt(0)}
            </div>
          )}
          <span style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
            {branding.appName}
          </span>
        </div>
      </header>

      <main style={{ padding: '16px' }}>
        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
            Featured Courses
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {courses.map(course => (
              <div
                key={course.id}
                style={{
                  backgroundColor: 'var(--background-surface)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    height: '120px',
                    backgroundColor: 'var(--background-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-disabled)' }}>Course Thumbnail</span>
                </div>
                <div style={{ padding: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                    {course.title}
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{ fontSize: '18px', fontWeight: '700', color: branding.primaryColor }}
                    >
                      ₹{course.price}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {course.students} students
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Login</h2>
          <div
            style={{
              backgroundColor: 'var(--background-surface)',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <input
              type="tel"
              className="input"
              placeholder="Enter phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ marginBottom: '12px' }}
            />
            <button
              className="btn btn-primary"
              style={{ width: '100%', backgroundColor: branding.primaryColor }}
            >
              Send OTP
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function TeacherStudentView() {
  return <StudentAppView />;
}
