'use client';

import { useEffect, useState } from 'react';

const SocialLogin = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadGoogleLogin();
        loadFacebookSDK();
    }, []);

    const loadGoogleLogin = () => {
        window.handleCredentialResponse = (response) => {
            if (response.credential) {
                const data = parseJwt(response.credential);
                console.log('Google User:', data);
                saveUserInfo('google', data);
                setUser(data);
            }
        };

        if (typeof window !== 'undefined' && window.google) {
            window.google.accounts.id.initialize({
                client_id: '847644538886-h57vcktcmjhdlj553b33js8tnenlge62',
                callback: window.handleCredentialResponse,
                cancel_on_tap_outside: false,
            });
            window.google.accounts.id.prompt();
        }
    };

    const loadFacebookSDK = () => {
        window.fbAsyncInit = function () {
            window.FB.init({
                appId: '2236984449983471_ID',
                cookie: true,
                xfbml: true,
                version: 'v17.0'
            });
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    };

    const parseJwt = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        return JSON.parse(jsonPayload);
    };

    const saveUserInfo = (provider, data) => {
        const userInfo = { provider, data };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    };

    const loginWithFacebook = () => {
        window.FB.login((response) => {
            if (response.authResponse) {
                fetchFacebookUserInfo();
            }
        }, { scope: 'public_profile,email' });
    };

    const fetchFacebookUserInfo = () => {
        window.FB.api('/me', { fields: 'id,name,email,picture.width(400).height(400)' }, (response) => {
            console.log('Facebook User:', response);
            saveUserInfo('facebook', response);
            setUser(response);
        });
    };

    return (
        <div>
            <h1>Google and Facebook Login</h1>

            {/* Google Login */}
            <h2>Google Login</h2>
            <div id="g_id_onload" data-client_id="847644538886-h57vcktcmjhdlj553b33js8tnenlge62" data-callback="handleCredentialResponse"></div>
            <div className="g_id_signin" data-type="standard"></div>

            {/* Facebook Login */}
            <h2>Facebook Login</h2>
            <button onClick={loginWithFacebook}>Login with Facebook</button>

            {/* Display User Info */}
            {user && (
                <div>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>ID: {user.id || user.sub}</p>
                    <img src={user.picture?.data?.url || user.picture} alt="Profile" />
                </div>
            )}
        </div>
    );
};

export default SocialLogin;
