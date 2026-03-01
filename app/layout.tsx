import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ระบบวิเคราะห์การเลือกตั้งไทย | Election Simulator Pro',
  description: 'ระบบวิเคราะห์และจำลองสถานการณ์การเลือกตั้งไทย รวมผลการเลือกตั้ง 2566 และ 2569 พร้อม Monte Carlo Simulation',
  keywords: 'เลือกตั้ง, ประชาธิปัตย์, เพื่อไทย, ประชาชน, จำลองสถานการณ์, วิเคราะห์',
  authors: [{ name: 'Election Simulator Pro' }],
  openGraph: {
    title: 'ระบบวิเคราะห์การเลือกตั้งไทย',
    description: 'จำลองและวิเคราะห์ผลการเลือกตั้งไทย 2566 & 2569',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased">
        {children}
      </body>
    </html>
  )
}
