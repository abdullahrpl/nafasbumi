import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tentang from './pages/Tentang';
import Wawasan from './pages/Wawasan';
import Aksi from './pages/Aksi';
import Forum from './pages/Forum';
import Admin from './pages/Admin';
import DaftarAnggota from './pages/DaftarAnggota';
import DaftarVolunteer from './pages/DaftarVolunteer';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/tentang" element={<Layout><Tentang /></Layout>} />
                <Route path="/wawasan" element={<Layout><Wawasan /></Layout>} />
                <Route path="/aksi" element={<Layout><Aksi /></Layout>} />
                <Route path="/forum" element={<Layout hideNavbarAndFooter={true}><Forum /></Layout>} />
                <Route path="/admin" element={<Layout hideNavbarAndFooter={true}><Admin /></Layout>} />
                <Route path="/daftar-anggota" element={<Layout><DaftarAnggota /></Layout>} />
                <Route path="/daftar-volunteer" element={<Layout><DaftarVolunteer /></Layout>} />
            </Routes>
        </Router>
    );
}
