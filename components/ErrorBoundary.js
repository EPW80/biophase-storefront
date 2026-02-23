import { Component } from 'react';
import { Container, Button } from 'react-bootstrap';

/**
 * Catches uncaught React rendering errors and shows a recovery UI
 * instead of a white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // TODO: Send to error reporting service (e.g. Sentry) in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5 text-center">
          <div className="mx-auto" style={{ maxWidth: '480px' }}>
            <h1 className="h3 mb-3">Something went wrong</h1>
            <p className="text-muted mb-4">
              An unexpected error occurred. Please try again or return to the
              home page.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button variant="primary" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="outline-secondary" href="/">
                Go Home
              </Button>
            </div>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}
