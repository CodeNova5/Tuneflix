// app/login/page.tsx (Next.js 13+ with App Router)
'use client';

import { useEffect } from 'react';

export default function LoginPage() {
  useEffect(() => {
    // Google script load
    const googleScript = document.createElement('script');
    googleScript.src = 'https://accounts.google.com/gsi/client';
    googleScript.async = true;
    googleScript.defer = true;
    document.body.appendChild(googleScript);

    // Facebook script load
    const facebookScript = document.createElement('script');
    facebookScript.src = 'https://connect.facebook.net/en_US/sdk.js';
    facebookScript.async = true;
    facebookScript.defer = true;
    facebookScript.crossOrigin = 'anonymous';
    facebookScript.id = 'facebook-jssdk';
    document.body.appendChild(facebookScript);

    // Google callback
    (window as any).handleCredentialResponse = (response: any) => {
      if (response.credential) {
        const data = parseJwt(response.credential);
        console.log('Decoded Google JWT:', data);
        saveUserInfo('google', data);
        displayGoogleUserInfo(data);
      } else {
        console.error('Error: No Google credential received.');
      }
    };

    // Facebook init
    (window as any).fbAsyncInit = function () {
      (window as any).FB.init({
        appId: '2236984449983471',
        cookie: true,
        xfbml: true,
        version: 'v17.0',
      });

      (window as any).FB.getLoginStatus(function (response: any) {
        if (response.status === 'connected') {
          fetchFacebookUserInfo();
        }
      });
    };

    // Check existing session
    checkLocalStorage();

    // Delay Google prompt init to ensure script is loaded
    setTimeout(() => {
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: '847644538886-h57vcktcmjhdlj553b33js8tnenlge62',
          callback: (window as any).handleCredentialResponse,
          cancel_on_tap_outside: false,
        });
        (window as any).google.accounts.id.prompt();
      }
    }, 1000);
  }, []);

  function parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  function saveUserInfo(provider: string, data: any) {
    localStorage.setItem('userInfo', JSON.stringify({ provider, data }));
  }

  function displayGoogleUserInfo(data: any) {
    const nameEl = document.getElementById('google-name');
    const emailEl = document.getElementById('google-email');
    const idEl = document.getElementById('google-id');
    const imgEl = document.getElementById('google-profile-img') as HTMLImageElement;

    if (nameEl) nameEl.innerText = `Name: ${data.name}`;
    if (emailEl) emailEl.innerText = `Email: ${data.email}`;
    if (idEl) idEl.innerText = `Google ID: ${data.sub}`;
    if (imgEl) imgEl.src = data.picture;
  }

  function displayFacebookUserInfo(data: any) {
    const nameEl = document.getElementById('facebook-name');
    const emailEl = document.getElementById('facebook-email');
    const idEl = document.getElementById('facebook-id');
    const imgEl = document.getElementById('facebook-profile-img') as HTMLImageElement;

    if (nameEl) nameEl.innerText = `Name: ${data.name}`;
    if (emailEl) emailEl.innerText = `Email: ${data.email}`;
    if (idEl) idEl.innerText = `Facebook ID: ${data.id}`;
    if (imgEl) imgEl.src = data.picture?.data?.url;
  }

  function checkLocalStorage() {
    const stored = localStorage.getItem('userInfo');
    if (!stored) return;
    const { provider, data } = JSON.parse(stored);
    provider === 'google'
      ? displayGoogleUserInfo(data)
      : displayFacebookUserInfo(data);
  }

  function loginWithFacebook() {
    (window as any).FB.login((response: any) => {
      if (response.authResponse) {
        fetchFacebookUserInfo();
      } else {
        console.error('User cancelled Facebook login.');
      }
    }, { scope: 'public_profile,email' });
  }

  function fetchFacebookUserInfo() {
    (window as any).FB.api('/me', { fields: 'id,name,email,picture.width(400).height(400)' }, (response: any) => {
      console.log('Facebook User Info:', response);
      saveUserInfo('facebook', response);
      displayFacebookUserInfo(response);
    });
  }

  return (
    <div>
      <h1>Google and Facebook Login Demo</h1>

      <h2>Google Login</h2>
      <div
        id="g_id_onload"
        data-client_id="847644538886-h57vcktcmjhdlj553b33js8tnenlge62"
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleCredentialResponse"
        data-auto_prompt="false"
      ></div>
      <div className="g_id_signin" data-type="standard"></div>

      <div>
        <p id="google-name">Name: </p>
        <p id="google-email">Email: </p>
        <p id="google-id">Google ID: </p>
        <img id="google-profile-img" alt="Google Profile" />
      </div>

      <h2>Facebook Login</h2>
      <button onClick={loginWithFacebook}>Login with Facebook</button>
      <div>
        <p id="facebook-name">Name: </p>
        <p id="facebook-email">Email: </p>
        <p id="facebook-id">Facebook ID: </p>
        <img id="facebook-profile-img" alt="Facebook Profile" />
      </div>
    </div>
  );
}
