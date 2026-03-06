import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndDisplayNews = async () => {
            try {
                const response = await fetch('https://berita-indo-api-next.vercel.app/api/cnn-news/nasional');
                const data = await response.json();
                if (data.success && data.data && data.data.posts) {
                    setNews(data.data.posts.slice(0, 3));
                }
            } catch (e) {
                console.error("Gagal memuat berita terkini");
            } finally {
                setLoading(false);
            }
        };
        fetchAndDisplayNews();
    }, []);

    return (
        <>
            {/* Modern Hero Section */}
            <section className="container mx-auto px-6 pt-10 pb-20 text-center relative max-w-6xl">
                {/* Floating Badges */}
                <div className="absolute top-10 left-[10%] animate-[float_6s_ease-in-out_infinite] hidden md:block z-10">
                    <div className="bg-nb-blue text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 border-2 border-white">
                        <span>💧</span> Jaga Sungai
                    </div>
                </div>
                <div className="absolute top-[20%] right-[15%] animate-[float_7s_ease-in-out_2s_infinite] hidden lg:block z-10">
                    <div className="bg-nb-green text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 border-2 border-white">
                        <span>🌳</span> Tanam Pohon
                    </div>
                </div>
                <div className="absolute bottom-[40%] left-[5%] animate-[float_8s_ease-in-out_4s_infinite] hidden lg:block z-10">
                    <div className="bg-nb-orange text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 border-2 border-white">
                        <span>♻️</span> Nol Sampah
                    </div>
                </div>

                {/* Main Typography */}
                <div className="max-w-4xl mx-auto mb-16 relative z-10">
                    <h1 className="text-[clamp(3rem,8vw,6.5rem)] leading-none -tracking-[0.04em] font-black text-nb-dark font-display mb-6">
                        Aksi nyata untuk <br />
                        <span className="text-nb-green">masa depan bumi.</span>
                    </h1>
                </div>

                {/* Overlapping Cards Container */}
                <div className="flex justify-center flex-wrap gap-4 mt-8 mb-20 w-full relative z-10">
                    <div className="w-[clamp(150px,20vw,240px)] aspect-[4/5] rounded-[20px] overflow-hidden shadow-2xl transition-all duration-500 relative transform hover:scale-105 hover:-translate-y-2 z-10 -rotate-6">
                        <img src="/images/Group2.png" alt="Aksi 1" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    <div className="w-[clamp(150px,20vw,280px)] aspect-[4/5] rounded-[20px] overflow-hidden shadow-2xl transition-all duration-500 relative transform hover:scale-105 hover:-translate-y-2 z-20 scale-110 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
                        <img src="/images/image.png" alt="Aksi 3" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white text-left">
                            <p className="font-bold text-sm bg-nb-green px-2 py-1 rounded inline-block mb-1">Berita Utama</p>
                            <p className="font-display font-black leading-tight">Penanaman<br />Mangrove Massal</p>
                        </div>
                    </div>
                    <div className="w-[clamp(150px,20vw,240px)] aspect-[4/5] rounded-[20px] overflow-hidden shadow-2xl transition-all duration-500 relative transform hover:scale-105 hover:-translate-y-2 z-10 rotate-6">
                        <img src="/images/NafasBumi-Sungai.jpg" alt="Aksi 4" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                </div>

                {/* Hero Subtext and CTA */}
                <div className="max-w-2xl mx-auto flex flex-col items-center">
                    <p className="text-gray-500 font-medium text-lg leading-relaxed mb-8">
                        Ribuan relawan telah bergabung. Temukan kampanye konservasi,
                        berdonasi untuk alam, dan jadilah pahlawan bagi bumi kita hari ini.
                    </p>
                    <div className="flex items-center gap-4 bg-white p-2 border border-gray-200 rounded-full shadow-lg">
                        <Link to="/daftar-volunteer" className="bg-nb-dark text-white px-8 py-3 rounded-full font-bold hover:bg-nb-green transition-colors text-sm md:text-base">
                            Gabung Relawan
                        </Link>
                        <Link to="/aksi" className="text-nb-dark font-bold px-6 py-3 hover:text-nb-green transition-colors text-sm md:text-base">
                            Eksplor Aksi &rarr;
                        </Link>
                    </div>
                </div>
            </section>

            {/* Dynamic News Section */}
            <section className="py-24 bg-white border-y border-gray-100">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl md:text-5xl font-black text-nb-dark font-display mb-4 tracking-tight">Kabar <span className="text-nb-green">Nusantara</span></h2>
                            <p className="text-gray-500 font-medium text-lg">Informasi dan perkembangan terbaru mengenai isu lingkungan hidup di Indonesia langsung dari CNN Nasional.</p>
                        </div>
                        <Link to="/wawasan" className="bg-gray-100 text-nb-dark px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm">
                            Lihat Semua Berita
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            <div className="md:col-span-3 py-20 flex flex-col items-center justify-center text-gray-400">
                                <div className="w-12 h-12 border-4 border-gray-200 border-t-nb-green rounded-full animate-spin mb-4"></div>
                                <p className="font-bold">Memuat berita terkini...</p>
                            </div>
                        ) : news.length > 0 ? (
                            news.map((berita, idx) => (
                                <a key={idx} href={berita.link} target="_blank" rel="noreferrer" className="block bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group">
                                    <div className="h-56 relative overflow-hidden bg-gray-100">
                                        <img src={berita.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-nb-dark text-xs font-bold px-3 py-1.5 rounded-full">
                                            {new Date(berita.pubDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="text-xl font-black text-nb-dark font-display leading-snug mb-3 group-hover:text-nb-green transition-colors line-clamp-2">{berita.title}</h3>
                                        <p className="text-gray-500 text-sm font-medium line-clamp-3 mb-6">{berita.description || ''}</p>
                                        <div className="flex items-center text-nb-green font-bold text-sm">
                                            Baca Selengkapnya
                                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </div>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <p className="md:col-span-3 text-center text-red-400 font-medium">Gagal memuat berita terkini.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="bg-nb-dark rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-nb-green/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-black text-white font-display mb-6 tracking-tight">Siap membuat <br /><span className="text-nb-green">perubahan nyata?</span></h2>
                            <p className="text-gray-400 font-medium text-lg md:text-xl mb-10 leading-relaxed">
                                Jangan hanya bersuara. Jadilah bagian dari komunitas kami dan wujudkan aksi pelestarian lingkungan di berbagai wilayah Indonesia.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <Link to="/daftar-anggota" className="w-full sm:w-auto bg-nb-green text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-nb-green transition-all shadow-xl hover:shadow-2xl text-lg">
                                    Daftar Komunitas
                                </Link>
                                <a href="https://forms.gle/7ihXz8gV9WV83QVW8" target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-white/10 text-white border border-white/20 px-10 py-4 rounded-full font-bold hover:bg-white/20 transition-all text-lg backdrop-blur-sm">
                                    Berdonasi
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
