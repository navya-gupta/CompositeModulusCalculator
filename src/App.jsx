import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/shared/Layout';
import BulkModulusCurve from './pages/BulkModulusCurve';
import ChartsMenu from './pages/ChartsMenu';
import Home from './pages/Home';
import Home2 from './pages/Home2';
import Home3 from './pages/Home3';
import ShearModulusCurve from './pages/ShearModulusCurve';
import YoungModulusCurve from './pages/YoungModulusCurve';
import YoungModulusCurve2 from './pages/YoungModulusCurve2';


const App = () => {
  const SIDEBAR_ROUTES = [
    '/charts-menu',
    '/young-modulus-curve',
    '/bulk-modulus-curve',
    '/shear-modulus-curve'
  ];

  return (
    <Router>
      <Layout sidebarRoutes={SIDEBAR_ROUTES}>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/" element={<Home2 />} /> */}
          <Route path="/" element={<Home3 />} />
          <Route path='/charts-menu' element={<ChartsMenu />} />
          {/* <Route path='/young-modulus-curve' element={<YoungModulusCurve />} /> */}
          <Route path='/young-modulus-curve' element={<YoungModulusCurve2 />} />
          <Route path='/bulk-modulus-curve' element={<BulkModulusCurve />} />
          <Route path='/shear-modulus-curve' element={<ShearModulusCurve />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
