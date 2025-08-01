import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import 'leaflet/dist/leaflet.css';
import RegistroNegocioPage from './pages/RegistroNegocioPage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro-negocio" element={<RegistroNegocioPage />} />
        <Route path="/cart" element={<CartPage />} />


      </Routes>
    </Router>
  );
}

export default App;
