import Navbar from './Navbar';
import { Container } from 'react-bootstrap';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>
        <Container className="py-4">
          {children}
        </Container>
      </main>
      <footer className="bg-dark text-light py-4 mt-5">
        <Container>
          <div className="row">
            <div className="col-md-6">
              <h5 className="mb-3">BioPhase Solutions</h5>
              <p className="text-secondary mb-0">
                Premium biomedical products for research and clinical applications.
              </p>
            </div>
            <div className="col-md-3">
              <h6 className="mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                <li><a href="/" className="text-secondary text-decoration-none">Products</a></li>
                <li><a href="/cart" className="text-secondary text-decoration-none">Cart</a></li>
              </ul>
            </div>
            <div className="col-md-3">
              <h6 className="mb-3">Contact</h6>
              <p className="text-secondary mb-0 small">
                info@biophase.example.com
              </p>
            </div>
          </div>
          <hr className="border-secondary" />
          <p className="text-secondary text-center mb-0 small">
            &copy; {new Date().getFullYear()} BioPhase Solutions. All rights reserved.
          </p>
        </Container>
      </footer>
    </>
  );
}
