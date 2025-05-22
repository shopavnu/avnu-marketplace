import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface SingleElementCardProps {
  product: any;
  badges?: React.ReactNode;
}

/**
 * A product card implementation that uses a single-element approach with CSS Grid
 * for internal layout to eliminate any potential issues with nested elements.
 */
const SingleElementCard: React.FC<SingleElementCardProps> = ({
  product,
  badges,
}) => {
  const [mounted, setMounted] = useState(false);

  // Only render price on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "360px",
        minHeight: "360px",
        maxHeight: "360px",
        display: "grid",
        gridTemplateRows: "200px 160px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
        contain: "strict" /* CSS containment to isolate layout */,
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
          height: "100%",
        }}
      >
        {/* Image section */}
        <div
          style={{
            gridRow: "1 / 2",
            position: "relative",
            backgroundColor: "#f9f9f9",
            overflow: "hidden",
            height: "200px",
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

        {/* Content section */}
        <div
          style={{
            gridRow: "2 / 3",
            padding: "16px",
            display: "grid",
            gridTemplateRows: "16px 40px 40px auto",
            rowGap: "8px",
            height: "160px",
          }}
        >
          {/* Brand */}
          <p
            style={{
              gridRow: "1 / 2",
              fontSize: "12px",
              color: "#666",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              height: "16px",
            }}
          >
            {typeof product.brand === "string"
              ? product.brand
              : product.brand?.name || ""}
          </p>

          {/* Title */}
          <h3
            style={{
              gridRow: "2 / 3",
              fontSize: "14px",
              fontWeight: 500,
              margin: 0,
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              height: "40px",
            }}
          >
            {product.title}
          </h3>

          {/* Description */}
          <div
            style={{
              gridRow: "3 / 4",
              height: "40px",
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

          {/* Price */}
          <p
            style={{
              gridRow: "4 / 5",
              fontSize: "14px",
              fontWeight: 500,
              margin: "0",
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

        {/* Badges */}
        {badges && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              zIndex: 10,
            }}
          >
            {badges}
          </div>
        )}
      </Link>
    </div>
  );
};

export default SingleElementCard;
