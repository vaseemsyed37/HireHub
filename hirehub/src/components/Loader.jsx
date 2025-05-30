import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="spinner w-12 h-12 border-4 border-t-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;

