import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, getAuth, } from 'firebase/auth';
import { auth } from '../../firebase/config';
import md5 from 'md5';
import { useNavigate } from 'react-router-dom';
import './index.css';

const LoginPage = ({ setUserId }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidden, setHidden] = useState(true);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        console.log(e, email, password, 'credentials');


        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Email and password are required',
            });
            return;
        }
        try {
            // const videoIdRunningNumber = await realtimeDb.ref('/lastVideoId').transaction((currentValue) =>
            await signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    const uid = user.uid;
                    navigate('/video-tagging', { state: { uid } });
                })
        } catch (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Error Signing In',
                footer: error.message
            });
        }
    }

    useEffect(() => {
        const handleLocationChange = async () => {
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const e = urlParams.get('e');
            const p = urlParams.get('p');
            const c = urlParams.get('c');
            if (e && p && c) {
                if (c === md5(e + 'p' + p)) handleLogin(false, e, p);
            } else {
                setHidden(false);
            }
        };

        window.addEventListener('popstate', handleLocationChange);
        handleLocationChange();

        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    const resetPassword = () => {

        const auth = getAuth();
        sendPasswordResetEmail(auth, email).then((result) => {
            Swal.fire({
                icon: 'success',
                title: 'Check your inbox...',
                html: '<b>' + email + '</b>',
                footer: 'Password reset email sent'
            });
        }).catch(function (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                footer: error
            });
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUserId(currentUser ? currentUser.uid : '');
        });
        return () => unsubscribe();
    }, []);

    return <div id="loginPage">
        {!hidden && <div id="loginContainer">
            <h2>Project Tokoro</h2>
            <form onSubmit={(e) => handleLogin(e)}>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email"
                    autoFocus
                />
                <input
                    id="password"
                    type="password"
                    autoComplete="on"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="password"
                />
                <button id="loginButton" type="submit" className="log-in-button">Login</button>
                <button id="resetButton" className="pw-reset-button" onClick={(e) => { e.preventDefault(); resetPassword(); }}>Reset password</button>
            </form>
        </div>}
    </div>
}

export default LoginPage;