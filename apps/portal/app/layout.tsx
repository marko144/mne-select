import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MNE Select - Portal',
  description: 'Business portal for managing your presence on MNE Select',
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
