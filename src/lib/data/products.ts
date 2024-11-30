// src/lib/data/products.tsx

import React, { useState, useEffect } from "react";
import { Button, Text } from "@medusajs/ui";
import { sdk } from "@lib/config";
import { HttpTypes } from "@medusajs/types";
import { cache } from "react";
import { getRegion } from "./regions";
import { SortOptions } from "@modules/store/components/refinement-list/sort-products";
import { sortProducts } from "@lib/util/sort-products";
import { User } from "react-feather"; // Ensure this import is correct based on your setup

// ---------------------- Data Fetching Functions ---------------------- //

/**
 * Fetches a list of products based on provided parameters.
 * Fetches 12 products per request.
 */
export const getProductsList = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
  countryCode: string;
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
}> {
  const limit = 12; // Fixed limit of 12 products per request
  const offset = (pageParam - 1) * limit; // Calculate offset based on page number
  const region = await getRegion(countryCode);

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    };
  }

  const { products, count } = await sdk.store.product.list(
    {
      limit,
      offset,
      region_id: region.id,
      fields: "*variants.calculated_price,+variants.inventory_quantity",
      ...queryParams,
    },
    { next: { tags: ["products"] } }
  );

  const nextPage = count > offset + limit ? pageParam + 1 : null;

  return {
    response: {
      products,
      count,
    },
    nextPage,
    queryParams,
  };
});

/**
 * Fetches products by their IDs.
 */
export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[];
  regionId: string;
}): Promise<HttpTypes.StoreProduct[]> {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.inventory_quantity",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products);
});

/**
 * Fetches a single product by its handle.
 */
export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
): Promise<HttpTypes.StoreProduct | undefined> {
  return sdk.store.product
    .list(
      {
        handle,
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.inventory_quantity",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products[0]);
});

/**
 * Fetches and sorts the product list.
 */
export const getProductsListWithSort = cache(async function ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
  sortBy?: SortOptions;
  countryCode: string;
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
}> {
  const { response, nextPage } = await getProductsList({
    pageParam: page,
    queryParams: {
      ...queryParams,
      // Additional query parameters can be added here
    },
    countryCode,
  });

  const sortedProducts = sortProducts(response.products, sortBy);

  return {
    response: {
      products: sortedProducts,
      count: response.count,
    },
    nextPage,
    queryParams,
  };
};

// -------------------------- React Component --------------------------- //

interface ProductListProps {
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
  countryCode: string;
  sortBy?: SortOptions;
}

const ProductLoader: React.FC<ProductListProps> = ({
  queryParams,
  countryCode,
  sortBy,
}) => {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [nextPage, setNextPage] = useState<number | null>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads products for the given page.
   */
  const loadProducts = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const { response, nextPage: newNextPage } = await getProductsListWithSort({
        page,
        queryParams,
        sortBy,
        countryCode,
      });
      setProducts((prev) => [...prev, ...response.products]);
      setNextPage(newNextPage);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Loads the initial set of products on component mount or when dependencies change.
   */
  useEffect(() => {
    // Reset state when queryParams, countryCode, or sortBy changes
    setProducts([]);
    setCurrentPage(1);
    setNextPage(2);
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams, countryCode, sortBy]);

  /**
   * Handler for the "Load More" button click.
   */
  const handleLoadMore = () => {
    if (nextPage) {
      loadProducts(nextPage);
    }
  };

  return (
    <div>
      {/* Product Grid */}
      <div className="product-grid" style={styles.productGrid}>
        {products.map((product) => (
          <div key={product.id} className="product-card" style={styles.productCard}>
            {/* Render your product details here */}
            <Text>{product.title}</Text>
            {/* Add more product fields as needed */}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && <Text variant="error">{error}</Text>}

      {/* Load More Button */}
      {nextPage && (
        <Button
          variant="secondary"
          onClick={handleLoadMore}
          disabled={loading}
          style={styles.loadMoreButton}
        >
          {loading ? "Loading..." : (
            <>
              Load More <User />
            </>
          )}
        </Button>
      )}

      {/* No More Products Message */}
      {!nextPage && products.length > 0 && (
        <Text>No more products to load.</Text>
      )}

      {/* No Products Found */}
      {!loading && products.length === 0 && (
        <Text>No products found.</Text>
      )}
    </div>
  );
};

// ---------------------------- Styling ---------------------------- //

const styles: { [key: string]: React.CSSProperties } = {
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  productCard: {
    border: "1px solid #eaeaea",
    padding: "16px",
    borderRadius: "8px",
  },
  loadMoreButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default ProductLoader;
