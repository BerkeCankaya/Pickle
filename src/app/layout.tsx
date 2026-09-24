import type { Metadata, Viewport } from "next";
import { Rubik, Unbounded } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "latin-ext"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Pickle",
  description: "Hangisini seçerdin? Eleme usulü turnuva quizleri oluştur ve oyna.",
};

export const viewport: Viewport = {
  themeColor: "#090A0F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${unbounded.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
