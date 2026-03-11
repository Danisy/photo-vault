import { Inter, Playfair_Display, Courier_Prime } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "800"], style: ["normal", "italic"], variable: "--font-playfair" });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-courier" });

export const metadata = {
  title: "zcollection",
  description: "A curated archive of visual memories.",
  icons: {
    icon: "/zc_favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.variable} ${playfair.variable} ${courier.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
