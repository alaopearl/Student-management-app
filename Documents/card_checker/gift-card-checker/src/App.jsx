import GiftCard from './pages/GiftCard'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminPanel from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './pages/ProtectedRoute';
// import Signup from './pages/signup';
import NotFound from './pages/PageNotFound';
function App() {
  return (
   <BrowserRouter>
    <Routes>
      <Route path="/" element={<GiftCard />} />
      <Route path="*" element={<NotFound />} />
      {/* <Route path="/xyz-u-no-fit-find-am-harsh-007" element={<Signup />} /> */}
      <Route path="/admin" element={<ProtectedRoute> <AdminPanel /> </ProtectedRoute> } />
      <Route path="/admin-login" element={<ProtectedRoute> <AdminLogin /> </ProtectedRoute>} />
    </Routes>
   </BrowserRouter>
  )
}

export default App
