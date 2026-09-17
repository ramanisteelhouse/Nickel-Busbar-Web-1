import React from 'react';
import { Link } from 'react-router-dom';
import { ProductThumbnail } from './ProductThumbnail';

/**
 * Links from one product page to the rest of the catalogue.
 *
 * The crawler snapshot (seoSnapshot.ts) has rendered this block for a while, but the React page
 * did not, so a visitor — and any crawler that executes JavaScript — reached a product page and
 * found no way to any other product except back through /products. This renders the same six
 * products from the same query, so the two surfaces cannot drift into showing different things.
 *
 * Anchor text is each product's own name rather than "view product", because the link text is
 * what tells a search engine which query the destination answers.
 */

type RelatedProduct = {
  slug: string;
  name: string;
  image?: string | null;
  dimensions?: string | null;
  seo_heading?: string | null;
};

export const RelatedProducts: React.FC<{ slug: string }> = ({ slug }) => {
  const [products, setProducts] = React.useState<RelatedProduct[]>([]);

  React.useEffect(() => {
    let isActive = true;
    setProducts([]);

    fetch(`/api/products/${encodeURIComponent(slug)}/related`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data: RelatedProduct[]) => {
        if (isActive && Array.isArray(data)) setProducts(data);
      })
      // Silent by design: this is supporting navigation, and an error banner where a "you might
      // also need" list should be is worse than the list simply not appearing.
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [slug]);

  if (!products.length) return null;

  return (
    <section className="mt-16">
      <h2 className="text-lg font-bold text-zinc-900">Related nickel strip products</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Other patterns and cell formats from the same catalogue, supplied to the same 99.6% pure nickel specification.
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <li key={product.slug}>
            <Link
              to={`/product/${encodeURIComponent(product.slug)}`}
              className="group block rounded-2xl border border-zinc-200 bg-white p-3 transition hover:border-brand hover:shadow-sm"
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100">
                <ProductThumbnail
                  slug={product.slug}
                  image={product.image}
                  name={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-brand">
                {product.name}
              </p>
              {product.dimensions ? (
                <p className="mt-1 text-xs text-zinc-500">{product.dimensions}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
