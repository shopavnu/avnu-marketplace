import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { products, Product } from "@/data/products";

// Simple card component with absolutely minimal styling
const SimpleCard = ({
  product,
  style = {},
}: {
  product: Product;
  style?: React.CSSProperties;
}) => {
  const [dimensions, setDimensions] = useState({ height: 0 });
  const cardRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      const height = cardRef.current.getBoundingClientRect().height;
      setDimensions({ height });
      console.log(`Card for ${product.title} - Height: ${height}px`);
    }
  }, [product.title]);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl shadow-sm"
      style={{
        width: "100%",
        ...style,
      }}
    >
      <div className="relative w-full" style={{ height: "200px" }}>
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-contain"
        />
      </div>
      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-gray-500 truncate">{product.brand}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="text-sm font-medium text-gray-900 mt-1">
          ${product.price.toFixed(2)}
        </p>
      </div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-red-500 pointer-events-none"></div>
      <div className="absolute top-0 right-0 bg-black text-white text-xs px-2 py-1">
        {Math.round(dimensions.height)}px
      </div>
    </div>
  );
};

// Fixed height card component
const FixedHeightCard = ({ product }: { product: Product }) => {
  return (
    <SimpleCard
      product={product}
      style={{
        height: "360px",
        overflow: "hidden",
      }}
    />
  );
};

// Card with absolutely positioned content
const AbsoluteCard = ({ product }: { product: Product }) => {
  return (
    <div
      className="relative bg-white rounded-xl shadow-sm"
      style={{ height: "360px" }}
    >
      <div className="absolute top-0 left-0 w-full" style={{ height: "200px" }}>
        <div className="relative w-full h-full">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain"
          />
        </div>
      </div>
      <div className="absolute top-[200px] left-0 w-full p-4">
        {product.brand && (
          <p className="text-xs text-gray-500 truncate">{product.brand}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="text-sm font-medium text-gray-900 mt-1">
          ${product.price.toFixed(2)}
        </p>
      </div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-blue-500 pointer-events-none"></div>
    </div>
  );
};

// Table-based card
const TableCard = ({ product }: { product: Product }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm" style={{ height: "360px" }}>
      <table className="w-full h-full border-collapse">
        <tbody>
          <tr>
            <td style={{ height: "200px" }}>
              <div className="relative w-full h-full">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td
              className="p-4"
              style={{ height: "160px", verticalAlign: "top" }}
            >
              {product.brand && (
                <p className="text-xs text-gray-500 truncate">
                  {product.brand}
                </p>
              )}
              <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
                {product.title}
              </h3>
              {product.description && (
                <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
              )}
              <p className="text-sm font-medium text-gray-900 mt-1">
                ${product.price.toFixed(2)}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500 pointer-events-none"></div>
    </div>
  );
};

// CSS Grid card
const GridCard = ({ product }: { product: Product }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-sm grid grid-rows-[200px_160px]"
      style={{ height: "360px" }}
    >
      <div className="relative w-full">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-contain"
        />
      </div>
      <div className="p-4 overflow-hidden">
        {product.brand && (
          <p className="text-xs text-gray-500 truncate">{product.brand}</p>
        )}
        <h3 className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="text-sm font-medium text-gray-900 mt-1">
          ${product.price.toFixed(2)}
        </p>
      </div>
      <div className="absolute top-0 left-0 w-full h-full border-2 border-purple-500 pointer-events-none"></div>
    </div>
  );
};

// Test page
export default function CardTest() {
  // Get problematic products
  const problematicProducts = [
    products.find((p) => p.title.includes("Ceramic Vase")),
    products.find((p) => p.title.includes("Pillowcase")),
    products.find((p) => p.title.includes("Serving Board")),
  ].filter(Boolean) as any[];

  // Get some non-problematic products
  const normalProducts = products
    .filter((p) => !problematicProducts.includes(p))
    .slice(0, 3);

  // All test products
  const testProducts = [...problematicProducts, ...normalProducts];

  return (
    <>
      <Head>
        <title>Card Test Page</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Card Test Page</h1>

        <h2 className="text-2xl font-bold mb-4">
          1. Simple Cards (Natural Height)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {testProducts.map((product) => (
            <div key={`simple-${product.id}`} className="relative">
              <SimpleCard product={product} />
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">
          2. Fixed Height Cards (overflow: hidden)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {testProducts.map((product) => (
            <div key={`fixed-${product.id}`} className="relative">
              <FixedHeightCard product={product} />
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">
          3. Absolute Positioned Cards
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {testProducts.map((product) => (
            <div key={`absolute-${product.id}`} className="relative">
              <AbsoluteCard product={product} />
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">4. Table-Based Cards</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {testProducts.map((product) => (
            <div key={`table-${product.id}`} className="relative">
              <TableCard product={product} />
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">5. CSS Grid Cards</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {testProducts.map((product) => (
            <div key={`grid-${product.id}`} className="relative">
              <GridCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
