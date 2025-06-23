<template>
  <div class="privacy-policy">
    <!-- Header -->
    <header class="privacy-policy__header" role="banner">
      <div class="container privacy-policy__container">
        <h1 class="privacy-policy__title">Custimoo Privacy Policy</h1>
        <p class="privacy-policy__effective-date">Effective Date: 30/04/2025</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="privacy-policy__main container" role="main">
      <p class="privacy-policy__intro">
        Custimoo ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy describes how we
        collect, use, store, and protect the personal information collected through our white-label customizer
        solution integrated on third-party websites.
      </p>

      <div class="privacy-policy__divider"></div>

      <!-- Section 1 -->
      <section id="information-we-collect" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">1. Information We Collect</h2>
        <p>
          When you use a website that integrates our customizer, we may collect the following data:
        </p>
        <ul>
          <li>
            <strong>Personal Information:</strong> Name, email address, and shipping address.
          </li>
          <li>
            <strong>User-Uploaded Assets:</strong> Logos, images, and custom artwork.
          </li>
          <li>
            <strong>Team Roster Data:</strong> Player name, number, and size preferences.
          </li>
          <li>
            <strong>Authentication Data:</strong> Information derived from JWT tokens if the
            host website has its own CRM.
          </li>
        </ul>
        <p>
          We begin collecting this data as soon as a logged-in customer enters the customizer.
        </p>
      </section>

      <!-- Section 2 -->
      <section id="how-we-collect-data" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">2. How We Collect Data</h2>
        <p>We collect data in two ways:</p>
        <ul>
          <li>
            <strong>Via Integration with Client Systems:</strong> If the host website has its
            own CRM or login system, user authentication is passed to us via JWT tokens.
          </li>
          <li>
            <strong>Direct Collection:</strong> If the host website lacks a login system, we
            collect the necessary data directly through our interface.
          </li>
        </ul>
      </section>

      <!-- Section 3 -->
      <section id="use-of-personal-data" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">3. Use of Personal Data</h2>
        <p>We use the information collected to:</p>
        <ul>
          <li>Power customization features (e.g., save designs, generate previews).</li>
          <li>Manage user accounts and saved designs.</li>
          <li>Facilitate order fulfillment and shipping.</li>
          <li>Improve the performance and reliability of our customizer.</li>
        </ul>
      </section>

      <!-- Section 4 -->
      <section id="data-sharing" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">4. Data Sharing</h2>
        <p>
          We do not share, sell, rent, or disclose your data to any third parties. All data is used solely for the
          purposes described in this policy.
        </p>
      </section>

      <!-- Section 5 -->
      <section id="data-storage-and-security" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">5. Data Storage and Security</h2>
        <p>
          All data is securely stored on Amazon Web Services (AWS) servers located in the United States. We employ
          industry-standard safeguards to protect your data from unauthorized access, disclosure, or destruction.
        </p>
      </section>

      <!-- Section 6 -->
      <section id="data-retention" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">6. Data Retention</h2>
        <p>
          We retain user data for as long as it is necessary to fulfill the purposes outlined in this policy, or as
          required by applicable law.
        </p>
      </section>

      <!-- Section 7 -->
      <section id="your-rights" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">7. Your Rights</h2>
        <p>
          In accordance with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act
          (CCPA), users may:
        </p>
        <ul>
          <li>Request access to their data.</li>
          <li>Request correction of inaccurate or incomplete data.</li>
          <li>Request deletion of their personal data.</li>
          <li>Object to the processing of their data in certain circumstances.</li>
        </ul>
        <p>
          To exercise these rights, contact us at:
          <a href="mailto:privacy@custimoo.com">privacy@custimoo.com</a>
        </p>
      </section>

      <!-- Section 8 -->
      <section id="childrens-privacy" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">8. Children's Privacy</h2>
        <p>
          Our services are not intended for children under the age of 13, and we do not knowingly collect personal
          data from children.
        </p>
      </section>

      <!-- Section 9 -->
      <section id="changes-to-this-policy" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Any changes will be posted with an updated effective date.
          Continued use of the customizer after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <!-- Section 10 -->
      <section id="contact-us" class="privacy-policy__section" tabindex="-1">
        <h2 class="privacy-policy__heading">10. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, please contact us at:</p>
        <p>
          Email:
          <a href="mailto:privacy@custimoo.com">privacy@custimoo.com</a>
        </p>
        <address class="privacy-policy__address">
          <p class="font-medium">Address:</p>
          <p>Custimoo ApS</p>
          <p>Danneskiold-Samsøes Allé 41</p>
          <p>1434 Copenhagen</p>
          <p>DENMARK</p>
        </address>
      </section>
    </main>

    <!-- Back to top button -->
    <nav
      aria-label="Back to top navigation"
      v-show="showBackToTop"
      class="privacy-policy__back-to-top-nav"
    >
      <a
        href="#"
        class="privacy-policy__back-to-top"
        aria-label="Back to top"
        tabindex="0"
        @click.prevent="scrollToTop"
        @keydown.enter.prevent="scrollToTop"
        @keydown.space.prevent="scrollToTop"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </a>
    </nav>


    <!-- Footer -->
    <footer class="privacy-policy__footer" role="contentinfo">
      <div class="container privacy-policy__container">
        <p>&copy; {{ currentYear }} Custimoo ApS. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "PrivacyPolicy",
  data() {
    return {
      currentYear: new Date().getFullYear(),
      showBackToTop: false, // Track visibility of back-to-top button
    };
  },
  methods: {
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 100; // Show after scrolling 100px
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>

<style scoped>
/* Reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
}
.privacy-policy__back-to-top {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  transition: background-color 0.3s ease;
}
.privacy-policy__back-to-top-nav {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  margin: 0;         /* ensure no margin */
  padding: 0;        /* ensure no padding */
  width: auto;       /* optional */
  height: auto;      /* optional */
}

.privacy-policy__back-to-top:hover {
  background: #ccc;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* BEM naming convention for privacy policy */
.privacy-policy__header {
  background-color: #219f84;
  color: white;
  padding: 1rem 0;
  margin-bottom: 1.5rem;
}

.privacy-policy__title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.privacy-policy__effective-date {
  font-weight: 400;
  font-size: 1rem;
  opacity: 0.9;
}

.privacy-policy__main {
  padding-bottom: 2rem;
  display: flex;
  justify-content: center;
  flex-direction: column
}

.privacy-policy__section {
  margin-bottom: 3rem;
  scroll-margin-top: 3rem; /* A little more space for anchor jumps */
  max-width: 900px;
  text-align: left;
  width: 100%;
}

.privacy-policy__intro {
  font-size: 1.15rem;
  margin-bottom: 2rem;
  line-height: 1.5;
  max-width: 900px;
}

.privacy-policy__divider {
  height: 1px;
  background-color: #e5e5e5;
  margin: 2rem 0;
}

.privacy-policy__heading {
  color: #219f84;
  font-size: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

p {
  margin-bottom: 1rem;
  line-height: 1.5;
}

ul {
  margin-left: 2rem;
  margin-bottom: 1rem;
  list-style-type: disc;
}

li {
  margin-bottom: 0.6rem;
}

strong {
  font-weight: 600;
}

a {
  color: #219f84;
  text-decoration: none;
}

a:hover,
a:focus {
  text-decoration: underline;
  outline: none;
}

.font-medium {
  font-weight: 500;
}

.privacy-policy__address {
  font-style: normal;
  margin-top: 0.5rem;
}

/* Back to top button */
.privacy-policy__back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: #219f84;
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.privacy-policy__back-to-top:hover,
.privacy-policy__back-to-top:focus {
  background-color: #1a8a73;
  text-decoration: none;
  outline: none;
}

/* Footer styles */
.privacy-policy__footer {
  background-color: #f5f5f5;
  padding: 1.5rem 0;
  text-align: center;
  color: #666;
  margin-top: 3rem;
  font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .privacy-policy__title {
font-size: 2rem;
}
.privacy-policy__heading {
font-size: 1.5rem;
}
.privacy-policy__container {
padding: 0 15px;
}
.privacy-policy__back-to-top {
width: 2.5rem;
height: 2.5rem;
}
}
</style>