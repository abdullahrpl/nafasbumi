import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsub();
    }, []);

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setIsModalOpen(false);
            window.location.href = '/forum';
        } catch (error) {
            console.error("Login gagal:", error);
            alert("Gagal login: " + error.message);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const navLinks = [
        { name: 'Beranda', path: '/' },
        { name: 'Wawasan', path: '/wawasan' },
        { name: 'Aksi', path: '/aksi' },
        { name: 'Tentang Kami', path: '/tentang' },
    ];

    return (
        <>
            <header id="main-header" className="fixed w-full top-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-nb-green rounded-xl flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform shadow-lg shadow-nb-green/20">
                            <img src="/images/logo-nb-fix.svg" alt="NB" className="w-6 h-6 invert brightness-0" />
                        </div>
                        <span className="text-2xl font-black text-nb-dark tracking-tighter font-display hidden sm:block">NafasBumi</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-10 text-nb-dark font-semibold">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`transition-colors ${location.pathname === link.path ? 'text-nb-green' : 'hover:text-nb-green'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center space-x-6">
                        <button onClick={() => setIsModalOpen(true)} className="text-gray-500 font-bold hover:text-nb-dark transition-colors flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            Forum
                        </button>
                        <Link to="/admin" className="text-gray-500 font-bold hover:text-nb-dark transition-colors">Admin</Link>
                        <a href="https://forms.gle/7ihXz8gV9WV83QVW8" target="_blank" rel="noreferrer"
                            className="bg-nb-dark text-white px-8 py-3 rounded-full font-bold hover:bg-nb-green transition-all shadow-lg hover:shadow-nb-green/30 transform hover:-translate-y-0.5">
                            Donasi
                        </a>
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-nb-dark p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </nav>

                {isMenuOpen && (
                    <div className="md:hidden bg-white px-6 py-8 border-t border-gray-100 shadow-2xl absolute w-full left-0">
                        <div className="flex flex-col space-y-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`text-2xl font-bold font-display tracking-tight hover:text-nb-dark ${location.pathname === link.path ? 'text-nb-green' : 'text-gray-400'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-gray-100 my-2"></div>
                            <button
                                onClick={() => { setIsMenuOpen(false); setIsModalOpen(true); }}
                                className="text-left text-xl font-bold text-gray-500 hover:text-nb-dark"
                            >
                                Forum Komunitas
                            </button>
                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-gray-500 hover:text-nb-dark">Admin</Link>
                            <a href="https://forms.gle/7ihXz8gV9WV83QVW8" target="_blank" rel="noreferrer" onClick={() => setIsMenuOpen(false)} className="text-center bg-nb-dark text-white px-6 py-4 rounded-full font-bold w-full text-lg shadow-lg">Donasi Sekarang</a>
                        </div>
                    </div>
                )}
            </header>

            {/* Login Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-300">
                    <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-md mx-auto overflow-hidden transform transition-all border border-gray-100">
                        <div className="relative bg-nb-green/5 pt-12 pb-8 px-8 text-center border-b border-gray-100">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <img src="/images/logo-nb-fix.svg" alt="Logo" className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-nb-dark font-display tracking-tight mb-2">Masuk Forum</h2>
                            <p className="text-gray-500 text-sm font-medium">Gunakan akun Google Anda untuk bergabung dalam diskusi komunitas.</p>

                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-nb-dark hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 pb-10">
                            <button disabled={isLoggingIn} onClick={handleGoogleLogin} className="w-full bg-white border-2 border-gray-200 text-nb-dark font-bold py-4 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-4 group disabled:opacity-50">
                                {isLoggingIn ? (
                                    <div className="w-6 h-6 border-2 border-nb-dark border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.657-3.657-11.303-8.333l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
                                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C41.38,36.151,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                                    </svg>
                                )}
                                Lanjutkan dengan Google
                            </button>
                            <p className="text-xs text-gray-400 mt-6 text-center font-medium">Bantu kami mewujudkan masa depan yang hijau.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
