import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Kooli Forum',
    description: 'A Kooli Forum built with Next.js',
    icons: {
        icon: [
            { url: '/koolilogo.webp', type: 'image/webp' }
        ],
        shortcut: '/koolilogo.webp',
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className="bg-black min-h-screen text-white">
        <main>{children}</main>
        </body>
        </html>
    )
}
