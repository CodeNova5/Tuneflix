'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google: any;
    handleCredentialResponse?: (response: any) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    fetch('/api/Music/route?type=clientId')
      .then(res => res.json())
      .then(data => setGoogleClientId(data.clientId));

    const googleScript = document.createElement('script');
    googleScript.src = 'https://accounts.google.com/gsi/client';
    googleScript.async = true;
    googleScript.defer = true;
    document.body.appendChild(googleScript);

    window.handleCredentialResponse = (response: any) => {
      if (response.credential) {
        const data = parseJwt(response.credential);
        saveUserInfo(data);
        setUserInfo(data);
        setTimeout(() => {
          router.back();
        }
        , 1000);
      } else {
        console.error("Error: No Google credential received.");
      }
    };

    window.onload = () => {
      if (googleClientId && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: window.handleCredentialResponse,
          cancel_on_tap_outside: false,
        });
        window.google.accounts.id.prompt();
      }
    };

    const stored = localStorage.getItem('userInfo');
    if (stored) {
      setUserInfo(JSON.parse(stored));
    }
  }, [googleClientId]);

  const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const saveUserInfo = (data: any) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login with Google</h1>

      <div style={styles.section}>
        <h2 style={styles.subtitle}>Google Login</h2>
        {googleClientId && (
          <>
            <div
              id="g_id_onload"
              data-client_id={googleClientId}
              data-context="signin"
              data-ux_mode="popup"
              data-callback="handleCredentialResponse"
              data-auto_prompt="false"
            />
            <div className="g_id_signin" data-type="standard" />
          </>
        )}
      </div>

      {userInfo && (
        <div style={styles.section}>
          <h2 style={styles.subtitle}>User Info</h2>
          <img
            src={userInfo.picture}
            alt="Profile"
            style={{ borderRadius: '50%', width: '100px', height: '100px', marginBottom: '1rem' }}
          />
          <p><strong>Name:</strong> {userInfo.name}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>ID:</strong> {userInfo.sub}</p>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    backgroundColor: '#121212',
    color: '#FFFFFF',
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
    backgroundColor: '#1E1E1E',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
};
