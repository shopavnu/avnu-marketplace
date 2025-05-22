import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

/**
 * A completely stripped-down page with fixed-height product cards
 * No animation, no Tailwind, no wrappers, just pure CSS Grid and inline styles
 */
export default function GridFixed() {
  const [mounted, setMounted] = useState(false);

  // Only render on client to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get a subset of products for testing
  const testProducts = products.slice(0, 12);

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Fixed Grid | Avnu Marketplace</title>
      </Head>

      <div
        style={{
          minHeight: "100vh",
          padding: "48px 0",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Fixed Grid Layout
            </h1>
            <p style={{ color: "#666" }}>
              A completely stripped-down implementation with fixed-height cards
              and no animation.
            </p>
          </div>

          {/* Product Grid - Explicit grid-template-rows */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gridTemplateRows: "repeat(auto-fill, 360px)",
              gap: "24px",
              marginBottom: "48px",
            }}
          >
            {testProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  width: "100%",
                  height: "360px",
                  backgroundColor: "white",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Link
                  href={`/product/${product.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  {/* Image section - fixed 200px height */}
                  <div
                    style={{
                      height: "200px",
                      position: "relative",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      style={{
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                    />
                  </div>

                  {/* Content section - fixed 160px height */}
                  <div
                    style={{
                      padding: "16px",
                      flex: "1",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Brand - fixed height */}
                    <div
                      style={{
                        height: "16px",
                        marginBottom: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.brand}
                      </p>
                    </div>

                    {/* Title - fixed height */}
                    <div
                      style={{
                        height: "40px",
                        marginBottom: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          margin: 0,
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

                    {/* Description - fixed height */}
                    <div
                      style={{
                        height: "40px",
                        marginBottom: "8px",
                        overflow: "hidden",
                      }}
                    >
                      {product.description ? (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            margin: 0,
                            lineHeight: "1.4",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {product.description}
                        </p>
                      ) : (
                        <div style={{ height: "40px" }}></div>
                      )}
                    </div>

                    {/* Price - fixed height, client-rendered */}
                    <div
                      style={{
                        marginTop: "auto",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          margin: 0,
                        }}
                      >
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Debug information */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
              marginTop: "32px",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Implementation Notes
            </h2>
            <ul
              style={{
                listStyleType: "disc",
                paddingLeft: "20px",
                fontSize: "14px",
                color: "#444",
              }}
            >
              <li>Client-side rendering only (no SSR)</li>
              <li>No animation components or wrappers</li>
              <li>CSS Grid with explicit grid-template-rows</li>
              <li>All inline styles (no Tailwind or CSS classes)</li>
              <li>
                Fixed heights for all elements (card: 360px, image: 200px,
                content: 160px)
              </li>
              <li>Minimal DOM structure</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
