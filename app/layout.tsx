import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
