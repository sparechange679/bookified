import type {Metadata} from "next";
import {IBM_Plex_Serif, Mona_Sans} from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import React from "react";
import {ClerkProvider} from "@clerk/nextjs";

const ibmPlexSerif = IBM_Plex_Serif({
    variable: '--font-ibm-plex-serif',
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap'
});

const monaSans = Mona_Sans({
    variable: '--font-mona-sans',
    subsets: ['latin'],
    display: 'swap'
})

export const metadata: Metadata = {
    title: "Bookified",
    description: "Transform your books into interactive AI conversations. Upload PDFs, and chat with your books using voice.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
            <body
                className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans antialiased`}
            >
            <Navbar/>
            {children}
            </body>
            </html>
        </ClerkProvider>
    );
}
