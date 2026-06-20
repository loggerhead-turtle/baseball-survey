import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Practice Schedule Survey',
  description: 'Help schedule the best practice times for the baseball team',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8f9fb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
