import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { webviewNoticePlugin } from './scripts/build/webviewNotice.js'

// https://vite.dev/config/
// webviewNoticePlugin: "please update Android System WebView" for engines older than the
// build target (D38) — a classic inline script in index.html, see scripts/build/webviewNotice.js.
export default defineConfig({
  plugins: [react(), webviewNoticePlugin()],
  server: {
    host: true,
    allowedHosts: true
  }
})
