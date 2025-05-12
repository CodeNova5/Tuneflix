import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGithub,
    faLinkedin,
    faTwitter,
    faCodepen,
    faFacebookF,
    faInstagram,
    faWhatsapp,
} from '@fortawesome/free-brands-svg-icons';
import styles from '../Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>

                {/* Developer Info */}
                <section className={styles.section}>
                    <h3 className={styles.heading}>Developer</h3>
                    <ul className={styles.linkList}>
                        <li><a href="https://your-portfolio.com" target="_blank" rel="noopener noreferrer" className={styles.link}>Portfolio</a></li>
                        <li><a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className={styles.link}>GitHub</a></li>
                        <li><a href="https://www.linkedin.com/in/yourusername/" target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn</a></li>
                        <li><a href="https://codepen.io/yourusername" target="_blank" rel="noopener noreferrer" className={styles.link}>CodePen</a></li>
                    </ul>
                </section>

                {/* Stay Connected */}
                <section className={styles.section}>
                    <h3 className={styles.heading}>Stay Connected</h3>

                    <div className={styles.connectedGrid}>
                        <div className={styles.group}>
                            <p className={styles.subheading}>Social</p>
                            <div className={styles.iconRow}>
                                <a href="https://facebook.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={styles.icon}>
                                    <FontAwesomeIcon icon={faFacebookF} />
                                </a>
                                <a href="https://instagram.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.icon}>
                                    <FontAwesomeIcon icon={faInstagram} />
                                </a>
                                <a href="https://wa.me/yourwhatsapplink" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={styles.icon}>
                                    <FontAwesomeIcon icon={faWhatsapp} />
                                </a>
                                <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className={styles.icon}>
                                    <FontAwesomeIcon icon={faTwitter} />
                                </a>
                            </div>
                        </div>

                        <div className={styles.group}>
                            <p className={styles.subheading}>Developer</p>
                            <div className={styles.iconRow}>
                                <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={styles.icon}>
                                    <FontAwesomeIcon icon={faGithub} />
                                </a>
                                <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={styles.icon}>
                                    <FontAwesomeIcon icon={faLinkedin} />
                                </a>
                                <a href="https://codepen.io/yourusername" target="_blank" rel="noopener noreferrer" aria-label="CodePen" className={styles.icon}>
                                    <FontAwesomeIcon icon={faCodepen} />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Site Navigation */}
                <section className={styles.section}>
                    <h3 className={styles.heading}>Explore</h3>
                    <ul className={styles.linkList}>
                        <li><Link href="/about" className={styles.link}>About</Link></li>
                        <li><Link href="/projects" className={styles.link}>Projects</Link></li>
                        <li><Link href="/blog" className={styles.link}>Blog</Link></li>
                        <li><Link href="/privacy-policy" className={styles.link}>Privacy Policy</Link></li>
                        <li><Link href="/terms-of-service" className={styles.link}>Terms of Service</Link></li>
                    </ul>
                </section>

            </div>

            <div className={styles.copyright}>
                <p>&copy; {currentYear} Developed by Your Name. All rights reserved.</p>
            </div>
        </footer>
    );
}
