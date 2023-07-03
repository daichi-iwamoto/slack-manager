import Link from 'next/link'
import './globals.scss'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Slack Manager',
  description: 'fukurou labo slack manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={inter.className}>
      <body>
        <header>
          <h1>
            Slack Manager
          </h1>
        </header>
        <nav>
          <ul>
            <li>
              <Link href="/">
                <p>
                  <span>メンショングループの管理</span>
                </p>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="contents">
          {children}
        </div>
      </body>
    </html>
  )
}
