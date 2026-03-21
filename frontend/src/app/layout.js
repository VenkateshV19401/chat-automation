import "./globals.css";
import MuiProvider from "../components/MuiProvider";

export const metadata = {
  title: "Insta Automation",
  description: "Instagram comment and DM automation dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MuiProvider>{children}</MuiProvider>
      </body>
    </html>
  );
}
