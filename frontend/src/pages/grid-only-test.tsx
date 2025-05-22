import React from "react";
import Head from "next/head";
import { products } from "@/data/products";
import Image from "next/image";
import Link from "next/link";

/**
 * A minimal test page that uses CSS Grid with explicit row heights
 * and no animation components or wrappers
 */
export default function GridOnlyTest() {
  // Get a subset of products for testing
  const testProducts = products.slice(0, 12);

  return (
    <>
      <Head>
        <title>Grid-Only Test | Avnu Marketplace</title>
      </Head>

      <div className="min-h-screen bg-warm-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal mb-4">
              Grid-Only Test
            </h1>
            <p className="text-gray-600 mb-2">
              This page uses CSS Grid with explicit row heights and no animation
              components.
            </p>
          </div>

          {/* CSS Grid with explicit grid-template-rows */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">
              CSS Grid with Explicit Row Heights
            </h2>

            {/* The key is using grid-template-rows instead of gridAutoRows */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gridTemplateRows: "repeat(auto-fill, 360px)",
                gap: "24px",
              }}
            >
              {testProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Link
                    href={`/product/${product.id}`}
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        height: "200px",
                        position: "relative",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div
                      style={{
                        padding: "16px",
                        flex: "1",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          marginBottom: "4px",
                          height: "16px",
                          overflow: "hidden",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {product.brand}
                        </p>
                      </div>
                      <div
                        style={{
                          marginBottom: "8px",
                          height: "40px",
                          overflow: "hidden",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "14px",
                            fontWeight: 500,
                            lineHeight: "1.4",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {product.title}
                        </h3>
                      </div>
                      <div style={{ marginTop: "auto" }}>
                        <p style={{ fontSize: "14px", fontWeight: 500 }}>
                          {/* Use a static price to avoid hydration issues */}
                          <span className="opacity-0">$0.00</span>
                          <span className="sr-only">
                            ${product.price.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Debug information */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
            <p className="text-sm text-gray-700 mb-2">This page uses:</p>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>
                CSS Grid with explicit grid-template-rows instead of
                gridAutoRows
              </li>
              <li>No animation components or framer-motion</li>
              <li>No wrappers or nested containers</li>
              <li>Static prices to avoid hydration issues</li>
              <li>Inline styles instead of Tailwind classes</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
