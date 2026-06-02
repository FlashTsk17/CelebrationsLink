  import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import BirthdayLink from './pages/BirthdayLink.jsx'
import FeteMeres from './pages/FeteMeres.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/birthday" element={<BirthdayLink />} />
        <Route path="/fete-meres" element={<FeteMeres />} />
      </Routes>
    </BrowserRouter>
  )
}
