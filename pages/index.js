import Head from 'next/head';
import { Row, Col } from 'react-bootstrap';
import { getProducts } from '@/lib/shopify';
import ProductCard from '@/components/ProductCard';
import { EmptyState } from '@/components/LoadingStates';

export default function Home({ products }) {
  return (
    <>
      <Head>
        <title>BioPhase Solutions — Products</title>
        <meta
          name="description"
          content="Premium biomedical products for research and clinical applications."
        />
      </Head>

      <section className="fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Our Products</h1>
          <p className="text-muted mb-0">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        {products.length > 0 ? (
          <Row xs={1} sm={2} lg={3} className="g-4">
            {products.map((product) => (
              <Col key={product.id}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        ) : (
          <EmptyState
            title="No products found"
            message="Check back soon — we're adding new products regularly."
          />
        )}
      </section>
    </>
  );
}

export async function getStaticProps() {
  try {
    const products = await getProducts(20);
    return {
      props: { products },
      revalidate: 60, // ISR: refresh every 60 seconds
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: { products: [] },
      revalidate: 60,
    };
  }
}
