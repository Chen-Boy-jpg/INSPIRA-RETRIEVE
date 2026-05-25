import React from 'react';

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo & Links */}
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-bold tracking-tighter text-black cursor-pointer">INSPIRA</h1>
          <div className="hidden gap-8 md:flex">
            <a href="#" className="text-sm font-medium text-gray-900 border-b-2 border-black pb-1">Explore</a>
            <a href="#" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">My Collections</a>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex flex-1 max-w-md mx-12">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search inspiration..." 
              className="w-full rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-6">
          <button className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-all active:scale-95">
            Upload
          </button>
          <div className="flex items-center gap-4 text-gray-500 text-xl">
            <button className="hover:text-black">
              <span className="material-icons">notifications_none</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 cursor-pointer">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="Profile" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;