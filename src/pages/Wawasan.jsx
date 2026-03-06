import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Wawasan() {
    const [news, setNews] = useState([]);
    const [loadingNews, setLoadingNews] = useState(true);
    const [topicInput, setTopicInput] = useState('');
    const [aiResult, setAiResult] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    const [aiError, setAiError] = useState('');

    const GENERATIVE_AI_API_KEY = "AIzaSyBfYiI-UGHmltQFqo_uo40qRlCuLZcApJc";

    useEffect(() => {
        const fetchAndFilterNews = async () => {
            try {
                const response = await fetch('https://berita-indo-api-next.vercel.app/api/cnn-news/nasional');
                const data = await response.json();
                if (data.success && data.data && data.data.posts) {
                    const allArticles = data.data.posts;
                    const keywords = ["lingkungan", "alam", "hutan", "laut", "iklim", "cuaca", "polusi", "sampah", "konservasi", "energi terbarukan", "satwa", "bumi", "ekosistem", "lestari", "banjir", "longsor", "emisi", "deforestasi", "gempa"];

                    let filteredArticles = allArticles.filter(artikel => {
                        const titleLower = artikel.title.toLowerCase();
                        return keywords.some(keyword => titleLower.includes(keyword));
                    });

                    if (filteredArticles.length < 3) filteredArticles = allArticles;
                    setNews(filteredArticles.slice(0, 6));
                }
            } catch (e) {
                console.error("Gagal mengambil berita.", e);
            } finally {
                setLoadingNews(false);
            }
        };
        fetchAndFilterNews();
    }, []);

    const handleExploreTopic = async () => {
        if (!topicInput.trim()) return;
        setLoadingAi(true);
        setAiResult('');
        setAiError('');

        const prompt = `Jelaskan topik lingkungan ini: "${topicInput}". Berikan penjelasan yang ringkas dan padat. Gunakan Indonesia. Format dalam Markdown dengan heading, bold, dan bullet points.`;
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GENERATIVE_AI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            });
            const data = await res.json();
            const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (resultText) {
                setAiResult(marked.parse(resultText));
            } else {
                throw new Error("No text");
            }
        } catch (e) {
            setAiError("Gagal menganalisis. Silakan coba lagi nanti.");
        } finally {
            setLoadingAi(false);
        }
    };

    const chartData = {
        labels: ["2020", "2021", "2022", "2023", "2024", "2025 (Est)"],
        datasets: [
            {
                label: "Sampah Plastik",
                data: [480, 510, 550, 540, 580, 620],
                borderColor: "#FF8A5B",
                backgroundColor: "rgba(255, 138, 91, 0.1)",
                fill: true, tension: 0.4, borderWidth: 4, pointRadius: 6, pointBackgroundColor: "#FF8A5B"
            },
            {
                label: "Sampah Organik",
                data: [350, 360, 340, 370, 350, 380],
                borderColor: "#2E5339",
                backgroundColor: "rgba(46, 83, 57, 0.1)",
                fill: true, tension: 0.4, borderWidth: 4, pointRadius: 6, pointBackgroundColor: "#2E5339"
            }
        ],
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { family: "'Poppins', sans-serif", weight: 'bold', size: 14 } } } },
        scales: {
            y: { grid: { display: false }, ticks: { font: { family: "'Poppins', sans-serif" } } },
            x: { grid: { display: false }, ticks: { font: { family: "'Poppins', sans-serif" } } }
        }
    };

    return (
        <>
            {/* Hero Section */}
            <section className="container mx-auto px-6 pt-10 pb-16 text-center max-w-5xl">
                <h2 className="text-nb-orange font-bold uppercase tracking-widest text-sm mb-4">Ruang Literasi Alam</h2>
                <h1 className="text-[clamp(3rem,8vw,6rem)] leading-none -tracking-[0.04em] font-black text-nb-dark font-display mb-8">
                    Galeri <span className="text-nb-green">Wawasan</span>
                </h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto">
                    Jelajahi kumpulan artikel, analisis mendalam, dan berita terkini
                    seputar isu lingkungan di Indonesia dan dunia.
                </p>
            </section>

            {/* Berita Section */}
            <section className="py-16">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loadingNews ? (
                            <div className="md:col-span-3 py-20 flex flex-col items-center justify-center text-gray-400">
                                <div className="w-12 h-12 border-4 border-gray-200 border-t-nb-green rounded-full animate-spin mb-4"></div>
                                <p className="font-bold">Memuat berita Nusantara...</p>
                            </div>
                        ) : news.length > 0 ? (
                            news.map((berita, idx) => (
                                <a key={idx} href={berita.link} target="_blank" rel="noreferrer" className="block bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group">
                                    <div className="h-56 relative overflow-hidden bg-gray-100">
                                        <img src={berita.thumbnail || 'https://placehold.co/600x400/2E5339/FFFFFF?text=NafasBumi'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => { e.target.src = 'https://placehold.co/600x400/2E5339/FFFFFF?text=NafasBumi'; }} />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-nb-dark text-xs font-bold px-3 py-1.5 rounded-full">
                                            {new Date(berita.pubDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="p-8 flex flex-col h-full">
                                        <h3 className="text-xl font-black text-nb-dark font-display leading-snug mb-3 group-hover:text-nb-green transition-colors line-clamp-2">{berita.title}</h3>
                                        <p className="text-gray-500 text-sm font-medium line-clamp-3 mb-6">{berita.description || ''}</p>
                                        <div className="flex items-center text-nb-green font-bold text-sm mt-auto">
                                            Baca Selengkapnya
                                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                        </div>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <p className="md:col-span-3 text-center text-red-500 font-bold py-10">TIDAK DAPAT MEMUAT BERITA.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* AI Explorer & Chart Section */}
            <section className="py-24">
                <div className="container mx-auto px-6 max-w-7xl">

                    {/* AI Explorer */}
                    <div className="bg-white rounded-[40px] shadow-sm overflow-hidden mb-20 border border-gray-100 flex flex-col lg:flex-row">
                        <div className="p-12 md:p-16 lg:w-1/2 flex flex-col justify-center">
                            <span className="inline-block bg-nb-orange/10 text-nb-orange px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 w-max border border-nb-orange/20">AI EXPLORER</span>
                            <h2 className="text-4xl md:text-5xl font-black text-nb-dark font-display tracking-tight mb-6">
                                Jelajahi Topik <span className="text-nb-green">Lingkungan</span>
                            </h2>
                            <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed">
                                Punya pertanyaan tentang isu lingkungan? Tanyakan di sini dan dapatkan penjelasan cerdas dari AI kami.
                            </p>

                            <div className="space-y-4">
                                <textarea
                                    value={topicInput}
                                    onChange={(e) => setTopicInput(e.target.value)}
                                    className="w-full p-6 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-4 focus:ring-nb-green/10 focus:border-nb-green outline-none transition-all font-medium text-lg placeholder:text-gray-400"
                                    rows="3"
                                    placeholder="Contoh: Apa itu jejak karbon dan bagaimana cara menguranginya?">
                                </textarea>
                                <button
                                    onClick={handleExploreTopic}
                                    disabled={loadingAi || !topicInput.trim()}
                                    className="w-full bg-nb-dark text-white p-5 rounded-full font-black text-xl hover:bg-nb-green transition-all shadow-xl shadow-nb-dark/20 flex items-center justify-center disabled:opacity-50 group">
                                    EXPLORE NOW
                                    <svg className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="bg-nb-gray p-12 md:p-16 lg:w-1/2 flex items-center justify-center border-l border-gray-100 relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/40 blur-3xl"></div>

                            {!aiResult && !loadingAi && !aiError && (
                                <div className="text-center text-gray-400 relative z-10">
                                    <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                        <svg className="w-12 h-12 text-nb-green/50" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                                        </svg>
                                    </div>
                                    <p className="font-black text-xl tracking-tight uppercase">Hasil akan muncul di sini</p>
                                </div>
                            )}

                            {loadingAi && (
                                <div className="flex flex-col items-center mt-10 relative z-10">
                                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-nb-green mb-3"></div>
                                    <span className="text-sm font-bold text-gray-400 tracking-wider uppercase">Menganalisis...</span>
                                </div>
                            )}

                            {aiError && (
                                <p className="text-red-500 font-bold relative z-10">{aiError}</p>
                            )}

                            {aiResult && !loadingAi && (
                                <div
                                    dangerouslySetInnerHTML={{ __html: aiResult }}
                                    className="relative z-10 bg-white rounded-[30px] p-8 md:p-10 shadow-xl max-h-[500px] overflow-y-auto w-full border border-gray-100 prose prose-nb-green"
                                />
                            )}
                        </div>
                    </div>

                    {/* Data Visualization */}
                    <div className="bg-white p-12 md:p-20 rounded-[40px] shadow-sm border border-gray-100 text-center">
                        <span className="inline-block bg-nb-blue/10 text-nb-blue px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-nb-blue/20">DATA VISUALIZATION</span>
                        <h3 className="text-4xl md:text-5xl font-black text-nb-dark font-display tracking-tight mb-6 max-w-3xl mx-auto">
                            Tren Komposisi <span className="text-nb-orange">Sampah</span> Tahunan
                        </h3>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto mb-16">
                            Data estimasi volume sampah nasional berdasarkan proyeksi tren tahunan.
                            Membantu kita memahami skala tantangan yang kita hadapi.
                        </p>
                        <div className="h-[400px] w-full bg-gray-50 p-6 rounded-[30px] border border-gray-100">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
