import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes/AppRoutes';
import { CartProvider } from './context/CartContext';
import ScrollToTop from './components/ScrollToTop';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
