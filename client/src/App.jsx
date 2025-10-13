import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/Home'
import ProductPage from './pages/Products'
import SupportPage from './pages/Support'
import PricingPage from './pages/Pricing'
import AboutPage from './pages/About'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Auth from './pages/Auth/Auth'
import DashboardLayout from './pages/Dashboard'
import RouteGuard from './components/RouteGuard'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/dashboard' &&
        location.pathname !== '/dashboard/orders' &&
        location.pathname !== '/dashboard/holdings' &&
        location.pathname !== '/dashboard/positions' &&
        location.pathname !== '/dashboard/funds' &&
        location.pathname !== '/dashboard/apps' && <Navbar />}

      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/products' element={<ProductPage />} />
        <Route path='/support' element={<SupportPage />} />
        <Route path='/pricing' element={<PricingPage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path="/auth" element={<RouteGuard element={<Auth />} />} />

   
        <Route path='/dashboard/*' element={<DashboardLayout />} />
      </Routes>

      <Footer />

      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  )
}

export default App
