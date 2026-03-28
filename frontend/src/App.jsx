import { BrowserRouter, Routes, Route } from 'react-router-dom'
/*import { Dashboard } from './pages/Dashboard'
import { Upload } from './pages/Upload'
import { MeetingDetail } from './pages/MeetingDetail'
*/
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/meeting/:id" element={<MeetingDetail />} />
      </Routes>
    </BrowserRouter>
  )
}