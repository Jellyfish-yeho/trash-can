import type {Metadata} from "next";
import {Geist} from "next/font/google";
import "./globals.css";
import {OpacityProvider} from "@/app/context/OpacityContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "⋆⁺₊⋆ ⋆⁺₊⋆ ❤ ⋆⁺₊⋆ ⋆⁺₊⋆",
    description: "하루의 이야기를 공유하고 공감해보세요",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
        <OpacityProvider>
            {children}
        </OpacityProvider>
        </body>
        </html>
    );
}
