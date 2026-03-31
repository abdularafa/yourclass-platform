import './globals.css';
import { TenantProvider } from './lib/tenant-context';

export const metadata = {
  title: 'YourClass - Create Your Teaching App',
  description: 'Launch your own branded education app in minutes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TenantProvider>{children}</TenantProvider>
      </body>
    </html>
  );
}
