import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import BirthdayLink from './pages/BirthdayLink.jsx'
import FeteMeres from './pages/FeteMeres.jsx'
import Organiser from './pages/Organiser.jsx'
import OrganiserType from './pages/OrganiserType.jsx'
import EventForm from './pages/EventForm.jsx'
import PublicEvent from './pages/PublicEvent.jsx'
import OrganiserDashboard from './pages/OrganiserDashboard.jsx'
import OrganiserManage from './pages/OrganiserManage.jsx'
import Celebrer from './pages/Celebrer.jsx'
import CelebrationCreate from './pages/CelebrationCreate.jsx'
import CelebrationType from './pages/CelebrationType.jsx'
import Celebration from './pages/Celebration.jsx'
import MemberAuth from './pages/MemberAuth.jsx'
import MemberSpace from './pages/MemberSpace.jsx'
import Premium from './pages/Premium.jsx'
import AdminPremium from './pages/AdminPremium.jsx'
import ComingSoon from './pages/ComingSoon.jsx'
import AppNavigation from './components/AppNavigation.jsx'
import './styles/app.css'

export default function App() {
  return <BrowserRouter><AppNavigation /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/membre" element={<MemberAuth />} />
    <Route path="/membre/espace" element={<MemberSpace />} />
    <Route path="/premium" element={<Premium />} />
    <Route path="/admin/premium" element={<AdminPremium />} />
    <Route path="/organiser" element={<Organiser />} />
    <Route path="/organiser/type" element={<OrganiserType />} />
    <Route path="/organiser/annonce" element={<EventForm mode="announcement" />} />
    <Route path="/organiser/invitation" element={<EventForm mode="invitation" />} />
    <Route path="/organiser/dashboard" element={<OrganiserDashboard />} />
    <Route path="/organiser/manage" element={<OrganiserManage />} />
    <Route path="/celebrer" element={<Celebrer />} />
    <Route path="/celebrer/type" element={<CelebrationType />} />
    <Route path="/celebrer/personnaliser" element={<CelebrationCreate />} />
    <Route path="/e/:slug" element={<PublicEvent />} />
    <Route path="/c/:slug" element={<Celebration />} />
    <Route path="/birthday" element={<BirthdayLink />} />
    <Route path="/fete-meres" element={<FeteMeres />} />
    <Route path="*" element={<ComingSoon />} />
  </Routes></BrowserRouter>
}
