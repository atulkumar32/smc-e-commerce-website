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
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
