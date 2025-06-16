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
    writeBatch
} from 'firebase/firestore';


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
const INFO_CHANNELS = ['Selamat Datang', 'Pengumuman', 'Saran'];
const ALL_CHANNELS = [
    { name: 'Selamat Datang', icon: 'fa-door-open', type: 'info' },
    { name: 'Pengumuman', icon: 'fa-bullhorn', type: 'info' },
    { name: 'Saran', icon: 'fa-lightbulb', type: 'info' },
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

    useEffect(() => {
        setIsUserAdmin(ADMIN_UIDS.includes(user.uid));
    }, [user.uid]);

    useEffect(() => {
        const usersQuery = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const users = snapshot.docs.map(doc => doc.data());
            setAllUsers(users);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribers = ALL_CHANNELS.map(channel => {
            if (channel.name === 'Tantangan Hijau') return () => {}; // Abaikan notifikasi untuk channel tantangan
            const messagesQuery = query(collection(db, `channels/${channel.name}/messages`));
            return onSnapshot(messagesQuery, async (snapshot) => {
                const userReadStatusRef = doc(db, `users/${user.uid}/readStatus`, channel.name);
                const userReadStatusDoc = await getDoc(userReadStatusRef);
                const lastReadTime = userReadStatusDoc.data()?.timestamp?.toMillis() || 0;
                
                let unreadCount = 0;
                let hasMention = false;

                snapshot.docs.forEach(doc => {
                    const msg = doc.data();
                    if (msg.timestamp?.toMillis() > lastReadTime) {
                        unreadCount++;
                        if (msg.text && msg.text.includes(`@${user.displayName}`)) {
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
        if (!activeChannel || activeChannel === 'Tantangan Hijau') {
            setTypingUsers([]);
            return;
        };
        const typingQuery = query(collection(db, "channels", activeChannel, "typing"));
        const unsubscribeTyping = onSnapshot(typingQuery, (snapshot) => {
            const now = Date.now();
            const typing = snapshot.docs.map(doc => doc.data()).filter(u => u.uid !== user.uid && (now - u.timestamp?.toMillis()) < 5000);
            setTypingUsers(typing);
        });
        return () => unsubscribeTyping();
    }, [activeChannel, user.uid]);

    const handleChannelChange = async (channelName) => {
        setActiveChannel(channelName);
        if (channelName !== 'Tantangan Hijau') {
            const userReadStatusRef = doc(db, `users/${user.uid}/readStatus`, channelName);
            await setDoc(userReadStatusRef, { timestamp: serverTimestamp() });
            setNotifications(prev => ({...prev, [channelName]: {count: 0, mention: false}}));
        }
    };
    
    const handleDeleteUser = async (userToDelete) => {
        if (!window.confirm(`Anda yakin ingin menghapus data pengguna "${userToDelete.displayName}" dari Firestore? Ini tidak bisa dibatalkan.`)) return;

        try {
            const userRef = doc(db, 'users', userToDelete.uid);
            await deleteDoc(userRef);
        } catch (err) {
            console.error("Gagal menghapus pengguna:", err);
        }
    }

    return (
        <div className="flex h-screen antialiased text-gray-800">
            <Sidebar user={user} activeChannel={activeChannel} setActiveChannel={handleChannelChange} notifications={notifications} />
            
            {activeChannel === 'Tantangan Hijau' ? 
              <ChallengeComponent /> 
              : 
              <ChatArea user={user} activeChannel={activeChannel} onViewProfile={setProfileModalUser} allUsers={allUsers} typingUsers={typingUsers} />
            }
            
            <RightSidebar onViewProfile={setProfileModalUser} allUsers={allUsers} typingUsers={typingUsers} isUserAdmin={isUserAdmin} onDeleteUser={handleDeleteUser}/>
            {profileModalUser && <UserProfileModal userToShow={profileModalUser} onClose={() => setProfileModalUser(null)} />}
        </div>
    );
};

// --- KOMPONEN: Sidebar Kiri ---
const Sidebar = ({ user, activeChannel, setActiveChannel, notifications }) => {
    const handleSignOut = async () => {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { isOnline: false }, { merge: true });

        const batch = writeBatch(db);
        ALL_CHANNELS.forEach(channel => {
            const typingRef = doc(db, 'channels', channel.name, 'typing', user.uid);
            batch.delete(typingRef);
        });
        await batch.commit();

        await signOut(auth);
    };

    const infoChannels = ALL_CHANNELS.filter(c => c.type === 'info');
    const generalChannels = ALL_CHANNELS.filter(c => c.type === 'general');

    const renderChannel = (channel) => {
        const notif = notifications[channel.name] || {};
        return (
            <a href="#" key={channel.name} onClick={() => setActiveChannel(channel.name)}
               className={`flex items-center justify-between p-2 rounded-lg mt-1 transition-all duration-300 ease-in-out transform hover:translate-x-1 ${activeChannel === channel.name ? 'bg-[#2F5247] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                <div className="flex items-center">
                    <i className={`fas ${channel.icon} fa-fw mr-3 w-5 text-center`}></i>
                    <span className="font-semibold">{channel.name}</span>
                </div>
                {notif.mention && <span className="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-pulse">@</span>}
                {!notif.mention && notif.count > 0 && <span className="bg-gray-300 text-gray-700 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{notif.count}</span>}
            </a>
        );
    };

    return (
        <div className="flex flex-col w-64 bg-white border-r border-gray-200">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-[#1A3A32]">NafasBumi</h1>
            </div>
            <div className="flex flex-col flex-grow p-4 overflow-y-auto">
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Informasi</h2>
                    {infoChannels.map(renderChannel)}
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Umum</h2>
                    {generalChannels.map(renderChannel)}
                </div>
            </div>
            <div className="p-4 border-t border-gray-200">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full object-cover" src={user.photoURL} alt={user.displayName} />
                        <p className="ml-3 text-sm font-semibold text-gray-800">{user.displayName}</p>
                    </div>
                    <button onClick={handleSignOut} className="p-2 rounded-md text-gray-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200" title="Keluar">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- KOMPONEN: Area Chat Tengah ---
const ChatArea = ({ user, activeChannel, onViewProfile, allUsers, typingUsers }) => {
    const [messages, setMessages] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const messagesEndRef = useRef(null);
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    useEffect(() => {
        setIsUserAdmin(ADMIN_UIDS.includes(user.uid));
    }, [user.uid]);
    
    useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, typingUsers]);

    useEffect(() => {
        if (!activeChannel || !db) return;
        setReplyingTo(null);
        const messagesQuery = query(collection(db, "channels", activeChannel, "messages"), orderBy("timestamp", "asc"));

        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        
        return () => unsubscribeMessages();
    }, [activeChannel]);

    const handleDeleteMessage = async (messageId) => {
        if (!activeChannel || !window.confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;
        const messageRef = doc(db, "channels", activeChannel, "messages", messageId);
        try { await deleteDoc(messageRef); } catch (error) { console.error("Error deleting message: ", error); }
    };

    return (
        <div className="flex flex-col flex-grow bg-gray-50">
             <div className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center"><i className="fas fa-hashtag fa-lg text-gray-400 mr-3"></i><h2 className="text-xl font-semibold text-gray-700">{activeChannel}</h2></div>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto">
                {messages.map(msg => <Message key={msg.id} message={msg} isSent={msg.uid === user.uid} onViewProfile={onViewProfile} onDelete={() => handleDeleteMessage(msg.id)} onReply={() => setReplyingTo(msg)} />)}
                <div ref={messagesEndRef} />
            </div>

            <div className="px-6 pb-2 h-6">
                {typingUsers.length > 0 && 
                    <div className="text-sm text-gray-500 animate-pulse">
                        {typingUsers.map(u => u.displayName).join(', ')} sedang mengetik...
                    </div>
                }
            </div>
            <MessageInput user={user} activeChannel={activeChannel} isUserAdmin={isUserAdmin} replyingTo={replyingTo} setReplyingTo={setReplyingTo} allUsers={allUsers}/>
        </div>
    );
};

// --- RENDER TEXT DENGAN TAG & FORMAT ---
const renderFormattedText = (text) => {
    const escapeHtml = (unsafe) => unsafe ? unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
    
    const formattedText = escapeHtml(text)
        .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        .replace(/~(.*?)~/g, '<del>$1</del>')
        .replace(/(@[\w\s]+)/g, '<strong class="bg-green-100 text-green-800 px-1 py-0.5 rounded">$1</strong>');

    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
};


// --- KOMPONEN: Satu Pesan ---
const Message = ({ message, isSent, onViewProfile, onDelete, onReply }) => {
    const { text, displayName, photoURL, timestamp, uid, isAdmin, replyTo } = message;
    
    return (
        <div className={`group flex items-start mb-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
            {!isSent && <img onClick={() => onViewProfile(message)} className="h-10 w-10 rounded-full object-cover mr-3 cursor-pointer self-start transition-transform hover:scale-110" src={photoURL} alt={displayName} />}
            <div className={`flex items-center gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0 order-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2">
                    <button onClick={onReply} className="p-1 text-gray-400 hover:text-[#1A3A32]" title="Balas"><i className="fas fa-reply"></i></button>
                    {isSent && <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500" title="Hapus"><i className="fas fa-trash"></i></button>}
                </div>
                <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} order-0`}>
                    <div className="flex items-center mb-1">
                        {!isSent && <span className="font-semibold mr-2 text-sm text-gray-800">{displayName}</span>}
                        {isAdmin && <span className="text-xs font-bold text-yellow-800 bg-yellow-300 px-1.5 py-0.5 rounded-full mr-2">ADMIN</span>}
                        <span className="text-xs text-gray-400">{timestamp?.toDate().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                    {replyTo && (
                        <div className="text-xs bg-gray-100 border-l-2 border-[#2F5247] p-2 rounded-md mb-1 w-full opacity-80">
                            <strong className="text-gray-600">Membalas {replyTo.displayName}</strong>: <span className="text-gray-500 italic">"{replyTo.text.substring(0, 50)}..."</span>
                        </div>
                    )}
                    <div className={`${isSent ? 'bg-[#1A3A32] text-white' : 'bg-white'} p-3 rounded-lg shadow-sm max-w-md`}>
                       {text && <p className="break-words">{renderFormattedText(text)}</p>}
                    </div>
                </div>
            </div>
            {isSent && <img onClick={() => onViewProfile(message)} className="h-10 w-10 rounded-full object-cover ml-3 cursor-pointer self-start transition-transform hover:scale-110" src={photoURL} alt={displayName} />}
        </div>
    );
};

// --- KOMPONEN: Input Pesan ---
const MessageInput = ({ user, activeChannel, isUserAdmin, replyingTo, setReplyingTo, allUsers }) => {
    const [text, setText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [tagSuggestions, setTagSuggestions] = useState([]);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const isInputDisabled = INFO_CHANNELS.includes(activeChannel) && !isUserAdmin;
    
    useEffect(() => {
        if(replyingTo) inputRef.current.focus();
    }, [replyingTo]);
    
    useEffect(() => {
        const updateTypingStatus = async () => {
            if (isInputDisabled) return;
            const typingRef = doc(db, 'channels', activeChannel, 'typing', user.uid);
            if (text.trim() !== '') {
                await setDoc(typingRef, { uid: user.uid, displayName: user.displayName });
            } else {
                await deleteDoc(typingRef);
            }
        };
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(updateTypingStatus, 500);
        return () => clearTimeout(typingTimeoutRef.current);
    }, [text, activeChannel, user, isInputDisabled]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setText(value);
        const lastWord = value.split(' ').pop();
        if (lastWord.startsWith('@')) {
            const searchTerm = lastWord.substring(1).toLowerCase();
            const suggestions = allUsers.filter(u => 
                u.displayName.toLowerCase().includes(searchTerm) && u.uid !== user.uid
            );
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
        if (text.trim() === "" || isInputDisabled) return;
        
        let messageData = { text, timestamp: serverTimestamp(), uid: user.uid, displayName: user.displayName, photoURL: user.photoURL, isAdmin: isUserAdmin };
        if (replyingTo) {
            messageData.replyTo = { id: replyingTo.id, displayName: replyingTo.displayName, text: replyingTo.text };
        }

        await addDoc(collection(db, "channels", activeChannel, "messages"), messageData);
        setText('');
        setReplyingTo(null);
    };

    return (
        <div className="bg-white p-4 border-t border-gray-200 relative">
            {tagSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-200 rounded-t-lg shadow-lg max-h-40 overflow-y-auto z-10">
                    {tagSuggestions.map(u => (
                        <div key={u.uid} onClick={() => handleTagSelect(u.displayName)} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
                           <img src={u.photoURL} alt={u.displayName} className="w-8 h-8 rounded-full mr-2"/>
                           <span>{u.displayName}</span>
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
            <form onSubmit={handleSendMessage} >
                <div className="relative flex items-center">
                    <textarea 
                        ref={inputRef}
                        value={text} 
                        onChange={handleInputChange} 
                        onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) handleSendMessage(e); }} 
                        rows="1" 
                        placeholder={isInputDisabled ? "Hanya admin yang bisa mengirim pesan di sini" : "Ketik pesan, @ untuk tag, atau balas..."} 
                        className={`w-full bg-gray-100 p-3 pr-28 focus:outline-none focus:ring-2 focus:ring-[#1A3A32] resize-none transition-all duration-200 disabled:opacity-60 ${replyingTo ? 'rounded-b-lg' : 'rounded-lg'}`}
                        disabled={isInputDisabled}
                    />
                    <button type="submit" disabled={isInputDisabled || text.trim() === ''} className="absolute right-3 bg-[#1A3A32] text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-[#2F5247] shadow-md transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"><i className="fas fa-paper-plane"></i></button>
                </div>
            </form>
        </div>
    );
};

// --- KOMPONEN: Sidebar Kanan ---
const RightSidebar = ({ onViewProfile, allUsers, typingUsers, isUserAdmin, onDeleteUser }) => {
    const uniqueUsers = Array.from(new Map(allUsers.map(user => [user.uid, user])).values());
    const onlineUsers = uniqueUsers.filter(u => u.isOnline);
    const offlineUsers = uniqueUsers.filter(u => !u.isOnline);

    const renderUser = (user) => {
        const isTyping = typingUsers.some(typingUser => typingUser.uid === user.uid);
        return (
            <div key={user.uid} className="group flex items-center p-1 rounded-md hover:bg-gray-200 cursor-pointer transition-colors duration-200">
                <div onClick={() => onViewProfile(user)} className="flex items-center flex-grow">
                    <div className="relative">
                        <img className="h-10 w-10 rounded-full object-cover" src={user.photoURL} alt={user.displayName} />
                        <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-white ${user.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                    </div>
                    <span className="ml-3 font-medium text-gray-700">{user.displayName}</span>
                    {isTyping && <i className="fas fa-pencil-alt text-gray-500 ml-auto text-xs animate-bounce"></i>}
                </div>
                 {isUserAdmin && user.uid !== auth.currentUser.uid && (
                     <button onClick={() => onDeleteUser(user)} className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Hapus Pengguna">
                        <i className="fas fa-trash-alt fa-xs"></i>
                    </button>
                 )}
            </div>
        );
    };

    return (
        <div className="hidden md:flex flex-col w-72 bg-gray-100 border-l border-gray-200 p-4 space-y-6">
            <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Online ({onlineUsers.length})</h2>
                <div className="space-y-3">{onlineUsers.map(renderUser)}</div>
            </div>
            {offlineUsers.length > 0 && (
                 <div>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Offline ({offlineUsers.length})</h2>
                    <div className="space-y-3 opacity-60">{offlineUsers.map(renderUser)}</div>
                </div>
            )}
        </div>
    );
};

// --- KOMPONEN: Modal Profil Pengguna ---
const UserProfileModal = ({ userToShow, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm text-center p-8 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
            <img className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-[#2F5247]" src={userToShow.photoURL} alt={userToShow.displayName} />
            <h3 className="text-2xl font-bold text-gray-800">{userToShow.displayName}</h3>
            {userToShow.isAdmin && <p className="mt-2 text-sm font-bold text-yellow-600">ADMIN</p>}
            <p className={`mt-2 text-sm font-semibold ${userToShow.isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                {userToShow.isOnline ? 'Online' : 'Offline'}
            </p>
        </div>
    </div>
);


// --- Komponen Tantangan Hijau ---
const ChallengeComponent = () => {
    const TOTAL_DAYS = 30;
    const [userData, setUserData] = useState({ level: 0, startDate: null });
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    useEffect(() => {
        const data = localStorage.getItem('nafasbumi_challenge');
        const loadedData = data ? JSON.parse(data) : { level: 0, startDate: null };
        setUserData(loadedData);
        if(!loadedData.startDate) {
            setIsModalOpen(true);
        }
    }, []);

    const saveUserData = (data) => {
        localStorage.setItem('nafasbumi_challenge', JSON.stringify(data));
        setUserData(data);
    };

    const handleStartChallenge = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        saveUserData({ level: 0, startDate: today.toISOString() });
        setIsModalOpen(false);
    };
    
    const handleCompleteLevel = (level) => {
        if (level > userData.level) {
            saveUserData({ ...userData, level: level });
             alert(`Selamat! Anda telah menyelesaikan tantangan hari ke-${level}!`);
        }
    };

    const daysPassed = userData.startDate ? Math.floor((new Date() - new Date(userData.startDate)) / (1000 * 60 * 60 * 24)) : -1;
    const progressPercentage = (userData.level / TOTAL_DAYS) * 100;

    if (!userData.startDate) {
         return (
            <div className="flex-1 p-10 bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl text-center p-8 max-w-sm mx-auto">
                    <div className="w-24 h-24 bg-[#2F5247] rounded-full flex items-center justify-center mx-auto -mt-20 border-8 border-white">
                        <i className="fas fa-leaf text-4xl text-white"></i>
                    </div>
                    <h2 className="text-3xl font-extrabold mt-4 text-gray-800">Selamat Datang!</h2>
                    <p className="text-gray-600 mt-2 mb-6">Mulai petualangan 30 hari Anda untuk menjadikan bumi tempat yang lebih baik. Apakah Anda siap?</p>
                    <button onClick={handleStartChallenge} className="w-full bg-[#2F5247] hover:bg-[#1A3A32] text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform transform hover:scale-105">
                        Mulai Tantangan!
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Tantangan 30 Hari: Beri Nafas untuk Bumi</h2>
                    <p className="text-gray-600 mt-2">Selesaikan satu tugas setiap hari selama 30 hari untuk membangun kebiasaan peduli lingkungan.</p>
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
                        <div className="bg-[#2F5247] h-4 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <p className="text-right text-sm font-bold mt-1 text-gray-700">Hari {userData.level} dari {TOTAL_DAYS}</p>
                </div>
                
                <div className="level-path py-8">
                    {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map(level => {
                        const isCompleted = level <= userData.level;
                        const isCurrent = level === userData.level + 1 && level <= daysPassed + 1;
                        const isLocked = !isCompleted && !isCurrent;
                        
                        let nodeClass = 'level-node w-16 h-16 rounded-full border-4 flex items-center justify-center text-xl font-bold mb-8 shadow-lg transition-all duration-300';
                        let content = <span>{level}</span>;
                        
                        if(isCompleted) {
                            nodeClass += ' bg-green-500 text-white border-green-700';
                            content = <i className="fas fa-check text-2xl"></i>;
                        } else if (isCurrent) {
                            nodeClass += ' bg-blue-500 text-white border-blue-700 cursor-pointer animate-pulse-slow';
                        } else {
                            nodeClass += ' bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed';
                            content = <i className="fas fa-lock"></i>;
                        }

                        return (
                            <div key={level} className={nodeClass} onClick={() => isCurrent && handleCompleteLevel(level)}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
};


// --- CSS Kustom untuk Tantangan ---
const challengeStyle = `
    .level-path {
        position: relative; display: flex; flex-direction: column; align-items: center;
    }
    .level-path::before {
        content: ''; position: absolute; top: 2rem; bottom: 2rem;
        left: 50%; transform: translateX(-50%); width: 4px;
        background-image: repeating-linear-gradient(to bottom, #d1d5db, #d1d5db 10px, transparent 10px, transparent 20px);
        z-index: 0;
    }
    .level-node { z-index: 1; }
    @keyframes pulse-slow {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    }
    .animate-pulse-slow { animation: pulse-slow 2s infinite; }
`;

const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in-up {
        0% { opacity: 0; transform: translateY(20px); }
        100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
        animation: fade-in-up 0.3s ease-out forwards;
    }
    ${challengeStyle}
`;
document.head.append(style);
