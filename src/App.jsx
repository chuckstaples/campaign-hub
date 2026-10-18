import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useHub } from './lib/store.jsx';
import Join from './pages/Join.jsx';
import Options from './pages/Options.jsx';
import EntryDetail from './pages/EntryDetail.jsx';
import Character from './pages/Character.jsx';
import Rolls from './pages/Rolls.jsx';
import Settings from './pages/Settings.jsx';
import DM from './pages/DM.jsx';
import DMEdit from './pages/DMEdit.jsx';

function NeedsCampaign({ children }) {
  const { mode, campaignId, ready } = useHub();
  const loc = useLocation();
  if (!ready) return <div className="shell"><p className="lede" style={{ padding: '2rem 1.25rem' }}>Opening the hub…</p></div>;
  if (mode === 'firebase' && !campaignId) return <Navigate to="/join" replace state={{ from: loc.pathname }} />;
  return children;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/options" replace />} />
        <Route path="/join" element={<Join />} />
        <Route path="/options" element={<NeedsCampaign><Options /></NeedsCampaign>} />
        <Route path="/entry/:id" element={<NeedsCampaign><EntryDetail /></NeedsCampaign>} />
        <Route path="/character" element={<NeedsCampaign><Character /></NeedsCampaign>} />
        <Route path="/rolls" element={<NeedsCampaign><Rolls /></NeedsCampaign>} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dm" element={<DM />} />
        <Route path="/dm/edit/:id" element={<DMEdit />} />
        <Route path="/dm/new/:kind" element={<DMEdit />} />
        <Route path="*" element={<Navigate to="/options" replace />} />
      </Routes>
    </HashRouter>
  );
}
