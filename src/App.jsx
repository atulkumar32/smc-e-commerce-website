import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './routes/AppRoutes';
import { CartProvider } from './context/CartContext';
import { CartDrawerProvider } from './context/CartDrawerContext';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <CartProvider>
          <CartDrawerProvider>
            <ScrollToTop />
            <AppRoutes />
            <CartDrawer />
            <ToastContainer
              position="top-right"
              autoClose={2800}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              pauseOnFocusLoss
              draggable
              theme="light"
              toastStyle={{
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '14px',
                borderRadius: '8px',
              }}
            />
          </CartDrawerProvider>
        </CartProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
