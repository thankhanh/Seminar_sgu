import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './layouts/SidebarLayout';
import Dashboard from './pages/Dashboard';
import POIManagement from './pages/POIManagement';
import AudioManagement from './pages/AudioManagement';
import TourManagement from './pages/TourManagement';
import Translations from './pages/Translations';
import StoreManagement from './pages/StoreManagement';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<SidebarLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="poi" element={<POIManagement />} />
              <Route path="audio" element={<AudioManagement />} />
              <Route path="tours" element={<TourManagement />} />
              <Route path="translations" element={<Translations />} />
              <Route path="store" element={<StoreManagement />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
