'use client';

function AdminPanel() {
  const stats = [
    { label: 'Total Teachers', value: '156', change: '+15%' },
    { label: 'Total Students', value: '12,450', change: '+22%' },
    { label: 'Platform GMV', value: '₹4.5L', change: '+18%' },
    { label: 'Active Sessions', value: '45', change: '+5%' },
  ];

  const tenants = [
    {
      id: '1',
      name: 'Sharma Physics',
      slug: 'sharma-physics',
      status: 'active',
      students: 1200,
      revenue: 45000,
    },
    {
      id: '2',
      name: 'Chemistry Hub',
      slug: 'chem-hub',
      status: 'active',
      students: 800,
      revenue: 32000,
    },
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
          <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Platform Admin</h1>
          <nav style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
              Dashboard
            </a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>
              Tenants
            </a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>
              Revenue
            </a>
            <a href="#" style={{ color: 'var(--text-secondary)' }}>
              Settings
            </a>
          </nav>
        </div>
      </header>

      <main style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
          Platform Overview
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

        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>All Tenants</h2>
        <div
          style={{
            backgroundColor: 'var(--background-surface)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th
                  style={{
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    padding: '12px',
                    fontWeight: '500',
                    fontSize: '13px',
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    padding: '12px',
                    fontWeight: '500',
                    fontSize: '13px',
                  }}
                >
                  Slug
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    padding: '12px',
                    fontWeight: '500',
                    fontSize: '13px',
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    color: 'var(--text-secondary)',
                    padding: '12px',
                    fontWeight: '500',
                    fontSize: '13px',
                  }}
                >
                  Students
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    color: 'var(--text-secondary)',
                    padding: '12px',
                    fontWeight: '500',
                    fontSize: '13px',
                  }}
                >
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ color: 'var(--text-primary)', padding: '12px', fontWeight: '500' }}>
                    {tenant.name}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', padding: '12px' }}>{tenant.slug}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--accent-teal)',
                        color: 'var(--background-base)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-primary)', textAlign: 'right', padding: '12px' }}>
                    {tenant.students.toLocaleString()}
                  </td>
                  <td
                    style={{
                      color: 'var(--primary)',
                      textAlign: 'right',
                      padding: '12px',
                      fontWeight: '600',
                    }}
                  >
                    ₹{tenant.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return <AdminPanel />;
}
