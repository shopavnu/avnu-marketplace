import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MinimalProductCardProps {
  product: any;
  badges?: React.ReactNode;
}

/**
 * A minimal product card with explicit height constraints and client-side rendering
 * for price to avoid hydration mismatches
 */
const MinimalProductCard: React.FC<MinimalProductCardProps> = ({
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
        maxHeight: "360px",
        minHeight: "360px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
        position: "relative",
        display: "block",
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
        {/* Image section - fixed 200px height */}
        <div
          style={{
            height: "200px",
            width: "100%",
            position: "relative",
            backgroundColor: "#f9f9f9",
            overflow: "hidden",
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
            height: "160px",
            width: "100%",
            padding: "16px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Brand - fixed 16px height */}
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
              {typeof product.brand === "string"
                ? product.brand
                : product.brand?.name || ""}
            </p>
          </div>

          {/* Title - fixed 40px height */}
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

          {/* Description - fixed 40px height */}
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

          {/* Price - fixed 20px height, client-rendered only */}
          <div
            style={{
              height: "20px",
              marginTop: "auto",
            }}
          >
            {mounted ? (
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                ${product.price.toFixed(2)}
              </p>
            ) : (
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  margin: 0,
                  opacity: 0,
                }}
              >
                $0.00
              </p>
            )}
          </div>
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

export default MinimalProductCard;
