import '@/styles/bootstrap-overrides.scss';
import '@/styles/globals.css';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { CartProvider } from '@/lib/cartContext';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <CartProvider>
        <ErrorBoundary>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ErrorBoundary>
      </CartProvider>
    </>
  );
}
