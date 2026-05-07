import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'RedFlag — Find contradictions in your case files before opposing counsel does',
  description: 'Upload your litigation documents. RedFlag finds every contradiction, date conflict, and cross-reference inconsistency — cited to source.',
  openGraph: {
    title: 'RedFlag — Litigation File Intelligence',
    description: 'Find what opposing counsel will find — before they do.',
    url: 'https://redflag-ai.com',
    siteName: 'RedFlag',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}
