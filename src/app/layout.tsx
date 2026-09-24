import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pickle",
  description: "Hangisini seçerdin? Eleme usulü turnuva quizleri oluştur ve oyna.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
