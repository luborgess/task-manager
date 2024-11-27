import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { AuthProvider } from '../auth-system'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}
