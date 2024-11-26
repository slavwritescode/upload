import React, { useEffect, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { auth } from '../../firebase/config'
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { realtimeDb } from '../../firebase/config';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserInfo } from '../../Redux/Features/userInfo';

import './index.css';
import telusLogo from './telusLogo.png';
import Constants from '../Constants';
import appInfo from '../../../package.json';

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
        {<a href="/registration-form" onClick={(e) => { e.preventDefault(); navigate("/registration-form"); }}>Register new moderator</a>}
        {userRole === 'moderator' ? <a href="/video-tagging" onClick={(e) => { e.preventDefault(); navigate("/video-tagging"); }}>Video Tagging</a> : ''}

        <a href="/" onClick={(e) => { e.preventDefault(); handleLogout(); navigate("/"); }}>Logout</a>
    </nav>
}

export default Navbar;