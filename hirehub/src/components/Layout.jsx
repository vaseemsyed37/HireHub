import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from './Spinner';

const Layout = ({ children, user, onSignOut, loading }) => { 
  return (
    <div className="flex flex-col min-h-screen bg-[#E9E9E9]">
      <Header user={user} onSignOut={onSignOut} /> 
      <AnimatePresence>
        <motion.main 
          className="flex-grow" 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
        >
           {loading && (
        <div className="fullscreen-spinner">
          <Spinner />
        </div>
      )}
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default Layout;
