import React, { useEffect, useState } from 'react';
import { auth } from '../../firebase/config'
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserInfo } from '../../Redux/Features/userInfo';

import './index.css';
import telusLogo from './telusLogo.png';

const Navbar = ({ setUserId, showStats, setShowStats, showLog, setShowLog, showDeliveryTargetsTable, setShowDeliveryTargetsTable }) => {
    const userInfo = useSelector((state) => state.userInfo.value) || {};
    const userId = userInfo['userId'];
    const name = userInfo['name'];
    const userRole = userInfo['role'];
    const admin = ['admin'].includes(userRole);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleLogout = async () => {
        try {
            await signOut(auth).then(() => {
                setUserId('');
                navigate("/login");
                dispatch(updateUserInfo({}));
            });
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return <nav id="navbar">
        <img src={telusLogo} alt="Telus Digital" />
        <span id="projectName">| Tokoro</span>
        {/* {userRole === 'admin' ? <a href="/registration-form" onClick={(e) => { e.preventDefault(); navigate("/registration-form"); }}>Register new moderator</a> : ''} */}
        {name && userRole === 'moderator' ? <p id="userName">Welcome, {name}</p> : ''}
        {userRole !== 'moderator' ? <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Login</a> : ''}
        {<a href="/registration-form" onClick={(e) => { e.preventDefault(); navigate("/registration-form"); }}>Register new moderator</a>}
        {userRole === 'moderator' ? <a href="/video-tagging" onClick={(e) => { e.preventDefault(); navigate("/video-tagging"); }}>Video Tagging</a> : ''}

        <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); navigate("/"); }}>Logout</a>
    </nav>
}

export default Navbar;