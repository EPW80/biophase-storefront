import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { Row, Col, Button, Table } from 'react-bootstrap';
import { useCart } from '@/lib/cartContext';
import { formatPrice } from '@/lib/shopify';
import { EmptyState } from '@/components/LoadingStates';

export default function Cart() {
  const { cart, loading, updateQuantity, removeItem } = useCart();

  const lines = cart?.lines?.edges?.map((edge) => edge.node) || [];
  const subtotal = cart?.estimatedCost?.subtotalAmount;
  const total = cart?.estimatedCost?.totalAmount;

  return (
    <>
      <Head>
        <title>Cart — BioPhase Solutions</title>
        <meta name="description" content="Review your cart items" />
      </Head>

      <div className="fade-in">
        <h1 className="h3 mb-4">Your Cart</h1>

        {lines.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            message="Browse our products and add items to your cart."
            action={
              <Link href="/" className="btn btn-primary">
                Continue Shopping
              </Link>
            }
          />
        ) : (
          <>
            {/* Desktop table view */}
            <div className="d-none d-md-block">
              <Table responsive className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th style={{ width: '150px' }}>Quantity</th>
                    <th className="text-end">Total</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => {
                    const variant = line.merchandise;
                    const product = variant.product;
                    const image = product.images?.edges?.[0]?.node;
                    const lineTotal =
                      parseFloat(variant.priceV2.amount) * line.quantity;

                    return (
                      <tr key={line.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {image && (
                              <Image
                                src={image.url}
                                alt={image.altText || product.title}
                                width={64}
                                height={64}
                                className="rounded"
                                style={{ objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <Link
                                href={`/products/${product.handle}`}
                                className="text-dark fw-semibold text-decoration-none"
                              >
                                {product.title}
                              </Link>
                              {variant.title !== 'Default Title' && (
                                <small className="d-block text-muted">
                                  {variant.title}
                                </small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {formatPrice(
                            variant.priceV2.amount,
                            variant.priceV2.currencyCode
                          )}
                        </td>
                        <td>
                          <div className="quantity-control">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateQuantity(line.id, line.quantity - 1)
                              }
                              disabled={loading}
                              aria-label="Decrease quantity"
                            >
                              −
                            </Button>
                            <span className="fw-semibold">{line.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                updateQuantity(line.id, line.quantity + 1)
                              }
                              disabled={loading}
                              aria-label="Increase quantity"
                            >
                              +
                            </Button>
                          </div>
                        </td>
                        <td className="text-end fw-semibold">
                          {formatPrice(lineTotal, variant.priceV2.currencyCode)}
                        </td>
                        <td>
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => removeItem(line.id)}
                            disabled={loading}
                            aria-label={`Remove ${product.title}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                              <path
                                fillRule="evenodd"
                                d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H5.5l1-1h3l1 1H14a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                              />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {/* Mobile card view */}
            <div className="d-md-none">
              {lines.map((line) => {
                const variant = line.merchandise;
                const product = variant.product;
                const image = product.images?.edges?.[0]?.node;
                const lineTotal =
                  parseFloat(variant.priceV2.amount) * line.quantity;

                return (
                  <div
                    key={line.id}
                    className="border rounded p-3 mb-3 d-flex gap-3"
                  >
                    {image && (
                      <Image
                        src={image.url}
                        alt={image.altText || product.title}
                        width={80}
                        height={80}
                        className="rounded flex-shrink-0"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <div className="flex-grow-1">
                      <Link
                        href={`/products/${product.handle}`}
                        className="text-dark fw-semibold text-decoration-none d-block mb-1"
                      >
                        {product.title}
                      </Link>
                      {variant.title !== 'Default Title' && (
                        <small className="text-muted d-block mb-2">
                          {variant.title}
                        </small>
                      )}
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="quantity-control">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              updateQuantity(line.id, line.quantity - 1)
                            }
                            disabled={loading}
                            aria-label="Decrease quantity"
                          >
                            −
                          </Button>
                          <span className="fw-semibold">{line.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() =>
                              updateQuantity(line.id, line.quantity + 1)
                            }
                            disabled={loading}
                            aria-label="Increase quantity"
                          >
                            +
                          </Button>
                        </div>
                        <strong>
                          {formatPrice(lineTotal, variant.priceV2.currencyCode)}
                        </strong>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      className="text-danger p-0 align-self-start flex-shrink-0"
                      onClick={() => removeItem(line.id)}
                      disabled={loading}
                      aria-label={`Remove ${product.title}`}
                    >
                      &times;
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <Row className="justify-content-end mt-4">
              <Col md={5} lg={4}>
                <div className="bg-light rounded p-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <strong>
                      {subtotal
                        ? formatPrice(subtotal.amount, subtotal.currencyCode)
                        : '—'}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Shipping</span>
                    <span className="text-muted">Calculated at checkout</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3">
                    <strong>Estimated Total</strong>
                    <strong className="text-primary">
                      {total
                        ? formatPrice(total.amount, total.currencyCode)
                        : '—'}
                    </strong>
                  </div>
                  {cart?.checkoutUrl && (
                    <a
                      href={cart.checkoutUrl}
                      className="btn btn-primary w-100"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Proceed to Checkout
                    </a>
                  )}
                  <Link
                    href="/"
                    className="btn btn-outline-secondary w-100 mt-2"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </Col>
            </Row>
          </>
        )}
      </div>
    </>
  );
}
