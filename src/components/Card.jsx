import React from 'react';

const InspirationCard = ({ image, title, category }) => {
  return (
    <div className="group cursor-pointer space-y-3">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 shadow-sm">
        <img 
          src={image} 
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
      </div>

      {/* Info Section */}
      <div className="flex items-center justify-between px-1">
        <div className="overflow-hidden">
          <h3 className="truncate text-lg font-medium text-gray-900 transition-colors group-hover:text-indigo-600">
            {title}
          </h3>
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
            {category}
          </p>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-black transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InspirationCard;