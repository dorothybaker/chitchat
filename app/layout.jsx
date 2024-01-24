import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({ subsets: ["latin"], weight: "400" });

export const metadata = {
  title: "ChitChat",
  description: "Where all chatters meet",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <link
        rel="shortcut icon"
        href="https://www.svgrepo.com/show/530377/chat-chat.svg"
        type="image/x-icon"
      />
      <body className={poppins.className}>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
