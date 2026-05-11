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


import CTEContour from './pages/CTEContour';
import CTECurve from './pages/CTECurve';
import DensityCurve from './pages/DensityCurve';
import DielectricCurve from './pages/DielectricCurve';
import ModEBardellaGenna from './pages/ModEBardellaGenna';
import ModEPorfiriGupta from './pages/ModEPorfiriGupta';
import Surface3DPage from './pages/Surface3Dpage';


const App = () => {
  const SIDEBAR_ROUTES = [
    '/charts-menu',
    '/young-modulus-curve',
    '/bulk-modulus-curve',
    '/shear-modulus-curve',
    '/surface-3d'
    // '/cte-curve',
    // '/mode-porfiri-gupta',
    // '/mode-bardella-genna',
    // '/density-curve',
    // '/dielectric-curve',
    // '/cte-contour',
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

          <Route path='/surface-3d' element={<Surface3DPage />} />
          {/* <Route path="/cte-curve" element={<CTECurve />} />
          <Route path="/mode-porfiri-gupta" element={<ModEPorfiriGupta />} />
          <Route path="/mode-bardella-genna" element={<ModEBardellaGenna />} />
          <Route path="/density-curve" element={<DensityCurve />} />
          <Route path="/dielectric-curve" element={<DielectricCurve />} />
          <Route path="/cte-contour" element={<CTEContour />} /> */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
