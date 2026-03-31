'use client';

import { useState } from 'react';
import { TenantProvider } from './lib/tenant-context';

function LandingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    appName: '',
    slug: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      console.log('Submitting:', formData);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '20px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
            YourClass
          </h1>
          <a href="/admin" style={{ color: 'var(--text-secondary)' }}>
            Admin Login
          </a>
        </div>
      </header>

      <main>
        <section style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="container">
            <h2
              style={{
                fontSize: '48px',
                fontWeight: '700',
                marginBottom: '16px',
                lineHeight: '1.2',
              }}
            >
              Create Your Own
              <br />
              <span style={{ color: 'var(--primary)' }}>Branded Learning App</span>
            </h2>
            <p
              style={{
                fontSize: '18px',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                margin: '0 auto 32px',
              }}
            >
              Launch your personalized education platform in minutes. Your students download YOUR
              app with YOUR brand — not a generic marketplace.
            </p>
            <button
              className="btn btn-primary"
              style={{ fontSize: '16px', padding: '0 32px' }}
              onClick={() =>
                document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Start Free Trial
            </button>
          </div>
        </section>

        <section
          id="features"
          style={{ padding: '80px 0', backgroundColor: 'var(--background-surface)' }}
        >
          <div className="container">
            <h3 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '48px' }}>
              Everything You Need
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              {[
                { title: 'Your Own App', desc: 'Students see YOUR logo, YOUR colors, YOUR brand' },
                { title: 'Live Classes', desc: 'Interactive sessions with up to 300 students' },
                { title: 'Video Courses', desc: 'Upload & stream with HLS adaptive playback' },
                { title: 'Tests & Assessments', desc: 'MCQ tests with instant results' },
                { title: 'Payment Processing', desc: 'Accept payments directly to your account' },
                { title: 'Student Analytics', desc: 'Track progress, engagement, and revenue' },
              ].map(f => (
                <div key={f.title} className="card">
                  <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{f.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="signup" style={{ padding: '80px 0' }}>
          <div className="container" style={{ maxWidth: '500px' }}>
            <div className="card">
              <h3 style={{ fontSize: '24px', marginBottom: '24px', textAlign: 'center' }}>
                {step === 1 && 'Create Your Account'}
                {step === 2 && 'Name Your App'}
                {step === 3 && 'Ready to Launch'}
              </h3>

              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        className="input"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="input"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                        App Name
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g., Sharma Sir Physics"
                        value={formData.appName}
                        onChange={e => {
                          const slug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, '-')
                            .replace(/-+/g, '-');
                          setFormData({ ...formData, appName: e.target.value, slug });
                        }}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                        Your URL
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: 'var(--background-base)',
                          borderRadius: '6px',
                          padding: '0 12px',
                        }}
                      >
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formData.slug || 'yourapp'}.yourclass.com
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                      Your app will be created at:
                      <br />
                      <strong style={{ color: 'var(--primary)' }}>
                        {formData.slug}.yourclass.com
                      </strong>
                    </p>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  {step < 3 ? 'Continue' : 'Create My App'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{
          padding: '40px 0',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          © 2025 YourClass. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <TenantProvider>
      <LandingPage />
    </TenantProvider>
  );
}
