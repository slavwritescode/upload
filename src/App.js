import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import './App.css';

import LoginPage from './components/LoginPage';
import RegistrationForm from './components/RegistrationForm';
import Navbar from './components/Navbar';
import VideoTagging from './components/VideoTagging';

function App() {
  const [userId, setUserId] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showDeliveryTargetsTable, setShowDeliveryTargetsTable] = useState(false);

  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.userInfo.value) || {};
  const role = userInfo['role'];

  function getElement(path) {

    switch (path) {
      case "/":
        return <span>Blank...</span>;

      case "/login":
        return <LoginPage setUserId={setUserId} />;

      case "/registration-form":
        return <RegistrationForm />;

      case "/video-tagging":
        return <VideoTagging />;

      default:
        return null;
    }
  }

  return <div id="mainApplication">
    {/**userInfo['role'] &&  was here */}
    {<Navbar
      setUserId={setUserId}
      showStats={showStats}
      setShowStats={setShowStats}
      showLog={showLog}
      setShowLog={setShowLog}
      showDeliveryTargetsTable={showDeliveryTargetsTable}
      setShowDeliveryTargetsTable={setShowDeliveryTargetsTable}
    />}
    <Routes>
      <Route path="/" element={getElement("/registration-form")} />
      <Route path="/login" element={(userId && Object.keys(userInfo || {}).length > 0) ? getElement("/qa-tool") : getElement("/login")} />
      <Route path="/registration-form" element={getElement("/registration-form")} />
      <Route path="/video-tagging" element={getElement("/video-tagging")} />
      <Route path="/test" element={(userId && Object.keys(userInfo || {}).length > 0) ? getElement("/test") : getElement("/login")} />

    </Routes>
    {/* {showStats && <Stats setShowStats={setShowStats} />}
    {showLog && <Log showLog={showLog} setShowLog={setShowLog} />}
    {showDeliveryTargetsTable && <DeliveryTargetsTable setShowDeliveryTargetsTable={setShowDeliveryTargetsTable} />} */}
  </div>
}

export default App;
