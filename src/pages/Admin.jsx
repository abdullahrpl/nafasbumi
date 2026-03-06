import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

export default function Admin() {
    const [isAdminAuth, setIsAdminAuth] = useState(localStorage.getItem('isAdminAuth') === 'true');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('registrations'); // registrations, events, divisions

    // Data State
    const [registrations, setRegistrations] = useState([]);
    const [filter, setFilter] = useState('all');
    const [events, setEvents] = useState([]);
    const [divisions, setDivisions] = useState([]);

    // Form State
    const [eventName, setEventName] = useState('');
    const [divisionName, setDivisionName] = useState('');
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [isAddingDivision, setIsAddingDivision] = useState(false);

    const [toast, setToast] = useState({ message: '', type: '', visible: false });
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast({ message: '', type: '', visible: false }), 3000);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === 'bdol' && password === 'adalahpokoknya') {
            localStorage.setItem('isAdminAuth', 'true');
            setIsAdminAuth(true);
            showToast('Login berhasil! Selamat datang.', 'success');
        } else {
            showToast('Salah bos! Coba ingat-ingat lagi.', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('isAdminAuth');
        setIsAdminAuth(false);
    };

    // Firebase Listeners
    useEffect(() => {
        if (!isAdminAuth) return;

        // Registrations
        const qReg = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
        const unsubReg = onSnapshot(qReg, (snapshot) => {
            setRegistrations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            if (error.code === 'permission-denied') {
                showToast('Akses Ditolak! Cek Firestore Rules.', 'error');
            }
        });

        // Events
        const qEvents = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const unsubEvents = onSnapshot(qEvents, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Divisions
        const qDivs = query(collection(db, "divisions"), orderBy("createdAt", "desc"));
        const unsubDivs = onSnapshot(qDivs, (snapshot) => {
            setDivisions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubReg();
            unsubEvents();
            unsubDivs();
        };
    }, [isAdminAuth]);

    // Actions
    const handleAddEvent = async (e) => {
        e.preventDefault();
        if (!eventName.trim()) return;
        setIsAddingEvent(true);
        try {
            await addDoc(collection(db, "events"), {
                name: eventName,
                createdAt: serverTimestamp()
            });
            setEventName('');
            showToast('Event berhasil ditambahkan!');
        } catch (error) {
            showToast("Gagal menambah event: " + error.message, 'error');
        } finally {
            setIsAddingEvent(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Yakin ingin menghapus event ini?')) {
            try {
                await deleteDoc(doc(db, "events", id));
                showToast('Event berhasil dihapus!', 'success');
            } catch (error) {
                showToast("Gagal menghapus event: " + error.message, 'error');
            }
        }
    };

    const handleAddDivision = async (e) => {
        e.preventDefault();
        if (!divisionName.trim()) return;
        setIsAddingDivision(true);
        try {
            await addDoc(collection(db, "divisions"), {
                name: divisionName,
                createdAt: serverTimestamp()
            });
            setDivisionName('');
            showToast('Divisi berhasil ditambahkan!');
        } catch (error) {
            showToast("Gagal menambah divisi: " + error.message, 'error');
        } finally {
            setIsAddingDivision(false);
        }
    };

    const handleDeleteDivision = async (id) => {
        if (window.confirm('Yakin ingin menghapus divisi ini?')) {
            try {
                await deleteDoc(doc(db, "divisions", id));
                showToast('Divisi berhasil dihapus!', 'success');
            } catch (error) {
                showToast("Gagal menghapus divisi: " + error.message, 'error');
            }
        }
    };

    const filteredRegistrations = filter === 'all'
        ? registrations
        : registrations.filter(r => r.type === filter);

    if (!isAdminAuth) {
        return (
            <div className="fixed inset-0 z-50 bg-[#2E5339] flex items-center justify-center transition-all duration-500 min-h-screen">
                <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-nb-green/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 relative z-10">
                        <svg className="w-8 h-8 text-nb-green" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-black mb-1 text-nb-dark font-display relative z-10 tracking-tight">Admin Login</h1>
                    <p className="text-gray-500 text-sm mb-6 font-medium relative z-10">Silakan masuk menggunakan kredensial admin.</p>

                    <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-nb-green/10 focus:border-nb-green outline-none transition-all placeholder:text-gray-400 font-medium"
                            placeholder="Username"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-nb-green/10 focus:border-nb-green outline-none transition-all placeholder:text-gray-400 font-medium"
                            placeholder="Password"
                            required
                        />
                        <button type="submit" className="w-full bg-[#2E5339] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#1a3321] transition-all shadow-lg hover:-translate-y-0.5 mt-2">Masuk</button>
                        <Link to="/" className="inline-block mt-4 text-sm text-gray-500 font-semibold hover:text-nb-green transition-colors">← Kembali ke Beranda</Link>
                    </form>

                    {/* Toast Notice inside login */}
                    {toast.visible && (
                        <div className={`mt-4 text-sm px-4 py-3 rounded-xl font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {toast.message}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20 mt-[80px]">
            <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-[80px] z-40">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-xl font-black text-[#2E5339] font-display">NafasBumi <span className="text-gray-400">Admin</span></Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-500 hidden md:block px-3 py-1 bg-gray-100 rounded-full">Halo, System Admin</span>
                        <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-bold bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            Keluar
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-8">
                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-200 mb-8 overflow-x-auto custom-scrollbar pb-1">
                    <button
                        onClick={() => setActiveTab('registrations')}
                        className={`admin-nav-link px-6 py-3 font-bold text-sm transition-colors focus:outline-none whitespace-nowrap ${activeTab === 'registrations' ? 'text-[#2E5339] border-b-2 border-[#2E5339]' : 'text-gray-500 hover:text-[#2E5339]'}`}
                    >
                        Data Pendaftaran
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`admin-nav-link px-6 py-3 font-bold text-sm transition-colors focus:outline-none whitespace-nowrap ${activeTab === 'events' ? 'text-[#2E5339] border-b-2 border-[#2E5339]' : 'text-gray-500 hover:text-[#2E5339]'}`}
                    >
                        Manajemen Event
                    </button>
                    <button
                        onClick={() => setActiveTab('divisions')}
                        className={`admin-nav-link px-6 py-3 font-bold text-sm transition-colors focus:outline-none whitespace-nowrap ${activeTab === 'divisions' ? 'text-[#2E5339] border-b-2 border-[#2E5339]' : 'text-gray-500 hover:text-[#2E5339]'}`}
                    >
                        Manajemen Divisi
                    </button>
                </div>

                {/* View: Registrations */}
                {activeTab === 'registrations' && (
                    <div className="animate-[fade-in-up_0.3s_ease-out_forwards]">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-[20px] shadow-sm border border-gray-100">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 font-display tracking-tight">Daftar Registrasi</h2>
                                <p className="text-gray-500 text-sm mt-1 font-medium">Monitoring volunteer dan anggota baru yang ingin bergabung.</p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <div className="inline-flex rounded-xl shadow-sm p-1 bg-gray-100 border border-gray-200" role="group">
                                    {['all', 'Volunteer', 'Anggota'].map((f) => (
                                        <button
                                            key={f}
                                            type="button"
                                            onClick={() => setFilter(f)}
                                            className={`px-6 py-2 text-sm font-bold rounded-lg transition-colors ${filter === f ? 'bg-white text-[#2E5339] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                                        >
                                            {f === 'all' ? 'Semua Data' : f}
                                        </button>
                                    ))}
                                </div>
                                <span className="bg-green-50 text-green-700 text-sm font-bold px-4 py-2.5 rounded-xl border border-green-200 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    Total: <span className="bg-white px-2 py-0.5 rounded-md min-w-[24px] text-center">{filteredRegistrations.length}</span>
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] shadow-sm overflow-hidden border border-gray-100">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-gray-700 uppercase whitespace-nowrap text-[11px] font-black tracking-wider border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-5">Waktu Mendaftar</th>
                                            <th className="px-8 py-5">Nama Lengkap</th>
                                            <th className="px-8 py-5">Umur</th>
                                            <th className="px-8 py-5">Tipe</th>
                                            <th className="px-8 py-5">Informasi Kontak</th>
                                            <th className="px-8 py-5">Domisili</th>
                                            <th className="px-8 py-5">Instansi/Divisi</th>
                                            <th className="px-8 py-5">Minat Event</th>
                                            <th className="px-8 py-5 w-[300px]">Alasan Bergabung</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRegistrations.length === 0 ? (
                                            <tr><td colSpan="9" className="px-6 py-12 text-center text-gray-500 font-medium">Tidak ada data {filter !== 'all' ? filter : ''} ditemukan.</td></tr>
                                        ) : (
                                            filteredRegistrations.map((data) => (
                                                <tr key={data.id} className="hover:bg-gray-50 transition-colors align-top border-b border-gray-50 whitespace-nowrap">
                                                    <td className="px-8 py-6 text-xs text-gray-400 font-medium">
                                                        {data.createdAt ? data.createdAt.toDate().toLocaleString('id-ID', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                                                    </td>
                                                    <td className="px-8 py-6 font-bold text-gray-900">{data.fullName || '-'}</td>
                                                    <td className="px-8 py-6 font-medium text-gray-600">{data.age ? data.age + ' thn' : '-'}</td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 text-xs font-bold rounded-full border ${data.type === 'Volunteer' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                                                            {data.type || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-gray-800 font-medium mb-1 flex items-center gap-2"><svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> {data.email || '-'}</div>
                                                        <div className="text-gray-500 text-xs flex items-center gap-2"><svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> {data.whatsapp || '-'}</div>
                                                    </td>
                                                    <td className="px-8 py-6 font-medium text-gray-600">{data.domicile || '-'}</td>
                                                    <td className="px-8 py-6">
                                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs font-semibold block w-max">
                                                            {data.institution || data.role || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-[#2E5339] font-bold block bg-nb-green/5 px-3 py-1 rounded-lg border border-nb-green/10 w-max">
                                                            {data.event || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-gray-500 font-medium italic whitespace-normal min-w-[300px] max-w-[400px] leading-relaxed relative">
                                                        <div className="absolute top-6 left-4 text-3xl text-gray-200 leading-none">"</div>
                                                        <span className="pl-6 block">{data.reason || '-'}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* View: Events */}
                {activeTab === 'events' && (
                    <div className="animate-[fade-in-up_0.3s_ease-out_forwards]">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-gray-800 font-display tracking-tight">Manajemen Event</h2>
                            <p className="text-gray-500 text-sm mt-1 font-medium">Buat dan kelola daftar event untuk publikasi kepada volunteer.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 md:col-span-1 h-fit relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-nb-green/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="w-12 h-12 bg-nb-green/10 rounded-xl flex items-center justify-center text-nb-green mb-6">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>

                                <h3 className="font-black text-xl mb-6 text-nb-dark font-display relative z-10">Event Baru</h3>

                                <form onSubmit={handleAddEvent} className="space-y-5 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Nama Event</label>
                                        <input
                                            type="text"
                                            value={eventName}
                                            onChange={e => setEventName(e.target.value)}
                                            required
                                            className="w-full px-5 py-3.5 text-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-nb-green/10 focus:border-nb-green outline-none transition-all placeholder:text-gray-300 font-medium"
                                            placeholder="Contoh: Aksi Bersih Pantai Bali"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isAddingEvent}
                                        className="w-full bg-[#2E5339] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#1a3321] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isAddingEvent ? 'Menyimpan...' : (
                                            <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Simpan Event</>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-700">Daftar Event Aktif</h3>
                                    <span className="text-sm bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">{events.length} Event</span>
                                </div>

                                {events.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <p className="text-gray-500 font-medium mb-1">Belum ada event yang ditambahkan.</p>
                                        <p className="text-gray-400 text-sm">Gunakan form di samping untuk mulai membuat event.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {events.map((event) => (
                                            <div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-1 group">
                                                <div className="mb-4">
                                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-nb-green mb-4 border border-green-100">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 text-lg leading-snug">{event.name}</h4>
                                                    <p className="text-[11px] font-semibold text-gray-400 mt-2 uppercase tracking-wide flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        {event.createdAt ? event.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    className="self-end text-sm text-red-500 font-semibold hover:text-white hover:bg-red-500 px-4 py-2 rounded-xl transition-colors border border-red-100 flex items-center gap-2"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Hapus
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* View: Divisions */}
                {activeTab === 'divisions' && (
                    <div className="animate-[fade-in-up_0.3s_ease-out_forwards]">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-gray-800 font-display tracking-tight">Manajemen Divisi</h2>
                            <p className="text-gray-500 text-sm mt-1 font-medium">Atur struktur organisasi untuk pendaftaran anggota komunitas.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 md:col-span-1 h-fit relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-nb-green/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="w-12 h-12 bg-nb-blue/10 rounded-xl flex items-center justify-center text-nb-blue mb-6">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>

                                <h3 className="font-black text-xl mb-6 text-nb-dark font-display relative z-10">Divisi Baru</h3>
                                <form onSubmit={handleAddDivision} className="space-y-5 relative z-10">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Nama Divisi</label>
                                        <input
                                            type="text"
                                            value={divisionName}
                                            onChange={e => setDivisionName(e.target.value)}
                                            required
                                            className="w-full px-5 py-3.5 text-sm border border-gray-200 rounded-xl focus:ring-4 focus:ring-nb-green/10 focus:border-nb-green outline-none transition-all placeholder:text-gray-300 font-medium"
                                            placeholder="Contoh: Tim Humas"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isAddingDivision}
                                        className="w-full bg-[#2E5339] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#1a3321] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isAddingDivision ? 'Menyimpan...' : (
                                            <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Simpan Divisi</>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-700">Daftar Divisi Tersedia</h3>
                                    <span className="text-sm bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full">{divisions.length} Divisi</span>
                                </div>

                                {divisions.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                        <p className="text-gray-500 font-medium mb-1">Belum ada divisi yang dibuat.</p>
                                        <p className="text-gray-400 text-sm">Organisasi belum memiliki pilihan divisi untuk anggota.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {divisions.map((division) => (
                                            <div key={division.id} className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all hover:-translate-y-1 group">
                                                <div className="mb-4">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-nb-blue mb-4 border border-blue-100">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 text-lg leading-snug">{division.name}</h4>
                                                    <p className="text-[11px] font-semibold text-gray-400 mt-2 uppercase tracking-wide flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        {division.createdAt ? division.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteDivision(division.id)}
                                                    className="self-end text-sm text-red-500 font-semibold hover:text-white hover:bg-red-500 px-4 py-2 rounded-xl transition-colors border border-red-100 flex items-center gap-2"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    Hapus
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Global Toaster */}
            <div className="fixed top-24 right-5 z-50 flex flex-col gap-2 pointer-events-none">
                {toast.visible && (
                    <div className={`${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[fade-in-up_0.3s_ease-out_forwards] border border-white/10`}>
                        {toast.type === 'success' ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        )}
                        <span className="font-semibold text-sm leading-tight">{toast.message}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
