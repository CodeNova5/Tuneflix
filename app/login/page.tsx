'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google: any;
    FB: any;
    fbAsyncInit: any;
    handleCredentialResponse?: (response: any) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Google script
    const googleScript = document.createElement('script');
    googleScript.src = 'https://accounts.google.com/gsi/client';
    googleScript.async = true;
    googleScript.defer = true;
    document.body.appendChild(googleScript);

    window.handleCredentialResponse = (response: any) => {
      if (response.credential) {
        const data = parseJwt(response.credential);
        saveUserInfo('google', data);
        router.push('/');
      } else {
        console.error("Error: No Google credential received.");
      }
    };

    window.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: '847644538886-h57vcktcmjhdlj553b33js8tnenlge62',
        callback: window.handleCredentialResponse,
        cancel_on_tap_outside: false,
      });
      window.google?.accounts.id.prompt();
    };

    // Facebook script
    const fbScript = document.createElement('script');
    fbScript.src = 'https://connect.facebook.net/en_US/sdk.js';
    fbScript.async = true;
    fbScript.defer = true;
    document.body.appendChild(fbScript);

    window.fbAsyncInit = () => {
      window.FB.init({
        appId: '2236984449983471',
        cookie: true,
        xfbml: true,
        version: 'v17.0',
      });

      window.FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          fetchFacebookUserInfo();
        }
      });
    };

    checkLocalStorage();
  }, []);

  const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const saveUserInfo = (provider: string, data: any) => {
    localStorage.setItem('userInfo', JSON.stringify({ provider, data }));
  };

  const checkLocalStorage = () => {
    const userInfo = localStorage.getItem('userInfo');

  };

  const loginWithFacebook = () => {
    window.FB.login((response: any) => {
      if (response.authResponse) {
        fetchFacebookUserInfo();
      } else {
        console.error('User cancelled Facebook login or did not authorize.');
      }
    }, { scope: 'public_profile,email' });
  };

  const fetchFacebookUserInfo = () => {
    window.FB.api('/me', { fields: 'id,name,email,picture.width(400).height(400)' }, (response: any) => {
      saveUserInfo('facebook', response);
      router.push('/');
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login with Google or Facebook</h1>

      <div style={styles.section}>
        <h2 style={styles.subtitle}>Google Login</h2>
        <div id="g_id_onload"
             data-client_id="847644538886-h57vcktcmjhdlj553b33js8tnenlge62"
             data-context="signin"
             data-ux_mode="popup"
             data-callback="handleCredentialResponse"
             data-auto_prompt="false"
        />
        <div className="g_id_signin" data-type="standard" />
      </div>

      <div style={styles.section}>
        <h2 style={styles.subtitle}>Facebook Login</h2>
        <button onClick={loginWithFacebook} style={styles.button}>Login with Facebook</button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    backgroundColor: '#121212', // Dark background
    color: '#FFFFFF', // White text
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '2rem',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#1E1E1E', // Slightly lighter dark background
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#1877F2', // Facebook blue
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};
