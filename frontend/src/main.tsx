import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Signup } from './components/auth/Signup';
import { Login } from './components/auth/Login';
import { AddMoneyToWallet } from './components/AddMoneyToWallet';
import { P2PTransfer } from './components/P2PTransfer/P2PTransfer';
import { Dashboard } from './components/Dashboard';
import { Home } from './components/Home/Home';


const router = createBrowserRouter([
  {
    path: '/',
    // element: <Layout />,
    children: [
      {
        path: '/',
         element: <Home />
      }
    ]
  },
  {
    path: '/dashboard',
    element: <Dashboard/>
  },
  {
    path: '/signup',
    element: <Signup/>
  },
  {
  
    path: '/login',
    element: <Login/>
  },
  {
  
    path: '/addtowallet',
    element: <AddMoneyToWallet/>
  },{
    path: '/p2ptransfer',
    element: <P2PTransfer/>
  }, 
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
