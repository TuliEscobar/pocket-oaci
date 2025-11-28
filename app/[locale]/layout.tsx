import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ReactNode } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'OACI.ai - OACI de Bolsillo',
  description: 'Conocimiento regulatorio instantáneo, preciso y citado.',
  icons: {
    icon: '/logo.png',
  },
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params
}: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <ClerkProvider
      localization={locale === 'es' ? {
        ...esES,
        signIn: {
          ...esES.signIn,
          start: {
            title: 'Accede a OACI.ai',
            subtitle: 'para continuar',
            actionText: '¿No tienes una cuenta?',
            actionLink: 'Regístrate',
          },
        },
        signUp: {
          ...esES.signUp,
          start: {
            title: 'Crea tu cuenta en OACI.ai',
            subtitle: 'para continuar',
            actionText: '¿Ya tienes una cuenta?',
            actionLink: 'Inicia sesión',
          },
        },
      } : {
        signIn: {
          start: {
            title: 'Sign in to OACI.ai',
            subtitle: 'to continue',
            actionText: "Don't have an account?",
            actionLink: 'Sign up',
          },
        },
        signUp: {
          start: {
            title: 'Create your OACI.ai account',
            subtitle: 'to continue',
            actionText: 'Already have an account?',
            actionLink: 'Sign in',
          },
        },
      }}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#06b6d4', // Cyan-500
          colorBackground: '#000000', // Black
          colorInputBackground: '#18181b', // Zinc-900
          colorInputText: '#ffffff', // White
          colorText: '#ffffff', // White
          colorTextSecondary: '#a1a1aa', // Zinc-400
          colorDanger: '#ef4444', // Red-500
          colorSuccess: '#10b981', // Green-500
          colorWarning: '#f59e0b', // Amber-500
          colorNeutral: '#71717a', // Zinc-500
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '1rem',
          borderRadius: '0.75rem', // Rounded-xl
        },
        elements: {
          // Main card styling
          card: 'bg-black border border-zinc-800 shadow-2xl shadow-cyan-500/10',

          // Header
          headerTitle: 'text-white font-bold text-2xl',
          headerSubtitle: 'text-zinc-400',

          // Form elements
          formButtonPrimary:
            'bg-zinc-800 hover:bg-zinc-700 text-white font-bold shadow-lg shadow-black/20 transition-all',

          formFieldInput:
            'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl',

          formFieldLabel: 'text-zinc-300 font-medium',

          // Footer
          footerActionText: 'text-zinc-400',
          footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-semibold',

          // Social buttons
          socialButtonsBlockButton:
            '!bg-cyan-500 hover:!bg-cyan-400 !border-transparent !text-white transition-all shadow-lg shadow-cyan-500/20 !h-14',

          socialButtonsBlockButtonText: '!text-white font-bold !text-lg',

          // Divider
          dividerLine: 'bg-zinc-800',
          dividerText: 'text-zinc-500',

          // Identity preview
          identityPreview: 'bg-zinc-900 border-zinc-800',
          identityPreviewText: 'text-white',
          identityPreviewEditButton: 'text-cyan-400 hover:text-cyan-300',

          // Form field errors
          formFieldErrorText: 'text-red-400',

          // Alert
          alert: 'bg-zinc-900 border-zinc-800 text-white',
          alertText: 'text-zinc-300',

          // Modal backdrop
          modalBackdrop: 'bg-black/80 backdrop-blur-sm',

          // Avatar
          avatarBox: 'border-2 border-cyan-500',

          // Buttons
          button: 'transition-all',

          // Links
          link: 'text-cyan-400 hover:text-cyan-300',
        },
      }}
    >
      <html lang={locale} className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
