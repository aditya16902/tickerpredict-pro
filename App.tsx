
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:category/:tickerSymbol" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
