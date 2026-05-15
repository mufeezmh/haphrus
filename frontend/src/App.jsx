import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import SkinQuiz from './components/Questionnaire/SkinQuiz';
import Recommendations from './components/Dashboard/Recommendations';
import SubscriptionPage from './components/Subscription/SubscriptionPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SkinQuiz />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/subscribe" element={<SubscriptionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
