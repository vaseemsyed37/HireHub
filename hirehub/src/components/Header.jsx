import React from 'react';
import { useAuth } from '../context/AuthContext'; 
import logo from '../images/logo.jpg';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="flex justify-between items-center py-2 px-8 bg-[#FFFFFF] shadow-md border-b border-[#EAEAEA]">
            <div className="flex items-center">
                <img 
                    src={logo} 
                    alt="HireHub Logo" 
                    className="h-14 mr-8 mix-blend-darken opacity-100 filter contrast-125" 
                />
                <nav className="space-x-6">
                    <a href="/" className="text-sm font-medium text-[#2B2B2B] hover:text-[#000000] border-b-2 border-transparent hover:border-black transition duration-200">Home</a>
                    <a href="/career" className="text-sm font-medium text-[#2B2B2B] hover:text-[#000000] border-b-2 border-transparent hover:border-black transition duration-200">Career Resources</a>
                    <a href="/salaries" className="text-sm font-medium text-[#2B2B2B] hover:text-[#000000] border-b-2 border-transparent hover:border-black transition duration-200">Salary Guide</a>
                </nav>
            </div>
            <div>
                {user ? (
                    <>
                        <span className="mr-4">Welcome, {user.name}</span> 
                        <button 
                            onClick={logout} 
                            className="bg-white text-black px-6 py-2 rounded-md ml-2 mr-2 hover:bg-[#E9E9E9] text-sm font-bold transition-all border border-black"
                        >
                            Log Out
                        </button>
                    </>
                ) : (
                    <a 
                        href="/signin" 
                        className="bg-white text-black px-6 py-2 rounded-md ml-2 mr-2 hover:bg-[#E9E9E9] text-sm font-bold transition-all border border-black"
                    >
                        Sign In
                    </a>
                )}
                <a 
                    href="/post-job" 
                    className="text-sm font-medium text-[#000000] hover:text-[#2B2B2B] border-b-2 border-transparent hover:border-black transition duration-200"
                >
                    Employers / Post Job
                </a>
            </div>
        </header>
    );
};

export default Header;
