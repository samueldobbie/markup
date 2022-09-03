import "../styles/globals.css"
import type { AppProps } from "next/app"

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <h1>Some nav bar</h1>
      <Component {...pageProps} />
    </>
  )
}

export default App
