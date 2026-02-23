import Link from 'next/link';
import Navbar from './Navbar';
import { Container } from 'react-bootstrap';

export default function Layout({ children }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <Container className="py-4">
          {children}
        </Container>
      </main>
      <footer className="bg-dark text-light py-5 mt-5">
        <Container>
          <div className="row g-4">
            <div className="col-lg-5 col-md-6">
              <h5 className="mb-3">
                <span className="text-primary">Bio</span>Phase Solutions
              </h5>
              <p className="text-secondary mb-0" style={{ maxWidth: '320px' }}>
                Premium biomedical products for research and clinical
                applications. Quality you can trust.
              </p>
            </div>
            <div className="col-6 col-md-3">
              <h6 className="text-uppercase small fw-bold mb-3 letter-spacing-wide">
                Quick Links
              </h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <Link href="/" className="footer-link">
                    Products
                  </Link>
                </li>
                <li className="mb-2">
                  <Link href="/cart" className="footer-link">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-6 col-md-3">
              <h6 className="text-uppercase small fw-bold mb-3 letter-spacing-wide">
                Contact
              </h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <a
                    href="mailto:info@biophase.example.com"
                    className="footer-link"
                  >
                    info@biophase.example.com
                  </a>
                </li>
                <li className="mb-2">
                  <span className="text-secondary small">
                    Orange County, CA
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <hr className="border-secondary my-4" />
          <p className="text-secondary text-center mb-0 small">
            &copy; {new Date().getFullYear()} BioPhase Solutions. All rights
            reserved.
          </p>
        </Container>
      </footer>
    </>
  );
}
