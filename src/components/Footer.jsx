import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-nb-dark text-white pt-24 pb-10">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-20">
                    <div className="col-span-1 md:col-span-5 lg:col-span-4 pl-0 lg:pl-4">
                        <Link to="/" className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-nb-green rounded-xl flex items-center justify-center">
                                <img src="/images/logo-nb-fix.svg" alt="NB" className="w-6 h-6 invert brightness-0" />
                            </div>
                            <span className="text-3xl font-black tracking-tighter font-display">NafasBumi</span>
                        </Link>
                        <p className="text-gray-400 font-medium leading-relaxed mb-8 pr-4">
                            Aksi nyata untuk melestarikan alam Indonesia. Berkolaborasi menjaga keindahan nusantara untuk generasi mendatang.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-nb-green hover:text-white transition-all text-xl border border-white/10">📸</a>
                            <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-nb-green hover:text-white transition-all text-xl border border-white/10">🐦</a>
                            <a href="#" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-nb-green hover:text-white transition-all text-xl border border-white/10">▶️</a>
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-3 lg:col-span-2 lg:col-start-7">
                        <h4 className="text-lg font-bold mb-6 font-display text-white">Navigasi</h4>
                        <ul className="space-y-4 font-medium text-gray-400">
                            <li><Link to="/" className="hover:text-nb-green transition-colors">Beranda</Link></li>
                            <li><Link to="/wawasan" className="hover:text-nb-green transition-colors">Wawasan</Link></li>
                            <li><Link to="/aksi" className="hover:text-nb-green transition-colors">Aksi</Link></li>
                            <li><Link to="/tentang" className="hover:text-nb-green transition-colors">Tentang Kami</Link></li>
                        </ul>
                    </div>

                    <div className="col-span-1 md:col-span-4 lg:col-span-3">
                        <h4 className="text-lg font-bold mb-6 font-display text-white">Aksi & Partisipasi</h4>
                        <ul className="space-y-4 font-medium text-gray-400">
                            <li><Link to="/daftar-volunteer" className="hover:text-nb-green transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-nb-orange"></span> Jadi Volunteer</Link></li>
                            <li><Link to="/daftar-anggota" className="hover:text-nb-green transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-nb-blue"></span> Gabung Komunitas</Link></li>
                            <li><a href="https://forms.gle/7ihXz8gV9WV83QVW8" target="_blank" rel="noreferrer" className="hover:text-nb-green transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-nb-green"></span> Donasi</a></li>
                            <li><Link to="/forum" className="hover:text-nb-green transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white"></span> Forum Diskusi</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 font-medium text-sm text-center md:text-left">
                        © {new Date().getFullYear()} NafasBumi. Dibuat dengan <span className="text-red-500">❤️</span> untuk Planet Bumi.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500">
                        <Link to="/admin" className="hover:text-white transition-colors">Admin Area</Link>
                        <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-white transition-colors">Syarat Ketentuan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
