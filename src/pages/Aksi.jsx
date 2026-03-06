import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';

export default function Aksi() {
    const [topicInput, setTopicInput] = useState('');
    const [planResult, setPlanResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const GENERATIVE_AI_API_KEY = "AIzaSyBfYiI-UGHmltQFqo_uo40qRlCuLZcApJc";

    const handleGeneratePlan = async () => {
        if (!topicInput.trim()) return;
        setLoading(true);
        setPlanResult('');
        setError('');

        const prompt = `Buatkan rencana aksi lingkungan untuk topik: "${topicInput}". Berikan langkah praktis. Gunakan Bahasa Indonesia. Format Markdown dengan bold dan list.`;
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GENERATIVE_AI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            });
            const data = await res.json();
            const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (resultText) {
                setPlanResult(marked.parse(resultText));
            } else {
                throw new Error("No text");
            }
        } catch (e) {
            setError("Gagal menganalisis. Silakan coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="container mx-auto px-6 pt-10 pb-16 text-center max-w-5xl border-b border-gray-200/50 mb-16">
                <h2 className="text-nb-orange font-bold uppercase tracking-widest text-sm mb-4">Gerakan Kita</h2>
                <h1 className="text-[clamp(3rem,8vw,6rem)] leading-none -tracking-[0.04em] font-black text-nb-dark font-display mb-8">
                    Mulai <span className="text-nb-green">Aksi Nyata</span> <br />Untuk Bumi
                </h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto pb-10">
                    Nafasbumi percaya bahwa penjagaan lingkungan hidup harus disuarakan bersama-sama dengan
                    lebih lantang. Bergabunglah dalam gerakan nyata sekarang.
                </p>
            </section>

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid md:grid-cols-3 gap-8 mb-32">
                    <div className="bg-white rounded-[30px] p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">✍️</div>
                        <h3 className="text-2xl font-black text-nb-dark font-display tracking-tight mb-4 group-hover:text-nb-orange transition-colors">Bersuara Lewat Petisi</h3>
                        <p className="text-gray-500 font-medium mb-10 flex-grow">Dukunganmu menjadi faktor keberhasilan kampanye perlindungan lingkungan yang kami lakukan.</p>
                        <button className="bg-gray-50 text-nb-dark px-8 py-4 rounded-xl font-bold hover:bg-nb-orange hover:text-white transition-colors w-full border border-gray-200 hover:border-transparent mt-auto shadow-sm">Lihat Petisi</button>
                    </div>

                    <div className="bg-nb-green rounded-[30px] p-10 shadow-xl group flex flex-col hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">🤝</div>
                        <h3 className="relative z-10 text-2xl font-black text-white font-display tracking-tight mb-4">Menjadi Relawan</h3>
                        <p className="relative z-10 text-white/80 font-medium mb-10 flex-grow">Setiap aksimu bisa membuat perubahan positif dalam upaya menyelamatkan bumi dari krisis iklim.</p>
                        <Link to="/daftar-volunteer" className="relative z-10 bg-nb-orange text-white text-center px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-nb-dark transition-colors w-full shadow-lg shadow-nb-orange/20 mt-auto">Daftar Volunteer</Link>
                    </div>

                    <div className="bg-nb-blue rounded-[30px] p-10 shadow-xl group flex flex-col hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                        <div className="relative z-10 w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">💰</div>
                        <h3 className="relative z-10 text-2xl font-black text-white font-display tracking-tight mb-4">Donasi Lingkungan</h3>
                        <p className="relative z-10 text-white/80 font-medium mb-10 flex-grow">Kampanye kami dibiayai 100% oleh donatur individual agar tetap independen dan murni.</p>
                        <a href="https://forms.gle/7ihXz8gV9WV83QVW8" target="_blank" rel="noreferrer" className="relative z-10 bg-white text-nb-blue text-center px-8 py-4 rounded-xl font-bold hover:bg-nb-dark hover:text-white transition-colors w-full mt-auto shadow-sm">Donasi Sekarang</a>
                    </div>
                </div>

                {/* AI Zone */}
                <div className="bg-white rounded-[40px] shadow-sm overflow-hidden mb-20 border border-gray-100 flex flex-col lg:flex-row">
                    <div className="p-12 md:p-16 lg:w-1/2 flex flex-col justify-center">
                        <span className="inline-block bg-nb-green/10 text-nb-green px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 w-max border border-nb-green/20">PERSONAL PLANNER</span>
                        <h2 className="text-4xl md:text-5xl font-black text-nb-dark font-display tracking-tight mb-6">
                            Zona <span className="text-nb-green">Aksi</span> AI
                        </h2>
                        <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed">
                            Bingung mulai dari mana? Tulis topik yang kamu pedulikan,
                            dan biarkan AI menyusun rencana langkah demi langkah untuk kamu.
                        </p>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGeneratePlan()}
                                className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-nb-green/10 focus:border-nb-green outline-none transition-all font-medium text-lg placeholder:text-gray-400"
                                placeholder="Contoh: Mengurangi sampah plastik di rumah"
                            />
                            <button
                                onClick={handleGeneratePlan}
                                disabled={loading || !topicInput.trim()}
                                className="w-full bg-nb-dark text-white p-5 rounded-full font-black text-xl hover:bg-nb-green transition-all shadow-xl shadow-nb-dark/20 flex items-center justify-center disabled:opacity-50 group">
                                GENERATE PLAN
                                <svg className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="bg-nb-gray p-12 md:p-16 lg:w-1/2 flex items-center justify-center border-l border-gray-100 relative overflow-hidden min-h-[400px]">
                        <div className="absolute inset-0 bg-white/40 blur-3xl"></div>

                        {!planResult && !loading && !error && (
                            <div className="text-center text-gray-400 relative z-10 w-full flex flex-col items-center">
                                <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                    <svg className="w-12 h-12 text-nb-green/50" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                    </svg>
                                </div>
                                <p className="font-black text-xl tracking-tight uppercase">Rencana Aksi Akan</p>
                                <p className="font-black text-xl tracking-tight uppercase">Muncul Di Sini</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center relative z-10 w-full">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-nb-green mb-3"></div>
                                <span className="text-sm font-bold text-gray-400 tracking-wider uppercase">Menyusun Rencana...</span>
                            </div>
                        )}

                        {error && (
                            <p className="text-red-500 font-bold relative z-10 w-full text-center">{error}</p>
                        )}

                        {planResult && !loading && (
                            <div
                                dangerouslySetInnerHTML={{ __html: planResult }}
                                className="relative z-10 bg-white rounded-[30px] p-8 md:p-10 shadow-xl max-h-[500px] overflow-y-auto w-full border border-gray-100 prose prose-nb-green"
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
