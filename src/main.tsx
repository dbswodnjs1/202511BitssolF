import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/index.css'

// index.html 의 <div id="root"></div>에 앱을 마운트
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
