import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const auth = useAuth();
  const user = auth?.user;
  
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Mobil menüyü kapat (geçiş sonrası)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await auth.logout();
    window.location.href = '/';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-900 shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <span className="flex items-center">
                <Image 
                  src="/logo.svg" 
                  alt="Website Builder Logo" 
                  width={32} 
                  height={32} 
                  className="mr-2"
                />
                <span className="text-white font-bold text-lg">Site Oluşturucu</span>
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-4">
        <Link href="/templates" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Şablonlar
        </Link>
        <Link href="/features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Özellikler
        </Link>
        <Link href="/pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Fiyatlar
        </Link>
        <Link href="/blog" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
          Blog
        </Link>
      </div>
    </div>
          {/* Authentication Actions */}
          <div className="hidden md:block">
            <div className="flex items-center">
              {user ? (
                <>
                  <Link href="/dashboard" className="px-4 py-1.5 text-white rounded-md mr-2 hover:bg-gray-700">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="px-4 py-1.5 text-white rounded-md mr-2 hover:bg-gray-700"
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Üye Ol
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Menüyü aç/kapat</span>
              {/* Menu open: "hidden", Menu closed: "block" */}
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Menu open: "block", Menu closed: "hidden" */}
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on isOpen state */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900">
          <Link href="/templates" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            Şablonlar
          </Link>
          <Link href="/features" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            Özellikler
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            Fiyatlar
          </Link>
          <Link href="/blog" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            Blog
          </Link>

          {/* Authentication Mobile Links */}
          <div className="pt-4 pb-3 border-t border-gray-700">
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-white hover:bg-red-700"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  Giriş Yap
                </Link>
                <Link href="/register" className="block px-3 py-2 mt-1 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 text-center py-3">
                  Üye Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;