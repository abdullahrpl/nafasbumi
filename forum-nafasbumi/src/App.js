import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup,
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
    orderBy,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    writeBatch,
} from 'firebase/firestore';
// IMPORT BARU UNTUK FUNGSI AI (Mungkin sudah ada)
import { GoogleGenerativeAI } from '@google/generative-ai';


// ===================================================================================
// --- PENGATURAN APLIKASI ---
// ===================================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAmLz0qVf4GN0TdDO-G7XdOM7PJI_KaNwo",
  authDomain: "nafasbumi-7104f.firebaseapp.com",
  projectId: "nafasbumi-7104f",
  storageBucket: "nafasbumi-7104f.appspot.com",
  messagingSenderId: "640077220735",
  appId: "1:640077220735:web:d58d2ac6183651a090284a",
  measurementId: "G-EG13J7CKD4"
};

const ADMIN_UIDS = ["VM2zz5VZSSYsACeLE55yvapAsmw1"]; 
// --- CHANNEL SARAN DIHAPUS ---
const INFO_CHANNELS = ['Selamat Datang', 'Pengumuman'];
const ALL_CHANNELS = [
    { name: 'Selamat Datang', icon: 'fa-door-open', type: 'info' },
    { name: 'Pengumuman', icon: 'fa-bullhorn', type: 'info' },
    { name: 'Diskusi Umum', icon: 'fa-comments', type: 'general' },
    { name: 'Tantangan Hijau', icon: 'fa-leaf', type: 'general' },
];

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        setDoc(userRef, { isOnline: true }, { merge: true });
      }
      setLoading(false);
    });

    const setOffline = async () => {
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, { isOnline: false }, { merge: true });
        }
    };
    
    window.addEventListener('beforeunload', setOffline);

    return () => {
        unsubscribe();
        window.removeEventListener('beforeunload', setOffline);
    };
  }, []);

  if (loading) {
      return <div className="flex items-center justify-center h-screen bg-white"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-green-900"></div></div>
  }
  
  return (
    <div className="h-screen w-screen bg-gray-50 text-gray-800 font-sans">
      {user ? <ChatLayout user={user} /> : <Login />}
    </div>
  );
}

// --- KOMPONEN: Login ---
const Login = () => {
  const [error, setError] = useState('');
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;

      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const isNewUser = !userDoc.exists();

      await setDoc(userRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isOnline: true,
            isAdmin: ADMIN_UIDS.includes(currentUser.uid)
      }, { merge: true });

      if (isNewUser) {
          const challengeRef = doc(db, 'challenge_progress', currentUser.uid);
          await setDoc(challengeRef, { level: 0, startDate: null, displayName: currentUser.displayName, photoURL: currentUser.photoURL });
          
          const welcomeMessage = `Selamat datang @${currentUser.displayName}, Ini adalah forum diskusi tentang lingkungan, silahkan ke channel Diskusi Umum untuk berdiskusi dengan yang lainnya`;
          await addDoc(collection(db, "channels/Selamat Datang/messages"), {
              text: welcomeMessage,
              timestamp: serverTimestamp(),
              uid: 'system-admin',
              displayName: 'Admin NafasBumi',
              photoURL: 'https://placehold.co/100x100/2F5247/FFFFFF?text=N',
              isAdmin: true,
          });
      }

    } catch (error) {
      console.error("Login Error:", error);
      setError(`Gagal login: ${error.code}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-gray-50">
      <h1 className="text-5xl font-bold text-[#1A3A32] mb-2">NafasBumi</h1>
      <p className="text-gray-600 mb-8 max-w-sm">Bergabunglah dalam forum diskusi terdedikasi untuk aksi dan inspirasi lingkungan.</p>
      <button 
        onClick={signInWithGoogle}
        className="flex items-center gap-3 bg-white border border-gray-300 px-6 py-3 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-100 transform hover:-translate-y-0.5 transition-all duration-300"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-6 h-6" />
        <span className="font-semibold text-gray-700">Masuk dengan Google</span>
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};


// --- KOMPONEN: Layout Chat ---
const ChatLayout = ({ user }) => {
    const [activeChannel, setActiveChannel] = useState('Selamat Datang');
    const [profileModalUser, setProfileModalUser] = useState(null);
    const [notifications, setNotifications] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    useEffect(() => { setIsUserAdmin(ADMIN_UIDS.includes(user.uid)); }, [user.uid]);
    useEffect(() => {
        const unsub = onSnapshot(query(collection(db, 'users')), (snapshot) => setAllUsers(snapshot.docs.map(doc => doc.data())));
        return () => unsub();
    }, []);

    useEffect(() => {
        const unsubscribers = ALL_CHANNELS.map(channel => {
            if (channel.name === 'Tantangan Hijau') return () => {}; 
            return onSnapshot(query(collection(db, `channels/${channel.name}/messages`)), async (snapshot) => {
                const userReadStatusRef = doc(db, `users/${user.uid}/readStatus`, channel.name);
                const userReadStatusDoc = await getDoc(userReadStatusRef);
                const lastReadTime = userReadStatusDoc.data()?.timestamp?.toMillis() || 0;
                
                let unreadCount = 0, hasMention = false;
                snapshot.docs.forEach(doc => {
                    const msg = doc.data();
                    if (msg.timestamp?.toMillis() > lastReadTime) {
                        unreadCount++;
                        // --- LOGIKA NOTIFIKASI TAG @EVERYONE ---
                        if (msg.text && (msg.text.includes(`@${user.displayName}`) || msg.text.includes('@everyone'))) {
                            hasMention = true;
                        }
                    }
                });
                setNotifications(prev => ({...prev, [channel.name]: {...prev[channel.name], count: unreadCount, mention: hasMention}}));
            });
        });
        return () => unsubscribers.forEach(unsub => unsub());
    }, [user.uid, user.displayName]);
    
    useEffect(() => {
        if (!activeChannel || activeChannel === 'Tantangan Hijau') { setTypingUsers([]); return; };
        const unsub = onSnapshot(query(collection(db, "channels", activeChannel, "typing")), (snapshot) => {
            const now = Date.now();
            setTypingUsers(snapshot.docs.map(doc => doc.data()).filter(u => u.uid !== user.uid && (now - u.timestamp?.toMillis()) < 5000));
        });
        return () => unsub();
    }, [activeChannel, user.uid]);

    const handleChannelChange = async (channelName) => {
        setActiveChannel(channelName);
        if (channelName !== 'Tantangan Hijau') {
            await setDoc(doc(db, `users/${user.uid}/readStatus`, channelName), { timestamp: serverTimestamp() });
            setNotifications(prev => ({...prev, channelName: {count: 0, mention: false}}));
        }
    };
    
    const handleDeleteUser = async (userToDelete) => {
        if (!window.confirm(`Anda yakin ingin menghapus data pengguna "${userToDelete.displayName}" dari Firestore? Ini tidak bisa dibatalkan.`)) return;
        try { await deleteDoc(doc(db, 'users', userToDelete.uid)); } catch (err) { console.error("Gagal menghapus pengguna:", err); }
    }

    return (
        <div className="flex h-screen antialiased text-gray-800">
            <Sidebar user={user} activeChannel={activeChannel} setActiveChannel={handleChannelChange} notifications={notifications} />
            <div className="flex-1 flex flex-col bg-gray-50">{activeChannel === 'Tantangan Hijau' ? <ChallengeComponent user={user} /> : <ChatArea user={user} activeChannel={activeChannel} onViewProfile={setProfileModalUser} allUsers={allUsers} typingUsers={typingUsers} />}</div>
            <RightSidebar onViewProfile={setProfileModalUser} allUsers={allUsers} typingUsers={typingUsers} isUserAdmin={isUserAdmin} onDeleteUser={handleDeleteUser}/>
            {profileModalUser && <UserProfileModal userToShow={profileModalUser} onClose={() => setProfileModalUser(null)} />}
        </div>
    );
};

// --- KOMPONEN: Sidebar Kiri (DENGAN PERBAIKAN) ---
const Sidebar = ({ user, activeChannel, setActiveChannel, notifications }) => {
    const handleSignOut = async () => {
        if (auth.currentUser) {
            await setDoc(doc(db, 'users', auth.currentUser.uid), { isOnline: false }, { merge: true });
            const batch = writeBatch(db);
            ALL_CHANNELS.forEach(channel => {
                const typingRef = doc(db, 'channels', channel.name, 'typing', auth.currentUser.uid);
                batch.delete(typingRef);
            });
            await batch.commit();
        }
        await signOut(auth);
    };

    const renderChannel = (channel) => {
        const notif = notifications[channel.name] || {};
        return (<a href="#" key={channel.name} onClick={() => setActiveChannel(channel.name)} className={`flex items-center justify-between p-2 rounded-lg mt-1 transition-all duration-300 ease-in-out transform hover:translate-x-1 ${activeChannel === channel.name ? 'bg-[#2F5247] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}><div className="flex items-center"><i className={`fas ${channel.icon} fa-fw mr-3 w-5 text-center`}></i><span className="font-semibold">{channel.name}</span></div>{notif.mention && <span className="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-pulse">@</span>}{!notif.mention && notif.count > 0 && <span className="bg-gray-300 text-gray-700 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{notif.count}</span>}</a>);
    };

    return (<div className="flex flex-col w-64 bg-white border-r border-gray-200"><div className="flex items-center justify-between h-16 px-4 border-b border-gray-200"><h1 className="text-2xl font-bold text-[#1A3A32]">NafasBumi</h1></div><div className="flex flex-col flex-grow p-4 overflow-y-auto"><div className="mb-4"><h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Informasi</h2>{ALL_CHANNELS.filter(c => c.type === 'info').map(renderChannel)}</div><div><h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Umum</h2>{ALL_CHANNELS.filter(c => c.type === 'general').map(renderChannel)}</div></div><div className="p-4 border-t border-gray-200"><div className="flex items-center justify-between"><div className="flex items-center"><img className="h-10 w-10 rounded-full object-cover" src={user.photoURL} alt={user.displayName} /><p className="ml-3 text-sm font-semibold text-gray-800">{user.displayName}</p></div><button onClick={handleSignOut} className="p-2 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200" title="Keluar"><i className="fas fa-sign-out-alt"></i></button></div></div></div>);
};

// --- KOMPONEN: Area Chat Tengah ---
const ChatArea = ({ user, activeChannel, onViewProfile, allUsers, typingUsers }) => {
    const [messages, setMessages] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const messagesEndRef = useRef(null);
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    useEffect(() => { setIsUserAdmin(ADMIN_UIDS.includes(user.uid)); }, [user.uid]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typingUsers]);
    useEffect(() => { if (!activeChannel || !db) return; setReplyingTo(null); const unsub = onSnapshot(query(collection(db, "channels", activeChannel, "messages"), orderBy("timestamp", "asc")), (snapshot) => setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))); return () => unsub(); }, [activeChannel]);

    const handleDeleteMessage = async (messageId) => { if (!activeChannel || !window.confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return; try { await deleteDoc(doc(db, "channels", activeChannel, "messages", messageId)); } catch (error) { console.error("Error deleting message: ", error); } };

    return (<div className="flex flex-col flex-grow bg-gray-50 overflow-hidden"><div className="flex-shrink-0 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm"><div className="flex items-center"><i className="fas fa-hashtag fa-lg text-gray-400 mr-3"></i><h2 className="text-xl font-semibold text-gray-700">{activeChannel}</h2></div></div><div className="flex-grow p-6 overflow-y-auto min-h-0">{messages.map(msg => <Message key={msg.id} message={msg} isSent={msg.uid === user.uid} onViewProfile={onViewProfile} onDelete={() => handleDeleteMessage(msg.id)} onReply={() => setReplyingTo(msg)} />)}<div ref={messagesEndRef} /></div><div className="flex-shrink-0 px-6 pb-2 h-6">{typingUsers.length > 0 && <div className="text-sm text-gray-500 animate-pulse">{typingUsers.map(u => u.displayName).join(', ')} sedang mengetik...</div>}</div><div className="flex-shrink-0"><MessageInput user={user} activeChannel={activeChannel} isUserAdmin={isUserAdmin} replyingTo={replyingTo} setReplyingTo={setReplyingTo} allUsers={allUsers}/></div></div>);
};

// --- RENDER TEXT DENGAN TAG & FORMAT ---
const renderFormattedText = (text) => {
    const escapeHtml = (unsafe) => unsafe ? unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
    const formattedText = escapeHtml(text)
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/~(.*?)~/g, '<del>$1</del>')
        .replace(/(@everyone)/g, '<strong class="bg-amber-300 text-amber-800 px-2 py-0.5 rounded-lg">$1</strong>')
        .replace(/(@[\w\s]+)/g, '<strong class="bg-green-100 text-green-800 px-1 py-0.5 rounded">$1</strong>');
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
};

// --- KOMPONEN: Satu Pesan ---
const Message = ({ message, isSent, onViewProfile, onDelete, onReply }) => { const { text, displayName, photoURL, timestamp, uid, isAdmin, replyTo } = message; return (<div className={`group flex items-start mb-2 ${isSent ? 'justify-end' : 'justify-start'}`}>{!isSent && <img onClick={() => onViewProfile(message)} className="h-10 w-10 rounded-full object-cover mr-3 cursor-pointer self-start transition-transform hover:scale-110" src={photoURL} alt={displayName} />}<div className={`flex items-center gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}><div className="flex-shrink-0 order-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2"><button onClick={onReply} className="p-1 text-gray-400 hover:text-[#1A3A32]" title="Balas"><i className="fas fa-reply"></i></button>{isSent && <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500" title="Hapus"><i className="fas fa-trash"></i></button>}</div><div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} order-0 min-w-0`}><div className="flex items-center mb-1">{!isSent && <span className="font-semibold mr-2 text-sm text-gray-800">{displayName}</span>}{isAdmin && <span className="text-xs font-bold text-yellow-800 bg-yellow-300 px-1.5 py-0.5 rounded-full mr-2">ADMIN</span>}<span className="text-xs text-gray-400">{timestamp?.toDate().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span></div>{replyTo && (<div className="text-xs bg-gray-100 border-l-2 border-[#2F5247] p-2 rounded-md mb-1 w-full opacity-80"><strong className="text-gray-600">Membalas {replyTo.displayName}</strong>: <span className="text-gray-500 italic">"{replyTo.text.substring(0, 50)}..."</span></div>)}<div className={`${isSent ? 'bg-[#1A3A32] text-white' : 'bg-white'} p-3 rounded-lg shadow-sm max-w-md`}>{text && <p className="break-words">{renderFormattedText(text)}</p>}</div></div></div>{isSent && <img onClick={() => onViewProfile(message)} className="h-10 w-10 rounded-full object-cover ml-3 cursor-pointer self-start transition-transform hover:scale-110" src={photoURL} alt={displayName} />}</div>); };

// --- KOMPONEN: Input Pesan (VERSI BARU DENGAN AI CANGGIH) ---
const MessageInput = ({ user, activeChannel, isUserAdmin, replyingTo, setReplyingTo, allUsers }) => { 
    const [text, setText] = useState(''); 
    const [isGenerating, setIsGenerating] = useState(false);
    const [tagSuggestions, setTagSuggestions] = useState([]); 
    const inputRef = useRef(null); 
    
    useEffect(() => { if(replyingTo) inputRef.current.focus(); }, [replyingTo]); 
    
    const handleInputChange = (e) => { 
        const value = e.target.value; 
        setText(value); 
        const lastWord = value.split(' ').pop(); 
        if (lastWord.startsWith('@')) { 
            const searchTerm = lastWord.substring(1).toLowerCase();
            let suggestions = allUsers.filter(u => u.displayName.toLowerCase().includes(searchTerm) && u.uid !== user.uid);
            if (isUserAdmin && 'everyone'.includes(searchTerm)) {
                suggestions.unshift({ uid: 'everyone-tag', displayName: 'everyone', photoURL: 'https://placehold.co/100x100/f59e0b/FFFFFF?text=ALL' });
            }
            setTagSuggestions(suggestions);
        } else { 
            setTagSuggestions([]); 
        } 
    }; 
    
    const handleTagSelect = (displayName) => { 
        const words = text.split(' '); 
        words.pop(); 
        words.push(`@${displayName} `); 
        setText(words.join(' ')); 
        setTagSuggestions([]); 
        inputRef.current.focus(); 
    }; 
    
    const handleSendMessage = async (e) => { 
        e.preventDefault(); 
        if (text.trim() === "" || (INFO_CHANNELS.includes(activeChannel) && !isUserAdmin)) return; 
        let messageData = { text, timestamp: serverTimestamp(), uid: user.uid, displayName: user.displayName, photoURL: user.photoURL, isAdmin: isUserAdmin }; 
        if (replyingTo) { 
            messageData.replyTo = { id: replyingTo.id, displayName: replyingTo.displayName, text: replyingTo.text }; 
        } 
        await addDoc(collection(db, "channels", activeChannel, "messages"), messageData); 
        setText(''); 
        setReplyingTo(null); 
    }; 
    
    const handleGenerateAISuggestion = async () => {
        setIsGenerating(true);
        const prompt = text.trim() === '' 
            ? 'Kamu adalah teman diskusi di forum lingkungan bernama NafasBumi. Tulis satu ide singkat dan inspiratif untuk memulai diskusi tentang aksi ramah lingkungan sehari-hari. Gunakan gaya bahasa yang santai dan alami, seolah-olah kamu adalah anggota forum, bukan AI. Hindari penggunaan daftar atau bullet point.' 
            : `Kamu adalah teman diskusi di forum lingkungan bernama NafasBumi. Seseorang baru saja menulis: "${text}". Lanjutkan percakapan ini dengan memberikan tanggapan singkat, suportif, dan inspiratif. Berikan satu ide terkait atau pertanyaan lanjutan. Gunakan gaya bahasa yang santai dan alami, seolah-olah kamu adalah anggota forum, bukan AI. Hindari penggunaan daftar atau bullet point.`;

        // ======================================================================
        // PENTING: GANTI BAGIAN INI DENGAN API KEY ANDA
        // DAPATKAN DARI: https://aistudio.google.com/
        const apiKey = "AIzaSyDyIlvgZMqeou1D_w9a_iAsOIQaFdd4NQw"; 
        // ======================================================================
        
        // if (apiKey === "AIzaSyDyIlvgZMqeou1D_w9a_iAsOIQaFdd4NQw") {
        //     alert("Harap masukkan API Key Gemini Anda di dalam kode komponen MessageInput.");
        //     setIsGenerating(false);
        //     return;
        // }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

        try {
            const response = await fetch(apiUrl, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            let suggestion = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (suggestion) {
                suggestion = suggestion.replace(/[*#]/g, '').trim();
                setText(suggestion);
            } else {
                 setText("Maaf, AI tidak memberikan saran saat ini. Coba lagi.");
            }
        } catch (error) {
            console.error("AI Error:", error);
            setText("Maaf, terjadi kesalahan saat menghubungi AI.");
        } finally {
            setIsGenerating(false);
            inputRef.current.focus();
        }
    };

    return (
        <div className="bg-white p-4 border-t border-gray-200 relative">
            {tagSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-t-lg shadow-lg max-h-40 overflow-y-auto z-10">
                    {tagSuggestions.map(u => (
                        <div key={u.uid} onClick={() => handleTagSelect(u.displayName)} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                            <img src={u.photoURL} alt={u.displayName} className="w-8 h-8 rounded-full mr-2"/>
                            <span>{u.displayName}</span>
                            {u.uid === 'everyone-tag' && <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-200 px-2 py-1 rounded-full">SEMUA</span>}
                        </div>
                    ))}
                </div>
            )}
            {replyingTo && (
                <div className="text-sm bg-gray-100 p-2 rounded-t-md -mb-1 flex justify-between items-center transition-all duration-300">
                    <div className="truncate pl-2"> Membalas <strong>{replyingTo.displayName}</strong>: <span className="text-gray-500 italic">"{replyingTo.text.substring(0, 50)}..."</span> </div>
                    <button onClick={() => setReplyingTo(null)} className="ml-2 text-gray-500 hover:text-red-500 text-lg p-1">&times;</button>
                </div>
            )}
            <form onSubmit={handleSendMessage}>
                <div className="relative flex items-center">
                    <textarea 
                        ref={inputRef} 
                        value={text} 
                        onChange={handleInputChange} 
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) handleSendMessage(e); }} 
                        rows="1" 
                        placeholder={(INFO_CHANNELS.includes(activeChannel) && !isUserAdmin) ? "Hanya admin yang bisa mengirim pesan di sini" : "Ketik pesan, @ untuk tag, atau balas..."} 
                        className={`w-full bg-gray-100 p-3 pr-28 focus:outline-none focus:ring-2 focus:ring-[#1A3A32] resize-none transition-all duration-200 disabled:opacity-60 ${replyingTo ? 'rounded-b-lg' : 'rounded-lg'}`} 
                        disabled={(INFO_CHANNELS.includes(activeChannel) && !isUserAdmin)}
                    /> 
                    <button 
                        type="button" 
                        onClick={handleGenerateAISuggestion} 
                        disabled={isGenerating || (INFO_CHANNELS.includes(activeChannel) && !isUserAdmin)} 
                        title="Saran dari AI" 
                        className="absolute right-12 p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-star"></i>}
                    </button>
                    <button 
                        type="submit" 
                        disabled={(INFO_CHANNELS.includes(activeChannel) && !isUserAdmin) || text.trim() === ''} 
                        className="absolute right-3 bg-[#1A3A32] text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-[#2F5247] shadow-md transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    ); 
};


// --- KOMPONEN: Sidebar Kanan ---
const RightSidebar = ({ onViewProfile, allUsers, typingUsers, isUserAdmin, onDeleteUser }) => { const uniqueUsers = Array.from(new Map(allUsers.map(user => [user.uid, user])).values()); const onlineUsers = uniqueUsers.filter(u => u.isOnline); const offlineUsers = uniqueUsers.filter(u => !u.isOnline); const renderUser = (user) => { const isTyping = typingUsers.some(typingUser => typingUser.uid === user.uid); return (<div key={user.uid} className="group flex items-center p-1 rounded-md hover:bg-gray-200 cursor-pointer transition-colors duration-200"><div onClick={() => onViewProfile(user)} className="flex items-center flex-grow"><div className="relative"><img className="h-10 w-10 rounded-full object-cover" src={user.photoURL} alt={user.displayName} /><span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-white ${user.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span></div><span className="ml-3 font-medium text-gray-700">{user.displayName}</span>{isTyping && <i className="fas fa-pencil-alt text-gray-500 ml-auto text-xs animate-bounce"></i>}</div>{isUserAdmin && user.uid !== auth.currentUser.uid && (<button onClick={() => onDeleteUser(user)} className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Hapus Pengguna"><i className="fas fa-trash-alt fa-xs"></i></button>)}</div>); }; return (<div className="hidden md:flex flex-col w-72 bg-gray-100 border-l border-gray-200 p-4 space-y-6"><div><h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Online ({onlineUsers.length})</h2><div className="space-y-3">{onlineUsers.map(renderUser)}</div></div>{offlineUsers.length > 0 && (<div><h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Offline ({offlineUsers.length})</h2><div className="space-y-3 opacity-60">{offlineUsers.map(renderUser)}</div></div>)}</div>); };

// --- KOMPONEN: Modal Profil Pengguna ---
const UserProfileModal = ({ userToShow, onClose }) => (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}><div className="bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-8 relative animate-fade-in-up" onClick={e => e.stopPropagation()}><button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button><img className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-[#2F5247]" src={userToShow.photoURL} alt={userToShow.displayName} /><h3 className="text-2xl font-bold text-gray-800">{userToShow.displayName}</h3>{userToShow.isAdmin && <p className="mt-2 text-sm font-bold text-yellow-600">ADMIN</p>}<p className={`mt-2 text-sm font-semibold ${userToShow.isOnline ? 'text-green-500' : 'text-gray-400'}`}>{userToShow.isOnline ? 'Online' : 'Offline'}</p></div></div>);


// --- Komponen Tantangan Hijau ---
const ChallengeComponent = ({user}) => {
    const [activeTab, setActiveTab] = useState('challenge');
    return (
        <div className="flex flex-col flex-1 bg-gray-100 overflow-hidden">
            <div className="flex-shrink-0 bg-white border-b px-6">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('challenge')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'challenge' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Tantangan</button>
                    <button onClick={() => setActiveTab('leaderboard')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'leaderboard' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Papan Peringkat</button>
                    <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Profil Saya</button>
                </nav>
            </div>
            <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-dots">
                {activeTab === 'challenge' && <ChallengeView user={user}/>}
                {activeTab === 'leaderboard' && <LeaderboardView />}
                {activeTab === 'profile' && <ProfileView user={user} />}
            </div>
        </div>
    );
}

const ChallengeView = ({user}) => {
    const TOTAL_DAYS = 30;
    const [userData, setUserData] = useState(null);
    const [fileForCurrentLevel, setFileForCurrentLevel] = useState(null);
    const fileInputRef = useRef(null);

    const levelPositions = [
      { top: '5%', left: '10%' }, { top: '8%', left: '75%' }, { top: '15%', left: '40%' },
      { top: '23%', left: '5%' }, { top: '20%', left: '80%' }, { top: '28%', left: '50%' },
      { top: '35%', left: '20%' }, { top: '38%', left: '70%' }, { top: '45%', left: '10%' },
      { top: '48%', left: '85%' }, { top: '55%', left: '45%' }, { top: '63%', left: '5%' },
      { top: '60%', left: '75%' }, { top: '68%', left: '30%' }, { top: '75%', left: '80%' },
      { top: '78%', left: '15%' }, { top: '85%', left: '50%' }, { top: '93%', left: '5%' },
      { top: '95%', left: '90%' }, { top: '103%', left: '35%' }, { top: '110%', left: '65%' },
      { top: '115%', left: '10%' }, { top: '120%', left: '80%' }, { top: '128%', left: '40%' },
      { top: '135%', left: '15%' }, { top: '138%', left: '75%' }, { top: '145%', left: '50%' },
      { top: '153%', left: '5%' }, { top: '155%', left: '85%' }, { top: '165%', left: '25%' }
    ];

    const handleResetChallenge = async () => {
        alert("Waktu tantangan 30 hari Anda telah berakhir! Progres akan direset. Ayo mulai lagi petualangan hijaumu!");
        const challengeRef = doc(db, 'challenge_progress', user.uid);
        await setDoc(challengeRef, { ...userData, level: 0, startDate: null });
    };

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'challenge_progress', user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data.startDate) {
                    const daysSinceStart = Math.floor((new Date() - new Date(data.startDate)) / (1000 * 60 * 60 * 24));
                    if (daysSinceStart >= TOTAL_DAYS) {
                        handleResetChallenge();
                        return;
                    }
                }
                setUserData(data);
            } else {
                setUserData({ level: 0, startDate: null });
            }
        });
        return () => unsub();
    }, [user.uid]);

    const handleStartChallenge = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        await setDoc(doc(db, 'challenge_progress', user.uid), { level: 0, startDate: today.toISOString(), displayName: user.displayName, photoURL: user.photoURL });
    };
    
    const handleFileSelect = (event) => {
        if (event.target.files && event.target.files[0]) {
            setFileForCurrentLevel(event.target.files[0]);
        }
    };

    const handleCompleteLevel = async (level) => {
        await setDoc(doc(db, 'challenge_progress', user.uid), { 
            level,
            lastProof: {
                fileName: fileForCurrentLevel.name,
                fileType: fileForCurrentLevel.type,
                timestamp: new Date().toISOString()
            }
        }, { merge: true });
        
        alert(`Selamat! Anda telah menyelesaikan tantangan hari ke-${level}!`);
        setFileForCurrentLevel(null);
    };

    if (userData === null) return <div className="text-center">Memuat data tantangan...</div>;

    if (!userData.startDate) {
        return <div className="flex-1 p-10 flex items-center justify-center"><div className="bg-white rounded-2xl shadow-xl text-center p-8 max-w-sm mx-auto"><div className="w-24 h-24 bg-[#2F5247] rounded-full flex items-center justify-center mx-auto -mt-20 border-8 border-white"><i className="fas fa-leaf text-4xl text-white"></i></div><h2 className="text-3xl font-extrabold mt-4 text-gray-800">Selamat Datang!</h2><p className="text-gray-600 mt-2 mb-6">Mulai petualangan 30 hari Anda untuk menjadikan bumi tempat yang lebih baik.</p><button onClick={handleStartChallenge} className="w-full bg-[#2F5247] hover:bg-[#1A3A32] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform transform hover:scale-105">Mulai Tantangan!</button></div></div>
    }

    const daysPassed = userData.startDate ? Math.floor((new Date() - new Date(userData.startDate)) / (1000 * 60 * 60 * 24)) : -1;
    const progressPercentage = (userData.level / TOTAL_DAYS) * 100;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-md mb-8"><h2 className="text-2xl font-bold text-gray-800">Tantangan 30 Hari: Beri Nafas untuk Bumi</h2><p className="text-gray-600 mt-2">Selesaikan satu tugas setiap hari untuk membangun kebiasaan peduli lingkungan.</p><div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden"><div className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div></div><p className="text-right text-sm font-bold mt-1 text-gray-700">Level Selesai: {userData.level} dari {TOTAL_DAYS}</p></div>
            
            <div className="relative w-full" style={{ height: '320vh' }}>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden"/>

                {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map(level => {
                    const isCompleted = level <= userData.level;
                    const isCurrent = !isCompleted && level === daysPassed + 1;
                    const isMissed = !isCompleted && level <= daysPassed;
                    const isLocked = !isCompleted && !isCurrent && !isMissed;

                    let nodeClass = 'level-node w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl font-bold shadow-lg transition-all duration-300 flex-shrink-0';
                    
                    if(isCompleted) { 
                        nodeClass += ' bg-green-500 text-white border-green-700';
                    } else if (isCurrent) { 
                        nodeClass += ' bg-blue-500 text-white border-blue-700 cursor-pointer hover:scale-110 animate-pulse-slow';
                    } else if (isMissed) {
                        nodeClass += ' bg-red-500 text-white border-red-700 opacity-70';
                    } else { 
                        nodeClass += ' bg-gray-200 text-gray-400 border-gray-300';
                    }
                    
                    const position = levelPositions[level - 1] || { top: '0', left: '0' };

                    const handleNodeClick = () => {
                        if(isCurrent) {
                            fileInputRef.current.click();
                        }
                    };

                    return (
                      <div 
                          key={level} 
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                          style={{ top: position.top, left: position.left }}
                      >
                          <div className="absolute bottom-full mb-2 px-3 py-1 bg-gray-800 text-white rounded-md text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                              Hari {level}
                          </div>

                          <div className={nodeClass} onClick={handleNodeClick}>
                              {level}
                          </div>
                          
                          <div className="relative mt-2 h-8 flex items-center justify-center">
                              {isCurrent && fileForCurrentLevel && (
                                  <button onClick={() => handleCompleteLevel(level)} className="px-4 py-1 bg-green-600 text-white rounded-full text-xs shadow-lg hover:bg-green-700 transition-all animate-bounce">
                                      Selesaikan!
                                  </button>
                              )}
                          </div>
                      </div>
                    );
                })}
            </div>
        </div>
    );
};

const LeaderboardView = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    useEffect(() => {
        const q = query(collection(db, 'challenge_progress'), orderBy('level', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            setLeaderboard(snapshot.docs.map(doc => doc.data()));
        });
        return () => unsub();
    }, []);

    return <div className="max-w-2xl mx-auto"><div className="bg-white p-6 rounded-2xl shadow-md"><h2 className="text-2xl font-bold mb-4">Papan Peringkat</h2><p className="text-gray-500 mb-6">Lihat siapa yang paling bersemangat dalam tantangan ini!</p><div className="space-y-4">{leaderboard.map((user, index) => <div key={user.uid || index} className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm"><span className="text-lg font-bold text-gray-500 mr-4 w-8 text-center">{index+1}</span><img src={user.photoURL} alt="Avatar" className="w-10 h-10 rounded-full mr-4"/><span className="font-bold flex-1">{user.displayName}</span><span className="text-green-600 font-bold">{user.level} Level</span></div>)}</div></div></div>
};

const ProfileView = ({user}) => {
    const [userData, setUserData] = useState(null);
     useEffect(() => {
        const unsub = onSnapshot(doc(db, 'challenge_progress', user.uid), (doc) => {
            if (doc.exists()) setUserData(doc.data());
        });
        return () => unsub();
    }, [user.uid]);
    
    if(!userData) return <div className="text-center">Memuat profil...</div>

    const daysPassed = userData.startDate ? Math.floor((new Date() - new Date(userData.startDate)) / (1000 * 60 * 60 * 24)) : 0;
    const missedLevels = daysPassed - userData.level;

    return <div className="max-w-2xl mx-auto"><div className="bg-white p-8 rounded-2xl shadow-md text-center"><img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-blue-400"/><h2 className="text-3xl font-bold">{user.displayName}</h2><p className="text-gray-500">Bergabung Sejak: {userData.startDate ? new Date(userData.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p><div className="mt-6 border-t pt-6"><h3 className="text-xl font-bold mb-4">Statistik Saya</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="text-center bg-green-50 p-4 rounded-lg"><p className="text-3xl font-bold text-green-600">{userData.level}</p><p className="text-gray-500">Selesai</p></div><div className="text-center bg-red-50 p-4 rounded-lg"><p className="text-3xl font-bold text-red-600">{missedLevels > 0 ? missedLevels : 0}</p><p className="text-gray-500">Terlewat</p></div><div className="text-center bg-blue-50 p-4 rounded-lg"><p className="text-3xl font-bold text-blue-600">{Math.floor(userData.level / 5)}</p><p className="text-gray-500">Lencana</p></div></div></div></div></div>
};

// --- CSS Kustom untuk Tantangan & Animasi ---
const style = document.createElement('style');
style.textContent = `
    .bg-dots {
      background-color: #f9fafb;
      background-image: radial-gradient(#d1d5db 1px, transparent 1px);
      background-size: 16px 16px;
    }
    @keyframes pulse-slow { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); } }
    .animate-pulse-slow { animation: pulse-slow 2s infinite; }
    @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
`;
document.head.append(style);