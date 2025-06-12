import {
  Anta,
  Poppins,
  Roboto,
  Montserrat,
  Raleway,
  Lato,
} from 'next/font/google';

import Header from '../components/shared/Header';
import './global.css';
import { ThemeProvider } from '../providers/theme-provider';
import { FloatingThemeToggle } from '../components/shared/FloatingThemeToggle';
import { Pointer } from '../components/ui/Pointer';

export const metadata = {
  title: 'Welcome to E-Commerce',
  description:
    'The E-Commerce App is a web application that allows users to buy and sell products online and sellers to manage their online stores.',
};

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

const anta = Anta({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anta',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-roboto',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});
const raleway = Raleway({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-raleway',
});
const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
  variable: '--font-lato',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${anta.variable} ${roboto.variable} ${montserrat.variable} ${raleway.variable} ${lato.variable} bg-primary-foreground text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* <Pointer className="fill-tertiary dark:stroke-orange-200" /> */}

          <Header />
          {children}
          <FloatingThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
