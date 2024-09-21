import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import Logo from '@/app/ui/logo';

export const metadata: Metadata = {
  title: {
    template: '%s | Mr. Fitness Coach',
    default: 'Mr. Fitness Coach',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased h-screen flex flex-col`}>
        <Logo />

        {children}
      </body>
    </html>
  );
}
