import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Viewer3DGS from './pages/Viewer3DGS';
import PLYViewer from './pages/PLYViewer';
import OBJViewer from './pages/OBJViewer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/threedgs" element={<Viewer3DGS />} />
        <Route path="/obj-viewer" element={<OBJViewer />} />
        <Route path="/ply-viewer" element={<PLYViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

