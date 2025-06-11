import Header from '../components/shared/Header';
import './global.css';

export const metadata = {
  title: 'Welcome to E-Commerce',
  description:
    'The E-Commerce App is a web application that allows users to buy and sell products online and sellers to manage their online stores.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
