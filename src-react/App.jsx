import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Viewer3DGS from './pages/Viewer3DGS';
import PLYViewer from './pages/PLYViewer';
import OBJViewer from './pages/OBJViewer';
import ProjectsList from './pages/ProjectsList';
import ProjectCreate from './pages/ProjectCreate';
import ProjectDetails from './pages/ProjectDetails';
import RecordCreate from './pages/RecordCreate';
import AnalysesList from './pages/AnalysesList';
import AnalysisDetails from './pages/AnalysisDetails';
import AnalysisCreate from './pages/AnalysisCreate';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projetos" element={<ProjectsList />} />
        <Route path="/projetos/novo" element={<ProjectCreate />} />
        <Route path="/projetos/:id" element={<ProjectDetails />} />
        <Route path="/projetos/:id/registros/novo" element={<RecordCreate />} />
        <Route path="/projetos/:id/analises/nova" element={<AnalysisCreate />} />
        <Route path="/analises" element={<AnalysesList />} />
        <Route path="/analises/:id" element={<AnalysisDetails />} />
        <Route path="/threedgs" element={<Viewer3DGS />} />
        <Route path="/obj-viewer" element={<OBJViewer />} />
        <Route path="/ply-viewer" element={<PLYViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

