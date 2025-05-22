import React from "react";
import Head from "next/head";
import { products } from "@/data/products";
import Image from "next/image";
import Link from "next/link";

/**
 * A minimal test page that uses a completely different approach
 * to render product cards in a grid
 */
export default function GridTest() {
  // Get a subset of products for testing
  const testProducts = products.slice(0, 12);

  return (
    <>
      <Head>
        <title>Grid Test | Avnu Marketplace</title>
      </Head>

      <div className="min-h-screen bg-warm-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal mb-4">Grid Test</h1>
            <p className="text-gray-600 mb-2">
              This page uses a completely different approach to render product
              cards.
            </p>
          </div>

          {/* CSS Grid with explicit row heights */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">
              CSS Grid with Explicit Row Heights
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "24px",
                gridAutoRows: "360px",
              }}
            >
              {testProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    height: "360px",
                    overflow: "hidden",
                    backgroundColor: "white",
                    borderRadius: "12px",
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
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Table-based layout */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Table-based Layout</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "24px",
              }}
            >
              {testProducts.map((product) => (
                <div
                  key={product.id}
                  style={{ height: "360px", overflow: "hidden" }}
                >
                  <table
                    style={{
                      width: "100%",
                      height: "100%",
                      borderCollapse: "collapse",
                      backgroundColor: "white",
                      borderRadius: "12px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ height: "200px", padding: 0 }}>
                          <Link href={`/product/${product.id}`}>
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
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            height: "160px",
                            padding: "16px",
                            verticalAlign: "top",
                          }}
                        >
                          <Link
                            href={`/product/${product.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
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
                                height: "40px",
                                marginBottom: "8px",
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
                            <div style={{ marginTop: "72px" }}>
                              <p style={{ fontSize: "14px", fontWeight: 500 }}>
                                ${product.price.toFixed(2)}
                              </p>
                            </div>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          {/* Debug information */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
            <p className="text-sm text-gray-700 mb-2">This page uses:</p>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>Inline styles instead of Tailwind classes</li>
              <li>CSS Grid with explicit gridAutoRows</li>
              <li>Table-based layout with fixed row heights</li>
              <li>No framer-motion or animation components</li>
              <li>No Next.js Image optimization (using standard img tags)</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
