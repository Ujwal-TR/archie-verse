import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArchieVerse — Design Buildings in Your Browser",
  description: "Free, fast, browser-based 3D architectural modeling tool. Create building designs, floor plans, and walkthroughs without downloads. The SketchUp & Revit alternative for the web.",
  keywords: ["architecture", "3D modeling", "building design", "floor plan", "browser CAD", "SketchUp alternative", "Revit alternative", "free 3D modeler", "web architecture tool"],
  authors: [{ name: "ArchieVerse" }],
  openGraph: {
    title: "ArchieVerse — Design Buildings in Your Browser",
    description: "Free, fast, browser-based 3D architectural modeling tool. No downloads required.",
    type: "website",
    siteName: "ArchieVerse",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArchieVerse — Design Buildings in Your Browser",
    description: "Free, fast, browser-based 3D architectural modeling tool. No downloads required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
