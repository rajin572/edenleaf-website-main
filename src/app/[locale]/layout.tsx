import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Playfair_Display, Mina, Roboto, Noto_Sans_Bengali } from "next/font/google";
import { Toaster } from "sonner";
import "../globals.css";
import LenisSmoothScroll from "@/components/ui/animation/LenisSmoothScroll";
import { getSiteUrl } from "@/helpers/config/envConfig";
import { LOCALES, OG_LOCALES, isLocale } from "@/i18n/config";
import { getDictionaryFor } from "@/i18n/dictionaries";
import { DictionaryProvider } from "@/components/i18n/DictionaryProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mina = Mina({
  variable: "--font-mina",
  subsets: ["bengali", "latin"],
  weight: ["400", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
});

type LocaleParams = { params: Promise<{ locale: string }> };

/** Prerender both language trees. */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionaryFor(locale);
  const title = `${dict.meta.siteName} — ${dict.meta.tagline}`;

  return {
    // Resolves every relative canonical/OG url the pages below declare.
    metadataBase: new URL(getSiteUrl()),
    title: { default: title, template: `%s | ${dict.meta.siteName}` },
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      // Tells search engines these are the same page in two languages.
      languages: Object.fromEntries(LOCALES.map((code) => [code, `/${code}`])),
    },
    openGraph: {
      type: "website",
      siteName: dict.meta.siteName,
      locale: OG_LOCALES[locale],
      url: `/${locale}`,
      title,
      description: dict.meta.description,
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionaryFor(locale);

  return (
    <html
      lang={locale}
      className={`${playfair.variable} ${mina.variable} ${roboto.variable} ${notoSansBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {/* Inside <body>: it renders a real wrapper element, and nothing but
            <head>/<body> may sit directly under <html>. */}
        <LenisSmoothScroll />
        {/* Seeds translations for Client Components; server ones use getDictionary(). */}
        <DictionaryProvider dict={dict} locale={locale}>
          {children}
        </DictionaryProvider>
        {/* tryCatchWrapper drives every mutation toast through sonner. */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
