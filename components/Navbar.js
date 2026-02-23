import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  Navbar as BSNavbar,
  Nav,
  Container,
  Badge,
} from 'react-bootstrap';
import { useCart } from '@/lib/cartContext';

export default function Navbar() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [expanded, setExpanded] = useState(false);

  return (
    <BSNavbar
      bg="dark"
      variant="dark"
      expand="lg"
      sticky="top"
      expanded={expanded}
      onToggle={setExpanded}
      className="shadow-sm"
    >
      <Container>
        <Link href="/" passHref legacyBehavior>
          <BSNavbar.Brand className="fw-bold">
            <span className="text-primary">Bio</span>Phase
          </BSNavbar.Brand>
        </Link>

        <BSNavbar.Toggle aria-controls="main-navbar" />

        <BSNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <Link href="/" passHref legacyBehavior>
              <Nav.Link
                active={router.pathname === '/'}
                onClick={() => setExpanded(false)}
              >
                Products
              </Nav.Link>
            </Link>
          </Nav>

          <Nav>
            <Link href="/cart" passHref legacyBehavior>
              <Nav.Link
                active={router.pathname === '/cart'}
                onClick={() => setExpanded(false)}
                className="d-flex align-items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  className="me-1"
                  aria-hidden="true"
                >
                  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
                Cart
                {itemCount > 0 && (
                  <Badge bg="primary" pill className="ms-1">
                    {itemCount}
                  </Badge>
                )}
              </Nav.Link>
            </Link>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
