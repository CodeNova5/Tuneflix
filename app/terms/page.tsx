import styles from './terms.module.css';

export default function TermsOfService() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Terms of Service</h1>

      <section>
        <h2 className={styles.sectionTitle}>1. Introduction</h2>
        <p className={styles.paragraph}>
          Welcome to Tuneflix! By accessing or using our website, you agree to be bound by these Terms of Service.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>2. Description of Service</h2>
        <p className={styles.paragraph}>
          Our website provides users with access to music and video-related content and tools.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>3. User Conduct</h2>
        <p className={styles.paragraph}>
          You agree not to misuse our services. This includes, but is not limited to, attempting to extract data, reverse engineering any part of the site, or using the website for unlawful activities.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>4. Intellectual Property</h2>
        <p className={styles.paragraph}>
          All trademarks, logos, and content referenced on this site are the property of their respective owners. We do not claim ownership over any third-party intellectual property displayed through our services.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>5. Limitation of Liability</h2>
        <p className={styles.paragraph}>
          Our website is provided “as is” without warranties of any kind. We are not liable for any losses or damages resulting from the use of this service.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>6. Modifications</h2>
        <p className={styles.paragraph}>
          We reserve the right to modify these Terms of Service at any time. Any changes will be posted on this page. Continued use of the website after changes constitutes your acceptance of the updated terms.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>7. Disclaimer</h2>
        <p className={styles.paragraph}>
          Tuneflix may feature or reference copyrighted material such as music, video thumbnails, images, or descriptions for informational, educational, or promotional purposes. We do not claim ownership of any such content. All rights to the original content belong to their respective creators, artists, copyright holders, or platforms. Use of this material is not intended to infringe on any rights but to acknowledge and promote the work of its rightful owners.
        </p>
      </section>
      <section>
        <h2 className={styles.sectionTitle}>8. Third-Party Links</h2>
        <p className={styles.paragraph}>
          Our website may contain links to third-party websites. We are not responsible for the content or practices of these sites. Your use of any third-party site is at your own risk.
        </p>  
      </section>

      <section>
        <h2 className={styles.sectionTitle}>9. DMCA Policy</h2>
        <p className={styles.paragraph}>
          We respect the intellectual property rights of others. If you believe your copyrighted material has been used in a way that constitutes copyright infringement, please contact us at codenova02@gmail.com with the appropriate details for removal in accordance with the DMCA.
        </p>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>10. Contact</h2>
        <p className={styles.paragraph}>
          If you have any questions about these Terms of Service, please contact us at codenova02@gmail.com.
        </p>
      </section>
    </div>
  );
}
