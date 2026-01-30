import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-1" role="main" tabIndex="-1">
        <Outlet />
      </main>
      <footer className="bg-surface-900/80 border-t border-surface-700/50 py-6" role="contentinfo">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} HauaniTech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
