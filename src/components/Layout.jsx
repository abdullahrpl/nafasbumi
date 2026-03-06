import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, hideNavbarAndFooter = false }) {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo(0, 0);
    }, [pathname]);

    if (hideNavbarAndFooter) {
        return (
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">{children}</main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-24 pb-8">{children}</main>
            <Footer />
        </div>
    );
}
