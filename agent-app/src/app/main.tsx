import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('找不到 #root 元素')

try {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (e) {
  rootEl.innerHTML = `<div style="padding:2rem;font-family:system-ui"><h2>启动失败</h2><pre>${e}</pre></div>`
  console.error(e)
}
