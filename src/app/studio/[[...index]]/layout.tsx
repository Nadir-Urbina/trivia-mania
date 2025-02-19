export const metadata = {
  title: 'Trivia Mania Studio',
  description: 'Sanity Studio for Trivia Mania',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 