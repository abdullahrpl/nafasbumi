import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

export default function DaftarVolunteer() {
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [domicile, setDomicile] = useState('');
    const [institution, setInstitution] = useState('');
    const [eventName, setEventName] = useState('');
    const [reason, setReason] = useState('');
    const [events, setEvents] = useState([]);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '', visible: false });

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchEvents = async () => {
            try {
                const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    setEvents([{ id: '1', name: "Belum ada event tersedia" }]);
                    return;
                }
                setEvents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error loading events:", error);
                setEvents([{ id: '1', name: "Aksi Bersih Pantai" }]);
            }
        };
        fetchEvents();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast({ message: '', type: '', visible: false }), 3000);
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+\d{10,15}$/;
        const parsedAge = parseInt(age);

        if (!emailRegex.test(email)) newErrors.email = "Format email tidak valid.";
        if (!phoneRegex.test(whatsapp)) newErrors.whatsapp = "Gunakan format +62.";
        if (parsedAge < 15 || parsedAge > 50 || isNaN(parsedAge)) newErrors.age = "Umur harus antara 15-50 tahun.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast("Mohon perbaiki data yang salah (bertanda merah).", 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "registrations"), {
                type: 'Volunteer',
                fullName,
                age,
                email,
                whatsapp,
                domicile,
                institution,
                event: eventName,
                reason,
                createdAt: serverTimestamp()
            });
            setShowSuccessModal(true);
        } catch (error) {
            showToast("Error: " + error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 flex flex-col min-h-screen pt-24 pb-12 px-6 relative mt-[80px]">
            {/* Global Toaster */}
            <div className="fixed top-24 right-5 z-50 flex flex-col gap-2 pointer-events-none">
                {toast.visible && (
                    <div className={`${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[fade-in-up_0.3s_ease-out_forwards] border border-white/10`}>
                        <span className="font-semibold text-sm leading-tight">{toast.message}</span>
                    </div>
                )}
            </div>

            <section className="container mx-auto max-w-4xl">
                <div className="text-center mb-16 animate-[fade-in-up_0.3s_ease-out_forwards]">
                    <span className="text-nb-green font-black tracking-widest uppercase text-sm mb-4 block">Formulir Pendaftaran</span>
                    <h1 className="text-5xl md:text-6xl font-black text-nb-dark tracking-tighter font-display mb-6">Daftar Volunteer</h1>
                    <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">Satu langkah kecilmu berarti besar. Mari terjun langsung ke lapangan dan ciptakan perubahan nyata.</p>
                </div>

                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden md:flex border border-gray-100 relative animate-[fade-in-up_0.5s_ease-out_forwards]">
                    {/* Abstract decorative element */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-nb-green-light rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                    <div className="hidden md:flex md:w-5/12 bg-nb-dark relative items-center justify-center p-12 overflow-hidden">
                        <img src="/images/photo-1542601906990-b4d3fb778b09.jpeg" alt="Volunteer Actions" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
                        <div className="relative z-10 text-center text-white space-y-6">
                            <div className="w-20 h-20 bg-nb-orange/20 backdrop-blur-md rounded-2xl border border-nb-orange/40 flex items-center justify-center mx-auto mb-6 transform rotate-6">
                                <span className="text-4xl text-nb-orange">🙌</span>
                            </div>
                            <h3 className="text-4xl font-black font-display tracking-tight">Kekuatan Aksi Nyata</h3>
                            <p className="text-white/80 font-medium text-lg">Ribuan tangan telah bersatu demi lingkungan. Bergabunglah bersama kami di lapangan!</p>
                        </div>
                        {/* Decor */}
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                    </div>

                    <div className="w-full md:w-7/12 p-8 md:p-14 lg:p-16">
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                                        className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-nb-green/20 focus:border-nb-green outline-none transition-all font-medium"
                                        placeholder="Masukkan nama asli" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Umur (15-50)</label>
                                    <input type="number" value={age} onChange={e => { setAge(e.target.value); setErrors({ ...errors, age: null }) }} required min="15" max="50"
                                        className={`w-full px-5 py-4 text-base bg-gray-50 border rounded-2xl focus:ring-4 outline-none transition-all font-medium ${errors.age ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-nb-green/20 focus:border-nb-green'}`}
                                        placeholder="Contoh: 20" />
                                    {errors.age && <p className="text-red-500 text-xs mt-2 font-medium">{errors.age}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email</label>
                                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors({ ...errors, email: null }) }} required
                                    className={`w-full px-5 py-4 text-base bg-gray-50 border rounded-2xl focus:ring-4 outline-none transition-all font-medium ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-nb-green/20 focus:border-nb-green'}`}
                                    placeholder="nama@email.com" />
                                {errors.email && <p className="text-red-500 text-xs mt-2 font-medium">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nomor WhatsApp</label>
                                    <input type="tel" value={whatsapp} onChange={e => { setWhatsapp(e.target.value); setErrors({ ...errors, whatsapp: null }) }} required
                                        className={`w-full px-5 py-4 text-base bg-gray-50 border rounded-2xl focus:ring-4 outline-none transition-all font-medium ${errors.whatsapp ? 'border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:ring-nb-green/20 focus:border-nb-green'}`}
                                        placeholder="+62812xxxx" />
                                    {errors.whatsapp && <p className="text-red-500 text-xs mt-2 font-medium">{errors.whatsapp}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Kota Domisili</label>
                                    <input type="text" value={domicile} onChange={e => setDomicile(e.target.value)} required
                                        className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-nb-green/20 focus:border-nb-green outline-none transition-all font-medium"
                                        placeholder="Contoh: Surabaya" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Asal Instansi / Sekolah</label>
                                <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} required
                                    className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-nb-green/20 focus:border-nb-green outline-none transition-all font-medium"
                                    placeholder="Contoh: Universitas Indonesia / Umum" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Event Kegiatan</label>
                                <div className="relative">
                                    <select value={eventName} onChange={e => setEventName(e.target.value)} required
                                        className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-nb-green/20 focus:border-nb-green outline-none transition-all font-medium appearance-none cursor-pointer">
                                        <option value="" disabled>Pilih event spesifik...</option>
                                        {events.map((event, i) => (
                                            <option key={i} value={event.name} disabled={event.name === "Belum ada event tersedia"}>{event.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Motivasi Mengikuti Event</label>
                                <textarea value={reason} onChange={e => setReason(e.target.value)} rows="2" required
                                    className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-nb-green/20 focus:border-nb-green outline-none transition-all font-medium resize-none"
                                    placeholder="Mengapa Anda tertarik terjun di event ini?"></textarea>
                            </div>

                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting}
                                    className="w-full bg-nb-green text-white font-black py-4 px-6 rounded-2xl hover:bg-nb-green-light transition-all shadow-xl hover:shadow-nb-green-light/30 transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2 disabled:opacity-75">
                                    {isSubmitting ? 'Mengirim...' : 'Daftar Sebagai Volunteer'}
                                    {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                                </button>
                            </div>

                            <p className="text-center text-sm font-medium text-gray-500 mt-6 pt-4 border-t border-gray-100">
                                Ingin berkontribusi dalam tim internal? <br className="sm:hidden" />
                                <a href="/daftar-anggota" className="text-nb-green font-bold hover:text-nb-dark transition-colors inline-block mt-1 sm:mt-0 ml-1">Gabung Sebagai Anggota</a>
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fade-in-up_0.3s_ease-out_forwards]">
                    <div className="bg-white p-8 rounded-[30px] shadow-2xl text-center max-w-md mx-4 transform transition-all">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-50">
                            <svg className="w-8 h-8 text-nb-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-2xl font-black text-nb-green mb-2 font-display">Pendaftaran Berhasil!</h3>
                        <p className="text-gray-600 mb-6 font-medium">Selamat kamu telah daftar sebagai volunteer untuk event <strong className="text-nb-dark">{eventName}</strong>, silahkan bergabung di grup WhatsApp untuk info selanjutnya.</p>

                        <a href="https://chat.whatsapp.com/CJjjsaXJgsC2kB1Zlutnbg" target="_blank" rel="noopener noreferrer"
                            className="block w-full bg-[#25D366] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg text-sm mb-4 flex items-center justify-center gap-2 hover:-translate-y-0.5 transform">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            Gabung Grup WhatsApp
                        </a>

                        <button onClick={() => { setShowSuccessModal(false); window.location.href = '/'; }} className="text-sm text-gray-400 hover:text-gray-800 font-semibold underline underline-offset-4 transition-colors">Tutup dan Kembali ke Beranda</button>
                    </div>
                </div>
            )}
        </div>
    );
}
