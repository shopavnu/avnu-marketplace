import React, { useState, useEffect } from "react";
import { Product } from "../../types/product";
import dynamic from "next/dynamic";

// Import components with SSR disabled to avoid window is not defined error
const ResponsiveProductGrid = dynamic(
  () => import("./ResponsiveProductGrid").then((mod) => mod.default),
  { ssr: false },
);

interface ResponsiveTestPageProps {
  products: Product[];
}

const ResponsiveTestPage: React.FC<ResponsiveTestPageProps> = ({
  products,
}) => {
  const [deviceType, setDeviceType] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );
  const [viewportWidth, setViewportWidth] = useState<number>(1280);

  // Set up device detection and viewport width tracking
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);

      if (window.innerWidth < 768) {
        setDeviceType("mobile");
      } else if (window.innerWidth < 1024) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Simulate different device sizes
  const simulateDevice = (type: "mobile" | "tablet" | "desktop") => {
    let width: number;

    switch (type) {
      case "mobile":
        width = 375; // iPhone size
        break;
      case "tablet":
        width = 768; // iPad size
        break;
      default:
        width = 1280; // Desktop size
        break;
    }

    // This is just for demonstration - in a real app, we'd use CSS media queries
    const deviceSimulator = document.getElementById("device-simulator");
    if (deviceSimulator) {
      deviceSimulator.style.width = `${width}px`;
    }
    setDeviceType(type);
  };

  return (
    <div className="responsive-test-page" style={{ padding: "20px" }}>
      <h1>Responsive Product Card Test</h1>

      <div className="device-controls" style={{ marginBottom: "20px" }}>
        <h2>Test on Different Devices</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={() => simulateDevice("mobile")}
            style={{
              padding: "8px 16px",
              backgroundColor: deviceType === "mobile" ? "#4caf50" : "#e0e0e0",
              color: deviceType === "mobile" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Mobile (375px)
          </button>
          <button
            onClick={() => simulateDevice("tablet")}
            style={{
              padding: "8px 16px",
              backgroundColor: deviceType === "tablet" ? "#4caf50" : "#e0e0e0",
              color: deviceType === "tablet" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Tablet (768px)
          </button>
          <button
            onClick={() => simulateDevice("desktop")}
            style={{
              padding: "8px 16px",
              backgroundColor: deviceType === "desktop" ? "#4caf50" : "#e0e0e0",
              color: deviceType === "desktop" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Desktop (1280px)
          </button>
        </div>

        <div>
          <p>
            Current device: <strong>{deviceType}</strong>
          </p>
          <p>
            Viewport width: <strong>{viewportWidth}px</strong>
          </p>
          <p>
            Card height:{" "}
            <strong>
              {deviceType === "mobile"
                ? "280px"
                : deviceType === "tablet"
                  ? "~320px"
                  : "360px"}
            </strong>
          </p>
          <p>
            Image size:{" "}
            <strong>
              {deviceType === "mobile"
                ? "400x400"
                : deviceType === "tablet"
                  ? "600x600"
                  : "800x800"}
            </strong>
          </p>
        </div>
      </div>

      <div
        id="device-simulator"
        style={{
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          border: "2px solid #ccc",
          borderRadius: "8px",
          padding: "16px",
          transition: "width 0.3s ease",
        }}
      >
        <ResponsiveProductGrid
          products={products}
          title="Responsive Product Grid"
        />
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Key Features</h2>
        <ul>
          <li>
            <strong>Mobile (375px):</strong> 280px card height, 400x400 images,
            2 columns
          </li>
          <li>
            <strong>Tablet (768px):</strong> ~320px card height, 600x600 images,
            3 columns
          </li>
          <li>
            <strong>Desktop (1280px):</strong> 360px card height, 800x800
            images, 4 columns
          </li>
          <li>Responsive text truncation based on device size</li>
          <li>Consistent card heights with no layout shifts</li>
          <li>Optimized image loading for each device size</li>
        </ul>
      </div>
    </div>
  );
};

export default ResponsiveTestPage;
