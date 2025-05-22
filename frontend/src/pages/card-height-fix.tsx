import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

/**
 * A test page that demonstrates different approaches to fix card height inconsistencies
 */
export default function CardHeightFix() {
  const [mounted, setMounted] = useState(false);
  const [heights, setHeights] = useState<Record<string, number[]>>({});

  // Get a subset of products for testing
  const testProducts = products.slice(0, 8);

  // Measure card heights after mount
  useEffect(() => {
    setMounted(true);

    // Wait for rendering to complete
    setTimeout(() => {
      const cardHeights: Record<string, number[]> = {
        standard: [],
        containment: [],
        grid: [],
        absolute: [],
      };

      // Measure each card type
      ["standard", "containment", "grid", "absolute"].forEach((type) => {
        const cards = document.querySelectorAll(`.${type}-card`);
        cards.forEach((card) => {
          cardHeights[type].push(card.getBoundingClientRect().height);
        });
      });

      setHeights(cardHeights);
    }, 1000);
  }, []);

  return (
    <>
      <Head>
        <title>Card Height Fix | Avnu Marketplace</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Card Height Fix
            </h1>
            <p className="text-gray-600 mb-2">
              This page demonstrates different approaches to fix card height
              inconsistencies.
            </p>
          </div>

          {/* Height measurements */}
          {mounted && Object.keys(heights).length > 0 && (
            <div className="mb-8 p-4 bg-gray-100 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Card Height Measurements
              </h2>

              {Object.entries(heights).map(([type, cardHeights]) => (
                <div key={type} className="mb-4">
                  <h3 className="font-medium mb-2">{type} Cards:</h3>
                  <div className="flex flex-wrap gap-2">
                    {cardHeights.map((height, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-sm ${
                          height === 360
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        Card {i + 1}: {height.toFixed(2)}px
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Standard Cards */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">1. Standard Cards</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {testProducts.map((product) => (
                <div
                  key={product.id}
                  className="standard-card w-full h-[360px] bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="block h-full"
                  >
                    <div className="relative h-[200px] bg-gray-50">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="p-4 h-[160px]">
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {product.brand}
                      </p>
                      <h3 className="text-sm font-medium line-clamp-2 mb-2">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                      )}
                      <p className="text-sm font-medium text-gray-900 mt-auto">
                        {mounted ? (
                          `$${product.price.toFixed(2)}`
                        ) : (
                          <span className="opacity-0">$0.00</span>
                        )}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* CSS Containment Cards */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">
              2. CSS Containment Cards
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {testProducts.map((product) => (
                <div
                  key={product.id}
                  className="containment-card"
                  style={{
                    width: "100%",
                    height: "360px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    contain: "strict", // CSS containment to isolate layout
                  }}
                >
                  <Link
                    href={`/product/${product.id}`}
                    style={{
                      display: "block",
                      height: "100%",
                      textDecoration: "none",
                      color: "inherit",
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
                        height: "160px",
                        padding: "16px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "4px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.brand}
                      </p>
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          marginBottom: "8px",
                          height: "40px",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {product.title}
                      </h3>
                      <div
                        style={{
                          height: "40px",
                          overflow: "hidden",
                          marginBottom: "8px",
                        }}
                      >
                        {product.description && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {product.description}
                          </p>
                        )}
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 500 }}>
                        {mounted ? (
                          `$${product.price.toFixed(2)}`
                        ) : (
                          <span style={{ opacity: 0 }}>$0.00</span>
                        )}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* CSS Grid Cards */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">3. CSS Grid Cards</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {testProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid-card"
                  style={{
                    width: "100%",
                    height: "360px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    display: "grid",
                    gridTemplateRows: "200px 160px",
                  }}
                >
                  <Link
                    href={`/product/${product.id}`}
                    style={{
                      gridRow: "1 / 3",
                      display: "grid",
                      gridTemplateRows: "200px 160px",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        gridRow: "1 / 2",
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
                        gridRow: "2 / 3",
                        padding: "16px",
                        display: "grid",
                        gridTemplateRows: "16px 40px 40px auto",
                        rowGap: "8px",
                      }}
                    >
                      <p
                        style={{
                          gridRow: "1 / 2",
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
                      <h3
                        style={{
                          gridRow: "2 / 3",
                          fontSize: "14px",
                          fontWeight: 500,
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product.title}
                      </h3>
                      <div
                        style={{
                          gridRow: "3 / 4",
                          overflow: "hidden",
                        }}
                      >
                        {product.description && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              margin: 0,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {product.description}
                          </p>
                        )}
                      </div>
                      <p
                        style={{
                          gridRow: "4 / 5",
                          fontSize: "14px",
                          fontWeight: 500,
                          margin: 0,
                          alignSelf: "end",
                        }}
                      >
                        {mounted ? (
                          `$${product.price.toFixed(2)}`
                        ) : (
                          <span style={{ opacity: 0 }}>$0.00</span>
                        )}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Absolute Positioning Cards */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4">
              4. Absolute Positioning Cards
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {testProducts.map((product) => (
                <div
                  key={product.id}
                  className="absolute-card"
                  style={{
                    width: "100%",
                    height: "360px",
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Link
                    href={`/product/${product.id}`}
                    style={{
                      display: "block",
                      height: "100%",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "200px",
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
                        position: "absolute",
                        top: "200px",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: "16px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginBottom: "4px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {product.brand}
                      </p>
                      <h3
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          marginBottom: "8px",
                          height: "40px",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {product.title}
                      </h3>
                      <div
                        style={{
                          height: "40px",
                          overflow: "hidden",
                          marginBottom: "8px",
                        }}
                      >
                        {product.description && (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {product.description}
                          </p>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          position: "absolute",
                          bottom: "16px",
                          left: "16px",
                        }}
                      >
                        {mounted ? (
                          `$${product.price.toFixed(2)}`
                        ) : (
                          <span style={{ opacity: 0 }}>$0.00</span>
                        )}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Implementation Notes */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Implementation Notes</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              <li>All cards are set to exactly 360px height</li>
              <li>
                CSS containment isolates card layout from parent influences
              </li>
              <li>Client-side price rendering avoids hydration mismatches</li>
              <li>
                Different layout techniques (flex, grid, absolute) for
                comparison
              </li>
              <li>No animation components or wrappers</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
