export default function AdminDashboard() {
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
    <div style={{ backgroundColor: '#0D0D0F', minHeight: '100vh', padding: '24px' }}>
      <h1 style={{ color: '#F0F0F5', fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>
        Platform Admin
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
        All Tenants
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2A2A32' }}>
            <th style={{ textAlign: 'left', color: '#8A8A9A', padding: '12px', fontWeight: '500' }}>
              Name
            </th>
            <th style={{ textAlign: 'left', color: '#8A8A9A', padding: '12px', fontWeight: '500' }}>
              Slug
            </th>
            <th style={{ textAlign: 'left', color: '#8A8A9A', padding: '12px', fontWeight: '500' }}>
              Status
            </th>
            <th
              style={{ textAlign: 'right', color: '#8A8A9A', padding: '12px', fontWeight: '500' }}
            >
              Students
            </th>
            <th
              style={{ textAlign: 'right', color: '#8A8A9A', padding: '12px', fontWeight: '500' }}
            >
              Revenue
            </th>
          </tr>
        </thead>
        <tbody>
          {tenants.map(tenant => (
            <tr key={tenant.id} style={{ borderBottom: '1px solid #2A2A32' }}>
              <td style={{ color: '#F0F0F5', padding: '12px' }}>{tenant.name}</td>
              <td style={{ color: '#8A8A9A', padding: '12px' }}>{tenant.slug}</td>
              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    backgroundColor: '#00D4A8',
                    color: '#0D0D0F',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {tenant.status}
                </span>
              </td>
              <td style={{ color: '#F0F0F5', textAlign: 'right', padding: '12px' }}>
                {tenant.students}
              </td>
              <td
                style={{ color: '#7B5CF0', textAlign: 'right', padding: '12px', fontWeight: '600' }}
              >
                ₹{tenant.revenue}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
