import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './routes/AppRoutes';
import { CartProvider } from './context/CartContext';
import { CartDrawerProvider } from './context/CartDrawerContext';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <CartProvider>
          <CartDrawerProvider>
            <ScrollToTop />
            <BackToTop />
            <AppRoutes />
            <CartDrawer />
            <ToastContainer
              position="top-right"
              autoClose={2600}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              pauseOnFocusLoss
              draggable
              limit={3}
              theme="light"
            />
          </CartDrawerProvider>
        </CartProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
