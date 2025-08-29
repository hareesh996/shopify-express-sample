import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CustomerWidget from './Customer.tsx'

createRoot(document.getElementById('custom-widget-section')!).render(
  <StrictMode>
    <CustomerWidget />
  </StrictMode>,
)
