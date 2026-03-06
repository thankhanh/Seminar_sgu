import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SidebarLayout from './layouts/SidebarLayout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SidebarLayout />}>
          <Route index element={<Dashboard />} />
          {/* Placeholder routes for future development */}
          <Route path="stores" element={<div className="p-8"><h1>Quản lý gian hàng (Sắp ra mắt)</h1></div>} />
          <Route path="products" element={<div className="p-8"><h1>Quản lý sản phẩm (Sắp ra mắt)</h1></div>} />
          <Route path="orders" element={<div className="p-8"><h1>Quản lý đơn hàng (Sắp ra mắt)</h1></div>} />
          <Route path="users" element={<div className="p-8"><h1>Quản lý người dùng (Sắp ra mắt)</h1></div>} />
          <Route path="analytics" element={<div className="p-8"><h1>Báo cáo phân tích (Sắp ra mắt)</h1></div>} />
          <Route path="settings" element={<div className="p-8"><h1>Cài đặt hệ thống (Sắp ra mắt)</h1></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
