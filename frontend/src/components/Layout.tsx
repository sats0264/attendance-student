import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)] w-full overflow-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 mt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
