import React from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherDashboard() {
  const router = useRouter();
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
    <div style={{ backgroundColor: '#0D0D0F', minHeight: '100vh', padding: '24px' }}>
      <h1 style={{ color: '#F0F0F5', fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
        Dashboard
      </h1>

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
              backgroundColor: '#141417',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid #2A2A32',
            }}
          >
            <p style={{ color: '#8A8A9A', fontSize: '13px', marginBottom: '8px' }}>{stat.label}</p>
            <p
              style={{
                color: '#F0F0F5',
                fontSize: '24px',
                fontWeight: '700',
                fontFamily: 'JetBrains Mono',
              }}
            >
              {stat.value}
            </p>
            <span style={{ color: '#00D4A8', fontSize: '12px' }}>{stat.change}</span>
          </div>
        ))}
      </div>

      <h2 style={{ color: '#F0F0F5', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Your Courses
      </h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        {courses.map(course => (
          <div
            key={course.id}
            style={{
              backgroundColor: '#141417',
              borderRadius: '10px',
              padding: '20px',
              border: '1px solid #2A2A32',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3
                style={{
                  color: '#F0F0F5',
                  fontSize: '15px',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}
              >
                {course.title}
              </h3>
              <p style={{ color: '#8A8A9A', fontSize: '13px' }}>{course.students} students</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#7B5CF0', fontSize: '15px', fontWeight: '600' }}>
                ₹{course.revenue}
              </p>
              <span style={{ color: '#00D4A8', fontSize: '12px' }}>{course.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
