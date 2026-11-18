import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Builder } from './pages/Builder';
import { Landing } from './pages/Landing';
import { NotFound } from './pages/NotFound';
import { Quiz } from './pages/Quiz';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
