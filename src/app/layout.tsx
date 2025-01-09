import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Reddit Clone',
    description: 'A Reddit clone built with Next.js',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body>
        <main className="min-h-screen bg-gray-100">
            {children}
        </main>
        </body>
        </html>
    )
}