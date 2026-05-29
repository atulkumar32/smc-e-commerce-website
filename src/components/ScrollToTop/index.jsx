import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Watches the pathname and scrolls the window to the top
 * on every route change. Place this once inside <BrowserRouter>.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null; // renders nothing
}

export default ScrollToTop;
