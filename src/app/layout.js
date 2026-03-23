import "./globals.css";
import MuiProvider from "../components/MuiProvider";

export const metadata = {
  title: "InstaFlow - Instagram Automation Platform",
  description: "Automate Instagram comment replies and DMs to grow your business on autopilot.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "InstaFlow - Instagram Automation Platform",
    description: "Automate Instagram comment replies and DMs to grow your business on autopilot.",
    siteName: "InstaFlow",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
