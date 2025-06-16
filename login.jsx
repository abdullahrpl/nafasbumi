import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, // Diubah dari signInWithRedirect
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    onSnapshot,
    serverTimestamp,
    orderBy // orderBy diimpor untuk digunakan
} from 'firebase/firestore';

// ===================================================================================
// --- PANDUAN PENGATURAN FIREBASE (WAJIB DIIKUTI) ---
// ===================================================================================
//
// Langkah 1: Konfigurasi Firebase Anda sudah benar. Tidak perlu diubah.
const firebaseConfig = {
  apiKey: "AIzaSyAmLz0qVf4GN0TdDO-G7XdOM7PJI_KaNwo",
  authDomain: "nafasbumi-7104f.firebaseapp.com",
  projectId: "nafasbumi-7104f",
  storageBucket: "nafasbumi-7104f.appspot.com",
  messagingSenderId: "640077220735",
  appId: "1:640077220735:web:d58d2ac6183651a090284a",
  measurementId: "G-EG13J7CKD4"
};
//
// Langkah 2: Aktifkan Google Authentication. (Sudah Anda lakukan)
//
// Langkah 3: Daftarkan Domain (INI LANGKAH KUNCI)
//    - Di konsol Firebase, buka Authentication -> Settings -> Authorized domains.
//    - Pastikan domain "scf.usercontent.goog" ada di dalam daftar.
//      Jika error masih ada, coba hapus domain tersebut, tunggu 2 menit, lalu tambahkan kembali.
//
// Langkah 4: Atur Firestore Security Rules. (Sudah Anda lakukan)
//
// ===================================================================================


// --- Inisialisasi Firebase ---
let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// --- KOMPONEN UTAMA: App ---
export default function App() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    }, (error) => {
      console.error("Auth State Error:", error);
      setAuthError(error.message);
    });
    return () => unsubscribe();
  }, []);

  if (!app) {
      return (
          <div className="flex flex-col items-center justify-center h-screen text-center p-8 bg-red-50">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Kesalahan Inisialisasi Firebase</h1>
            <p className="text-gray-700 max-w-md">
              Gagal menginisialisasi Firebase. Periksa konsol untuk detail error dan pastikan `firebaseConfig` Anda sudah benar.
            </p>
          </div>
      );
  }
  
  return (
    <div className="h-screen w-screen bg-emerald-50 text-gray-800 font-sans">
      {user ? <ChatLayout user={user} /> : <Login setAuthError={setAuthError}/>}
      {authError && <div className="absolute bottom-5 right-5 bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm text-sm">{authError}</div>}
    </div>
  );
}

// --- KOMPONEN: Login ---
const Login = ({ setAuthError }) => {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setAuthError(null);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google Popup: ", error);
      const firebaseConsoleUrl = `https://console.firebase.google.com/project/${auth.app.options.projectId}/authentication/settings`;

      if (error.code === 'auth/unauthorized-domain') {
        setAuthError(
            <span>
                <strong className="block text-base mb-2">Error: Domain Tidak Diizinkan</strong>
                Ini adalah masalah PENGATURAN di website Firebase, bukan masalah kode.
                <br />
                <a href={firebaseConsoleUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-yellow-200">
                    Buka Pengaturan Firebase
                </a> dan pastikan domain ini ada di daftar "Authorized domains":
                <br />
                <code className="bg-red-800 text-white p-1 rounded mx-1 my-2 inline-block">scf.usercontent.goog</code>
                <br />
                Setelah ditambahkan, tunggu 5 menit & coba di jendela Incognito.
            </span>
        );
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("Jendela login ditutup sebelum selesai.");
      } else {
        setAuthError(`Gagal login: ${error.code}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold text-emerald-600 mb-2">Nafasbumi</h1>
      <p className="text-gray-600 mb-8">Bergabunglah dalam diskusi untuk bumi yang lebih baik.</p>
      <button 
        onClick={signInWithGoogle}
        className="flex items-center gap-3 bg-white border border-gray-300 px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-6 h-6" />
        <span className="font-semibold text-gray-700">Masuk dengan Google</span>
      </button>
    </div>
  );
};


// --- KOMPONEN: Layout Chat ---
const ChatLayout = ({ user }) => {
    const [activeChannel, setActiveChannel] = useState('Selamat Datang');

    return (
        <div className="flex h-screen antialiased text-gray-800">
            <Sidebar user={user} activeChannel={activeChannel} setActiveChannel={setActiveChannel} />
            <ChatArea user={user} activeChannel={activeChannel} />
            <RightSidebar />
        </div>
    );
};

// --- KOMPONEN: Sidebar Kiri ---
const Sidebar = ({ user, activeChannel, setActiveChannel }) => {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    const channels = [
        { name: 'Selamat Datang', icon: 'fa-hashtag' },
        { name: 'Pengumuman', icon: 'fa-bullhorn' },
        { name: 'Saran', icon: 'fa-lightbulb' },
    ];

    const generalChannels = [
        { name: 'Diskusi Umum', icon: 'fa-hashtag' },
        { name: 'Tantangan Hijau', icon: 'fa-leaf' },
    ];

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-emerald-600">Nafasbumi</h1>
            </div>
            <div className="flex flex-col flex-grow p-4 overflow-y-auto">
                 <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Informasi</h2>
                    {channels.map(channel => (
                        <a href="#" key={channel.name} onClick={(e) => { e.preventDefault(); setActiveChannel(channel.name); }}
                           className={`flex items-center p-2 rounded-md mt-1 transition-colors ${activeChannel === channel.name ? 'text-emerald-800 bg-emerald-100 font-semibold' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'}`}>
                            <i className={`fas ${channel.icon} fa-fw mr-3`}></i>
                            <span>{channel.name}</span>
                        </a>
                    ))}
                </div>
                 <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Umum</h2>
                    {generalChannels.map(channel => (
                         <a href="#" key={channel.name} onClick={(e) => { e.preventDefault(); setActiveChannel(channel.name); }}
                           className={`flex items-center p-2 rounded-md mt-1 transition-colors ${activeChannel === channel.name ? 'text-emerald-800 bg-emerald-100 font-semibold' : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'}`}>
                            <i className={`fas ${channel.icon} fa-fw mr-3`}></i>
                            <span>{channel.name}</span>
                        </a>
                    ))}
                </div>

                <div className="mt-auto flex items-center p-2 bg-gray-50 rounded-md">
                    <img className="h-10 w-10 rounded-full object-cover" src={user.photoURL} alt={user.displayName} />
                    <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-800">{user.displayName}</p>
                        <p className="text-xs text-emerald-500">Online</p>
                    </div>
                    <button onClick={handleSignOut} className="ml-auto p-2 rounded-md hover:bg-red-100 hover:text-red-600" title="Keluar">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- KOMPONEN: Area Chat Tengah ---
const ChatArea = ({ user, activeChannel }) => {
    const [messages, setMessages] = useState([]);
    const [firestoreError, setFirestoreError] = useState(null);
    const messagesEndRef = useRef(null);
    const [isGeminiModalOpen, setGeminiModalOpen] = useState(false);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (!activeChannel || !db) return;
        setFirestoreError(null);

        const q = query(collection(db, "channels", activeChannel, "messages"), orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
                const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(msgs);
            }, 
            (error) => {
                console.error("Firestore Error:", error);
                if (error.code === 'permission-denied') {
                    setFirestoreError("Kesalahan Izin: Gagal memuat pesan. Pastikan Anda telah mengikuti Langkah 4 (Firestore Security Rules) pada panduan di dalam kode.");
                } else {
                    setFirestoreError(`Terjadi kesalahan database: ${error.message}`);
                }
            }
        );

        return () => unsubscribe();
    }, [activeChannel]);
    
    const handleSendMessage = async (text) => {
        if (text.trim() === "") return;
        
        try {
            await addDoc(collection(db, "channels", activeChannel, "messages"), {
                text: text,
                timestamp: serverTimestamp(),
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setFirestoreError("Gagal mengirim pesan.");
        }
    };

    return (
        <div className="flex flex-col flex-grow bg-gray-50">
             <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-md">
                <div className="flex items-center"><i className="fas fa-hashtag fa-lg text-white/80 mr-2"></i><h2 className="text-lg font-semibold">{activeChannel}</h2></div>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto">
                {firestoreError ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-red-600 p-4 bg-red-100 rounded-lg shadow">
                            <p className="font-bold text-lg">Gagal Memuat Pesan!</p>
                            <p className="mt-2 text-sm">{firestoreError}</p>
                        </div>
                    </div>
                ) : (
                    messages.map(msg => <Message key={msg.id} message={msg} isSent={msg.uid === user.uid} />)
                )}
                <div ref={messagesEndRef} />
            </div>

            <MessageInput onSend={handleSendMessage} onGeminiClick={() => setGeminiModalOpen(true)} />

            {isGeminiModalOpen && <GeminiModal lastMessage={messages.length > 0 ? messages[messages.length - 1].text : ""} onClose={() => setGeminiModalOpen(false)} onInsert={(text) => handleSendMessage(`(Ide dari AI) ${text}`)} />}
        </div>
    );
};

// --- KOMPONEN: Satu Pesan ---
const Message = ({ message, isSent }) => {
    const { text, displayName, photoURL, timestamp } = message;
    const messageDate = timestamp?.toDate();

    if (isSent) {
        return (
            <div className="flex items-start mb-6 justify-end">
                <div className="order-1 flex-shrink min-w-0">
                    <div className="flex items-center mb-1 justify-end">
                        {messageDate && <span className="text-xs text-gray-500 mr-2">{messageDate.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>}
                        <span className="font-semibold text-sm">{displayName}</span>
                    </div>
                    <div className="bg-emerald-200 text-gray-800 p-3 rounded-lg rounded-br-none shadow-md max-w-md inline-block">
                        <p className="break-words">{text}</p>
                    </div>
                </div>
                <img className="h-10 w-10 rounded-full object-cover ml-4 order-2 flex-shrink-0" src={photoURL} alt={displayName} />
            </div>
        );
    }

    return (
        <div className="flex items-start mb-6">
            <img className="h-10 w-10 rounded-full object-cover mr-4 flex-shrink-0" src={photoURL} alt={displayName} />
            <div className="flex-shrink min-w-0">
                <div className="flex items-center mb-1">
                    <span className="font-semibold mr-2 text-sm">{displayName}</span>
                    {messageDate && <span className="text-xs text-gray-500">{messageDate.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>}
                </div>
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-md inline-block">
                    <p className="break-words">{text}</p>
                </div>
            </div>
        </div>
    );
};


// --- KOMPONEN: Input Pesan ---
const MessageInput = ({ onSend, onGeminiClick }) => {
    const [text, setText] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); onSend(text); setText(''); };
    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 border-t border-gray-200">
            <div className="relative flex items-center">
                <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }} rows="1" placeholder="Ketik pesan..." className="w-full bg-gray-100 rounded-lg p-3 pr-28 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                <button type="button" onClick={onGeminiClick} title="✨ Hasilkan Ide" className="absolute right-12 p-2 rounded-full hover:bg-yellow-100 transition-colors"><i className="fas fa-star text-yellow-500"></i></button>
                <button type="submit" className="absolute right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:from-emerald-600 hover:to-teal-600 shadow-md"><i className="fas fa-paper-plane"></i></button>
            </div>
        </form>
    );
};

// --- KOMPONEN: Sidebar Kanan ---
const RightSidebar = () => {
    return (
         <div className="hidden md:flex flex-col w-80 bg-white border-l border-gray-200 p-4 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4 relative overflow-hidden">
              <div className="z-10 relative">
                <h3 className="font-bold text-lg text-gray-800">Practice</h3>
                <p className="text-sm text-gray-500 mt-1">Buat ruang diskusimu sendiri.</p>
                <button className="mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 shadow-sm">Buat Ruangan</button>
              </div>
              <img src="https://placehold.co/100x120/E0E7FF/3730A3?text=Ilustrasi" alt="Ilustrasi" className="absolute -right-4 -bottom-4 w-24 h-30 opacity-80"/>
            </div>
            <div><h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Ruang Aktif</h2></div>
            <div><h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Anggota</h2></div>
        </div>
    );
};

// --- KOMPONEN: Modal Gemini ---
const GeminiModal = ({ lastMessage, onClose, onInsert }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [idea, setIdea] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { handleGeminiRequest(); }, []);

    const handleGeminiRequest = async () => {
        if (!lastMessage) { setError("Tidak ada pesan untuk dijadikan topik."); return; }
        setIsLoading(true); setError('');
        const fullPrompt = `Sebagai asisten lingkungan yang kreatif, berikan beberapa tips atau ide praktis dan mudah dilakukan terkait pertanyaan berikut: "${lastMessage}"`;
        const payload = { contents: [{ role: "user", parts: [{ text: fullPrompt }] }] };
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const result = await response.json();
            if (result.candidates?.length > 0 && result.candidates[0].content.parts[0].text) { 
                setIdea(result.candidates[0].content.parts[0].text); 
            } else { 
                throw new Error("Tidak ada konten yang dihasilkan atau respons tidak valid."); 
            }
        } catch (err) {
            setError("Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi."); console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center"><h3 className="text-lg font-semibold">✨ Ide dari AI</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button></div>
                <div className="p-6 overflow-y-auto">
                    {isLoading && <div className="text-center p-8"><i className="fas fa-spinner fa-spin fa-3x text-emerald-500"></i><p className="mt-4 text-gray-600">Sedang menghubungi AI...</p></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {idea && <p className="whitespace-pre-wrap">{idea}</p>}
                </div>
                <div className="p-4 border-t bg-gray-50 text-right"><button onClick={() => { onInsert(idea); onClose(); }} className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 disabled:bg-gray-400" disabled={isLoading || !idea}>Sisipkan ke Chat</button></div>
            </div>
        </div>
    );
};
