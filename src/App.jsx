import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Builder } from './pages/Builder.jsx';
import { Landing } from './pages/Landing.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { Quiz } from './pages/Quiz.jsx';

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
