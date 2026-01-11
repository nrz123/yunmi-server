import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WebPage from './webpage.js'
import WebList from './weblist.js';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<WebList />} />
        <Route path="/weblist" element={<WebList />} />
        <Route path="/webpage/:pagekey" element={<WebPage />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App