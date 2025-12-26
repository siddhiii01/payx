import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router-dom';

//creates a routing configuration object., router instance
const router = createBrowserRouter([
  {
    path: '/',
    element: <h1>Home Page</h1>
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
