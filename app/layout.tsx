import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "Daily Command Center | Michelle Burdex",
  description: "A faith-based digital productivity journal for nonprofit professionals.",
  robots:      "noindex, nofollow", // Private product — keep it off search engines
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Lora', Georgia, serif" }}>
        {children}
      </body>
    </html>
  );
}
