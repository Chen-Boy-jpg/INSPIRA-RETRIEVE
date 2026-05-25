import React from 'react';

const IntentTags = ({ tags }) => {
  if (!tags) return null;
  
  return (
    <div className="flex flex-wrap gap-3 py-6">
      {tags.map((tag, index) => (
        <button 
          key={index}
          className="flex items-center gap-2 rounded-md bg-gray-50 px-4 py-2 text-xs font-mono text-gray-600 hover:bg-black hover:text-white transition-all border border-gray-100 group"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-white transition-colors"></span>
          {tag}
        </button>
      ))}
    </div>
  );
};

export default IntentTags;