import { Placeholder, Card, Row, Col } from 'react-bootstrap';

/**
 * Skeleton loader for the product grid
 * @param {number} count - Number of skeleton cards to show
 */
export function ProductGridSkeleton({ count = 6 }) {
  return (
    <Row xs={1} sm={2} lg={3} className="g-4">
      {Array.from({ length: count }).map((_, i) => (
        <Col key={i}>
          <Card className="h-100 border-0 shadow-sm">
            <div
              className="bg-light"
              style={{ height: '250px', borderRadius: '0.375rem 0.375rem 0 0' }}
            />
            <Card.Body>
              <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={8} />
              </Placeholder>
              <Placeholder as="p" animation="glow">
                <Placeholder xs={4} />
              </Placeholder>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

/**
 * Skeleton loader for the product detail page
 */
export function ProductDetailSkeleton() {
  return (
    <Row className="g-4">
      <Col md={6}>
        <div
          className="bg-light rounded"
          style={{ height: '400px' }}
        />
      </Col>
      <Col md={6}>
        <Placeholder as="h1" animation="glow">
          <Placeholder xs={7} />
        </Placeholder>
        <Placeholder as="p" animation="glow" className="mt-3">
          <Placeholder xs={3} />
        </Placeholder>
        <Placeholder as="p" animation="glow" className="mt-3">
          <Placeholder xs={12} />
          <Placeholder xs={10} />
          <Placeholder xs={8} />
        </Placeholder>
        <Placeholder.Button variant="primary" xs={4} className="mt-3" />
      </Col>
    </Row>
  );
}

/**
 * Empty state component
 * @param {string} title - Heading text
 * @param {string} message - Description text
 * @param {React.ReactNode} action - Optional action button/link
 */
export function EmptyState({ title, message, action }) {
  return (
    <div className="text-center py-5">
      <div className="mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          fill="currentColor"
          className="text-muted"
          viewBox="0 0 16 16"
        >
          <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z" />
        </svg>
      </div>
      <h2 className="h4 text-dark">{title}</h2>
      <p className="text-muted mb-4">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
