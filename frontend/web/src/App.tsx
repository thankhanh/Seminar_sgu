import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SidebarLayout from './layouts/SidebarLayout';
import Dashboard from './pages/Dashboard';
import POIManagement from './pages/POIManagement';
import AudioManagement from './pages/AudioManagement';
import TourManagement from './pages/TourManagement';
import Translations from './pages/Translations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SidebarLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="poi" element={<POIManagement />} />
          <Route path="audio" element={<AudioManagement />} />
          <Route path="tours" element={<TourManagement />} />
          <Route path="translations" element={<Translations />} />
          <Route path="users" element={<div className="p-8"><h1 className="text-2xl font-bold">Quản lý người dùng</h1><p className="text-slate-500">Đang phát triển...</p></div>} />
          <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Cài đặt hệ thống</h1><p className="text-slate-500">Đang phát triển...</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
