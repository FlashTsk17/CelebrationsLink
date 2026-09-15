import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import BirthdayLink from './pages/BirthdayLink.jsx'
import FeteMeres from './pages/FeteMeres.jsx'
import Organiser from './pages/Organiser.jsx'
import Celebrer from './pages/Celebrer.jsx'
import ComingSoon from './pages/ComingSoon.jsx'
import './styles/app.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/organiser" element={<Organiser />} />
        <Route path="/organiser/type" element={<ComingSoon title="Choisir le type d’événement" />} />
        <Route path="/organiser/annonce" element={<ComingSoon title="Créer une annonce" />} />
        <Route path="/organiser/invitation" element={<ComingSoon title="Créer une invitation" />} />
        <Route path="/celebrer" element={<Celebrer />} />
        <Route path="/celebrer/type" element={<ComingSoon title="Choisir une occasion" />} />
        <Route path="/celebrer/personnaliser" element={<ComingSoon title="Personnaliser ton vœu" />} />
        <Route path="/e/:slug" element={<ComingSoon title="Événement" />} />
        <Route path="/c/:slug" element={<ComingSoon title="Célébration" />} />
        <Route path="/birthday" element={<BirthdayLink />} />
        <Route path="/fete-meres" element={<FeteMeres />} />
      </Routes>
    </BrowserRouter>
  )
}
