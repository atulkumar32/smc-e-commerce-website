import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import RevealOnScroll from '../components/RevealOnScroll';

function StoreLayout() {
  return (
    <>
      <Header />
      <main>
        <RevealOnScroll />
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}

export default StoreLayout;
