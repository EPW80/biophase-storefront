import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found — BioPhase Solutions</title>
      </Head>

      <div className="text-center py-5 fade-in">
        <h1 className="display-1 fw-bold text-primary mb-0">404</h1>
        <h2 className="h4 text-dark mb-3">Page Not Found</h2>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '420px' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <Link href="/" className="btn btn-primary px-4">
          Browse Products
        </Link>
      </div>
    </>
  );
}
