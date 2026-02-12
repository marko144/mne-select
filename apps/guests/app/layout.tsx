import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MNE Select',
  description: 'Discover and book amazing experiences in Montenegro',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
