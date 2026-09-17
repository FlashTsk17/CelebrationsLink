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
import ComingSoon from './pages/ComingSoon.jsx'
import './styles/app.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/organiser" element={<Organiser />} />
        <Route path="/organiser/type" element={<OrganiserType />} />
        <Route path="/organiser/annonce" element={<EventForm mode="announcement" />} />
        <Route path="/organiser/invitation" element={<EventForm mode="invitation" />} />
        <Route path="/organiser/dashboard" element={<OrganiserDashboard />} />
        <Route path="/organiser/manage" element={<OrganiserManage />} />
        <Route path="/celebrer" element={<Celebrer />} />
        <Route path="/celebrer/type" element={<ComingSoon title="Choisir une occasion" />} />
        <Route path="/celebrer/personnaliser" element={<ComingSoon title="Personnaliser ton vœu" />} />
        <Route path="/e/:slug" element={<PublicEvent />} />
        <Route path="/c/:slug" element={<ComingSoon title="Célébration" />} />
        <Route path="/birthday" element={<BirthdayLink />} />
        <Route path="/fete-meres" element={<FeteMeres />} />
      </Routes>
    </BrowserRouter>
  )
}
