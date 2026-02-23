import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge } from 'react-bootstrap';
import { formatPrice } from '@/lib/shopify';

export default function ProductCard({ product }) {
  const image = product.images?.edges?.[0]?.node;
  const price = product.priceRange?.minVariantPrice;

  return (
    <Link
      href={`/products/${product.handle}`}
      className="text-decoration-none"
    >
      <Card className="product-card h-100 border-0 shadow-sm">
        <div className="product-card__image-wrapper">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              width={400}
              height={400}
              className="card-img-top product-card__image"
              sizes="(max-width: 576px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="product-card__placeholder d-flex align-items-center justify-content-center bg-light">
              <span className="text-muted">No image</span>
            </div>
          )}
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title as="h3" className="h6 mb-2 text-dark">
            {product.title}
          </Card.Title>
          {price && (
            <p className="mt-auto mb-0">
              <Badge bg="dark" className="fs-6 fw-normal">
                {formatPrice(price.amount, price.currencyCode)}
              </Badge>
            </p>
          )}
        </Card.Body>
      </Card>
    </Link>
  );
}
