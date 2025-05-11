import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                {/* Contact Information */}
                <div style={styles.section}>
                    <h3 style={styles.heading}>Contact Information</h3>
                    <p>Email: <a href="mailto:codenova02@gmail.com" style={styles.link}>codenova02@gmail.com</a></p>
                    <p>Phone: <a href="tel:+2349072089091" style={styles.link}>+2349072089091</a></p>
                </div>

                {/* Social Media Links */}
                <div style={styles.section}>
                    <h3 style={styles.heading}>Follow Us</h3>
                    <div style={styles.socialIcons}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.icon}>
                            <FontAwesomeIcon icon={faFacebookF} size="lg" />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.icon}>
                            <FontAwesomeIcon icon={faTwitter} size="lg" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.icon}>
                            <FontAwesomeIcon icon={faInstagram} size="lg" />
                        </a>
                        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" style={styles.icon}>
                            <FontAwesomeIcon icon={faWhatsapp} size="lg" />
                        </a>
                    </div>
                </div>

                {/* Quick Navigation Links */}
                <div style={styles.section}>
                    <h3 style={styles.heading}>Quick Links</h3>
                    <ul style={styles.linkList}>
                        <li><Link href="/about" style={styles.link}>About</Link></li>
                        <li><Link href="/contact" style={styles.link}>Contact</Link></li>
                        <li><Link href="/faq" style={styles.link}>FAQ</Link></li>
                        <li><Link href="/privacy-policy" style={styles.link}>Privacy Policy</Link></li>
                        <li><Link href="/terms-of-service" style={styles.link}>Terms of Service</Link></li>
                    </ul>
                </div>
            </div>

            {/* Copyright Notice */}
            <div style={styles.copyright}>
                <p>&copy; {currentYear} Your Company Name. All rights reserved.</p>
            </div>
        </footer>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    footer: {
        backgroundColor: '#121212', // Dark background
        color: '#FFFFFF', // White text
        padding: '2rem 1rem',
        textAlign: 'center',
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    section: {
        marginBottom: '1.5rem',
        flex: '1 1 200px',
        textAlign: 'left',
    },
    heading: {
        fontSize: '1.25rem',
        marginBottom: '0.5rem',
        fontWeight: 'bold',
    },
    link: {
        color: '#1E90FF', // Light blue for links
        textDecoration: 'none',
    },
    socialIcons: {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
    },
    icon: {
        display: 'inline-block',
        width: '32px',
        height: '32px',
    },
    iconImage: {
        width: '100%',
        height: '100%',
    },
    linkList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    linkListItem: {
        marginBottom: '0.5rem',
    },
    copyright: {
        marginTop: '1.5rem',
        fontSize: '0.875rem',
        borderTop: '1px solid #333',
        paddingTop: '1rem',
    },
};