import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PlotWize — Planning Intelligence for London",
  description:
    "Know your planning risk before you commit. Evidence-based planning risk scores for UK property developers and architects.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        
        <Script

          id="cloudflare-web-analytics"

          src="https://static.cloudflareinsights.com/beacon.min.js"

          type="module"

          data-cf-beacon='{"token":"024331c28aef4983a5a3eb103deb25d8"}'

          strategy="afterInteractive"

        />
      </body>
    </html>
  );
}
