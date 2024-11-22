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
    const userInfo = useSelector((state) => state.userInfo.value || {});
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

    //might be cool to use this for admins so that when they create a moderator they can just copy paste it...
    const copyUrlToClipBoard = () => {
        const url = window.location.href.replace(origin, "https://aspen-a18cc.web.app");
        navigator.clipboard.writeText(url);
        Swal.fire({
            toast: true,
            icon: 'success',
            title: 'Copied: ' + url,
            position: 'bottom',
            width: 'unset',
            showConfirmButton: false,
            timer: 2000
        })
    }

    const updateParticipants = async () => {
        const participants = await realtimeDb.ref('/participants').once('value').then(snapshot => snapshot.val());
        let counter = 0;
        const toolTypes = Object.keys(Constants['qaToolTypes']);
        for (let toolTypeId in toolTypes) {
            const toolType = Constants['qaToolTypes'][toolTypes[toolTypeId]];
            const root = toolType['root'];
            const statusesKey = toolType['pptStatuses'];

            console.log('Processing: ' + toolType['name']);
            const messages = await realtimeDb.ref(root).once('value').then(snapshot => snapshot.val());

            for (let participantId in participants) {
                participantId = parseInt(participantId);
                const participant = participants[participantId];
                const messagesDb = participant[statusesKey] || {};

                let statuses = Object.assign({}, ...Object.keys(toolType['statuses']).map((k, i) => ({ [k]: messagesDb[i] || 0 })));
                let newStatuses = Object.assign({}, ...Object.keys(toolType['statuses']).map(k => ({ [k]: 0 })));
                Object.keys(messages).forEach(messageId => {
                    const message = messages[messageId];
                    if (participantId !== message['participantId']) return;
                    const status = message['status'] || 0;
                    newStatuses[status]++;
                });

                statuses = Object.fromEntries(
                    Object.entries(statuses).filter(([_, value]) => value !== 0)
                );

                newStatuses = Object.fromEntries(
                    Object.entries(newStatuses).filter(([_, value]) => value !== 0)
                );

                if (Object.keys(newStatuses).length === 0 && Object.keys(statuses).length === 0) continue;

                if (Object.keys(newStatuses).length === 0 && participant[statusesKey]) {
                    await realtimeDb.ref('/participants/' + participantId + '/' + statusesKey).remove();
                    console.log('Updated: ' + participantId);
                    counter++;
                } else if (JSON.stringify(statuses) !== JSON.stringify(newStatuses)) {
                    await realtimeDb.ref('/participants/' + participantId).update({ [statusesKey]: newStatuses });
                    console.log('Updated: ' + participantId);
                    counter++;
                }
            };
        };

        Swal.fire({
            title: 'Updated ' + counter + ' participants',
        });
    }

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