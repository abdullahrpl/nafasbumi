import React from 'react';
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

export default function Tentang() {
    const chartData = {
        labels: ['2020', '2021', '2022', '2023', '2024'],
        datasets: [{
            label: 'Pohon Tertanam',
            data: [1200, 2500, 4800, 8200, 15000],
            borderColor: '#2E5339',
            backgroundColor: 'rgba(46, 83, 57, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 4,
            pointRadius: 6,
            pointBackgroundColor: '#2E5339'
        }, {
            label: 'Sampah Terkelola (kg)',
            data: [5000, 12000, 28000, 45000, 75000],
            borderColor: '#4D7BF3',
            backgroundColor: 'rgba(77, 123, 243, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 4,
            pointRadius: 6,
            pointBackgroundColor: '#4D7BF3'
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { font: { family: "'Poppins', sans-serif", weight: '600' }, padding: 20 } }
        },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    return (
        <>
            <section className="container mx-auto px-6 pt-10 pb-16 text-center max-w-5xl">
                <h2 className="text-nb-orange font-bold uppercase tracking-widest text-sm mb-4">Mengenal Kami</h2>
                <h1 className="text-[clamp(3rem,8vw,6rem)] leading-none -tracking-[0.04em] font-black text-nb-dark font-display mb-8">
                    Memberi <span className="text-nb-green">Napas Baru</span> <br />Bagi Planet Bumi
                </h1>
                <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto">
                    Nafasbumi adalah gerakan kolektif yang percaya bahwa setiap tindakan kecil memiliki kekuatan
                    untuk menciptakan perubahan besar bagi masa depan kita.
                </p>
            </section>

            <div className="container mx-auto px-6 pb-24 space-y-32 max-w-6xl">
                <section className="animate-[fade-in-up_0.8s_ease-out_forwards]">
                    <div className="grid md:grid-cols-2 gap-16 items-center bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100">
                        <div className="order-2 md:order-1">
                            <h2 className="text-4xl font-black text-nb-dark font-display mb-6 tracking-tight">Siapa Kami?</h2>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed mb-6">
                                Nafasbumi lahir dari keprihatinan mendalam terhadap kondisi bumi yang semakin rapuh.
                                Kami adalah ekosistem individu, komunitas, dan mitra yang berdedikasi untuk
                                memulihkan keseimbangan alam.
                            </p>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed">
                                Fokus kami adalah mengubah pola pikir dari eksploitatif menjadi restoratif.
                                Kami percaya bahwa setiap orang memiliki peran untuk menjadi penjaga bumi.
                            </p>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="rounded-[30px] overflow-hidden shadow-xl aspect-square md:aspect-auto md:h-[400px]">
                                <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Tim Nafasbumi" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="animate-[fade-in-up_0.8s_ease-out_forwards]">
                    <div className="grid md:grid-cols-2 gap-16 items-center bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100">
                        <div>
                            <div className="rounded-[30px] overflow-hidden shadow-xl aspect-square md:aspect-auto md:h-[400px]">
                                <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Sejarah Nafasbumi" className="w-full h-full object-cover animate-[float_6s_ease-in-out_infinite]" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black text-nb-dark font-display mb-6 tracking-tight">Sejarah Kami</h2>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed mb-6">
                                Dimulai pada 2018 dari diskusi kecil di kedai kopi. Kegelisahan sekelompok anak muda
                                berubah menjadi aksi nyata: membersihkan sungai lokal yang tercemar.
                            </p>
                            <p className="text-gray-500 text-lg font-medium leading-relaxed">
                                Kini, Nafasbumi tumbuh menjadi gerakan nasional dengan ribuan relawan.
                                Setiap langkah adalah bukti bahwa kepedulian itu menular dan mampu menggerakkan
                                perubahan.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-nb-dark rounded-[40px] p-12 md:p-20 text-white relative overflow-hidden animate-[fade-in-up_0.8s_ease-out_forwards]">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-nb-green/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-black font-display tracking-tight mb-4">Visi & Misi</h2>
                            <p className="text-gray-400 font-medium text-lg">Komitmen kami untuk masa depan yang lebih hijau.</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                                <h3 className="text-2xl font-black font-display tracking-tight mb-4 text-nb-orange">Visi Kami</h3>
                                <p className="text-lg leading-relaxed font-medium text-gray-300">
                                    Mewujudkan ekosistem bumi yang lestari dan seimbang, di mana setiap napas kehidupan dihargai dan dilindungi.
                                </p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                                <h3 className="text-2xl font-black font-display tracking-tight mb-4 text-nb-green">Misi Kami</h3>
                                <ul className="space-y-4 font-medium text-gray-300">
                                    <li className="flex items-start">
                                        <span className="text-nb-green mr-3 mt-1 text-xl">●</span> Mengedukasi masyarakat tentang gaya hidup hijau.
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-nb-green mr-3 mt-1 text-xl">●</span> Mendukung restorasi lingkungan yang berdampak.
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-nb-green mr-3 mt-1 text-xl">●</span> Mendorong inovasi solusi berkelanjutan.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-[40px] p-12 md:p-16 border border-gray-100 shadow-sm animate-[fade-in-up_0.8s_ease-out_forwards]">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-black text-nb-dark font-display tracking-tight mb-6">Dampak Nyata</h2>
                        <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg">
                            Data adalah bukti nyata dari gerakan kita. Kami mengukur setiap langkah untuk memastikan
                            perubahan yang kita buat benar-benar berarti.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-8 md:p-12 rounded-[30px] border border-gray-100">
                        <div className="h-[400px] w-full">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </section>

                <section className="animate-[fade-in-up_0.8s_ease-out_forwards]">
                    <h2 className="text-5xl font-black text-nb-dark font-display mb-12 text-center tracking-tight">Nilai-Nilai Inti</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white p-10 rounded-[30px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 bg-nb-green/10 text-nb-green rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🤝</div>
                            <h3 className="text-2xl font-black text-nb-dark font-display tracking-tight mb-3">Kolaborasi</h3>
                            <p className="text-gray-500 font-medium text-sm">Perubahan besar hanya bisa dicapai melalui kerja sama yang erat dan inklusif.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[30px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 bg-nb-blue/10 text-nb-blue rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🛡️</div>
                            <h3 className="text-2xl font-black text-nb-dark font-display tracking-tight mb-3">Integritas</h3>
                            <p className="text-gray-500 font-medium text-sm">Kami bertindak dengan jujur, transparan, dan akuntabel dalam setiap langkah.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[30px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 bg-nb-orange/10 text-nb-orange rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
                            <h3 className="text-2xl font-black text-nb-dark font-display tracking-tight mb-3">Berbasis Aksi</h3>
                            <p className="text-gray-500 font-medium text-sm">Kami tidak hanya berbicara, tetapi melakukan tindakan nyata yang berdampak.</p>
                        </div>
                        <div className="bg-white p-10 rounded-[30px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group">
                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🌱</div>
                            <h3 className="text-2xl font-black text-nb-dark font-display tracking-tight mb-3">Pemberdayaan</h3>
                            <p className="text-gray-500 font-medium text-sm">Kami memberdayakan individu untuk menjadi agen perubahan di lingkungannya.</p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
