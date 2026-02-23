import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Row, Col, Button, Form, Breadcrumb, Alert } from 'react-bootstrap';
import { getProductByHandle, getAllProductHandles } from '@/lib/shopify';
import { formatPrice } from '@/lib/formatPrice';
import { useCart } from '@/lib/cartContext';
import { ProductDetailSkeleton } from '@/components/LoadingStates';

export default function ProductDetail({ product }) {
  const { addToCart, loading: cartLoading } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.edges?.[0]?.node || null
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedMessage, setAddedMessage] = useState(false);

  if (!product) {
    return <ProductDetailSkeleton />;
  }

  const images = product.images?.edges?.map((edge) => edge.node) || [];
  const variants = product.variants?.edges?.map((edge) => edge.node) || [];

  // Track selected value for each option (e.g. { "Size": "Small", "Color": "Red" })
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initial = {};
    if (selectedVariant?.selectedOptions) {
      selectedVariant.selectedOptions.forEach((so) => {
        initial[so.name] = so.value;
      });
    }
    return initial;
  });

  // Sanitize product description HTML
  const sanitizedDescription = product.descriptionHtml || '';

  function handleAddToCart() {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, 1);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  }

  return (
    <>
      <Head>
        <title>{product.title} — BioPhase Solutions</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.title} — BioPhase Solutions`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:type" content="product" />
        {images[0]?.url && (
          <meta property="og:image" content={images[0].url} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.title} />
        <meta name="twitter:description" content={product.description} />
        {images[0]?.url && (
          <meta name="twitter:image" content={images[0].url} />
        )}
      </Head>

      <div className="fade-in">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} href="/">
            Products
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{product.title}</Breadcrumb.Item>
        </Breadcrumb>

        <Row className="g-4 g-lg-5">
          {/* Image Gallery */}
          <Col md={6}>
            <div className="position-relative mb-3">
              {images.length > 0 ? (
                <Image
                  src={images[selectedImage].url}
                  alt={images[selectedImage].altText || product.title}
                  width={600}
                  height={600}
                  className="rounded w-100"
                  style={{ objectFit: 'cover', aspectRatio: '1/1' }}
                  priority
                />
              ) : (
                <div
                  className="bg-light rounded d-flex align-items-center justify-content-center"
                  style={{ height: '400px' }}
                >
                  <span className="text-muted">No image available</span>
                </div>
              )}
            </div>
            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="d-flex gap-2 overflow-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`border rounded p-0 flex-shrink-0 ${
                      selectedImage === idx
                        ? 'border-primary border-2'
                        : 'border-light'
                    }`}
                    style={{
                      width: '72px',
                      height: '72px',
                      cursor: 'pointer',
                      background: 'none',
                    }}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || `${product.title} thumbnail ${idx + 1}`}
                      width={72}
                      height={72}
                      className="rounded"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </Col>

          {/* Product Info */}
          <Col md={6}>
            <h1 className="h2 mb-3">{product.title}</h1>

            {selectedVariant && (
              <p className="h4 text-primary mb-4">
                {formatPrice(
                  selectedVariant.priceV2.amount,
                  selectedVariant.priceV2.currencyCode
                )}
              </p>
            )}

            {/* Variant selector */}
            {product.options?.length > 0 &&
              !(product.options.length === 1 && product.options[0].values.length === 1) && (
                <div className="mb-4">
                  {product.options.map((option) => (
                    <Form.Group key={option.id} className="mb-3">
                      <Form.Label className="fw-semibold">
                        {option.name}
                      </Form.Label>
                      <Form.Select
                        value={selectedOptions[option.name] || ''}
                        onChange={(e) => {
                          const newOptions = {
                            ...selectedOptions,
                            [option.name]: e.target.value,
                          };
                          setSelectedOptions(newOptions);

                          // Find variant matching ALL selected options
                          const variant = variants.find((v) =>
                            v.selectedOptions?.every(
                              (so) => newOptions[so.name] === so.value
                            )
                          );
                          if (variant) setSelectedVariant(variant);
                        }}
                      >
                        {option.values.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  ))}
                </div>
              )}

            {/* Add to Cart */}
            <Button
              variant="primary"
              size="lg"
              className="w-100 mb-3 d-none d-md-block"
              onClick={handleAddToCart}
              disabled={cartLoading || !selectedVariant?.availableForSale}
            >
              {cartLoading
                ? 'Adding…'
                : selectedVariant?.availableForSale
                ? 'Add to Cart'
                : 'Sold Out'}
            </Button>

            {addedMessage && (
              <Alert variant="success" className="py-2">
                Added to cart!{' '}
                <Link href="/cart" className="alert-link">
                  View cart
                </Link>
              </Alert>
            )}

            {/* Description */}
            {sanitizedDescription ? (
              <div
                className="mt-4 text-secondary"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            ) : (
              product.description && (
                <p className="mt-4 text-secondary">{product.description}</p>
              )
            )}
          </Col>
        </Row>

        {/* Mobile sticky add-to-cart bar */}
        <div className="sticky-add-to-cart d-md-none">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <strong className="d-block">{product.title}</strong>
              {selectedVariant && (
                <span className="text-primary">
                  {formatPrice(
                    selectedVariant.priceV2.amount,
                    selectedVariant.priceV2.currencyCode
                  )}
                </span>
              )}
            </div>
            <Button
              variant="primary"
              onClick={handleAddToCart}
              disabled={cartLoading || !selectedVariant?.availableForSale}
            >
              {cartLoading
                ? 'Adding…'
                : selectedVariant?.availableForSale
                ? 'Add to Cart'
                : 'Sold Out'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  try {
    const handles = await getAllProductHandles();
    return {
      paths: handles.map((handle) => ({ params: { handle } })),
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error fetching product handles:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const product = await getProductByHandle(params.handle);
    if (!product) {
      return { notFound: true };
    }

    // Sanitize HTML description at build time (server-side only)
    if (product.descriptionHtml) {
      const sanitizeHtml = (await import('sanitize-html')).default;
      product.descriptionHtml = sanitizeHtml(product.descriptionHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height'],
        },
        disallowedTagsMode: 'discard',
      });
    }

    return {
      props: { product },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { notFound: true };
  }
}
