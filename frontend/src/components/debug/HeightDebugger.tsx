import React, { useEffect, useState } from "react";

/**
 * An enhanced debugging component that measures and displays detailed information
 * about card heights, parent containers, and potential layout issues
 */
const HeightDebugger: React.FC = () => {
  const [measurements, setMeasurements] = useState<Record<string, any>>({});
  const [visible, setVisible] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const refreshMeasurements = () => {
    setRefreshCount((prev) => prev + 1);
  };

  useEffect(() => {
    // Wait for everything to render
    const timer = setTimeout(() => {
      const results: Record<string, any> = {};

      // Measure grid containers
      const grids = document.querySelectorAll(".grid");
      if (grids.length) {
        results.grids = Array.from(grids).map((grid, i) => {
          const rect = grid.getBoundingClientRect();
          const styles = window.getComputedStyle(grid);

          // Add visual debug borders
          (grid as HTMLElement).style.border = "2px solid blue";

          return {
            index: i,
            height: rect.height,
            width: rect.width,
            display: styles.display,
            gridTemplateRows: styles.gridTemplateRows,
            contain: styles.contain,
          };
        });
      }

      // Measure grid cells (motion.div containers)
      const gridCells = document.querySelectorAll(".grid > div");
      if (gridCells.length) {
        results.gridCells = Array.from(gridCells).map((cell, i) => {
          const rect = cell.getBoundingClientRect();
          const styles = window.getComputedStyle(cell);
          const hasDescription =
            cell.querySelector('[data-has-description="true"]') !== null;

          // Add visual debug borders
          (cell as HTMLElement).style.border = hasDescription
            ? "2px solid red"
            : "2px solid green";

          return {
            index: i,
            height: rect.height,
            width: rect.width,
            display: styles.display,
            position: styles.position,
            overflow: styles.overflow,
            contain: styles.contain,
            hasDescription,
          };
        });
      }

      // Measure product cards
      const productCards = document.querySelectorAll(".grid > div > div");
      if (productCards.length) {
        results.productCards = Array.from(productCards).map((card, i) => {
          const rect = card.getBoundingClientRect();
          const styles = window.getComputedStyle(card);

          // Add visual debug borders
          (card as HTMLElement).style.border = "2px solid orange";

          return {
            index: i,
            height: rect.height,
            width: rect.width,
            display: styles.display,
            position: styles.position,
            overflow: styles.overflow,
            contain: styles.contain,
          };
        });
      }

      // Measure card images
      const cardImages = document.querySelectorAll(".grid img");
      if (cardImages.length) {
        results.cardImages = Array.from(cardImages).map((img, i) => {
          const rect = img.getBoundingClientRect();
          const styles = window.getComputedStyle(img);

          return {
            index: i,
            height: rect.height,
            width: rect.width,
            aspectRatio: rect.width / rect.height,
            objectFit: styles.objectFit,
            position: styles.position,
          };
        });
      }

      // Measure animation wrappers (ScrollItem)
      const animationWrappers = document.querySelectorAll(
        '.grid > div > [class*="ScrollItem"]',
      );
      if (animationWrappers.length) {
        results.animationWrappers = Array.from(animationWrappers).map(
          (wrapper, i) => {
            const rect = wrapper.getBoundingClientRect();
            const styles = window.getComputedStyle(wrapper);

            // Add visual debug borders
            (wrapper as HTMLElement).style.border = "2px solid purple";

            return {
              index: i,
              height: rect.height,
              width: rect.width,
              display: styles.display,
              position: styles.position,
              overflow: styles.overflow,
              contain: styles.contain,
            };
          },
        );
      }

      // Check for hydration mismatches
      const hydrationErrors: string[] = [];
      const consoleErrors: string[] = [];

      // Override console.error to capture hydration errors
      const originalConsoleError = console.error;
      console.error = function (...args) {
        const errorString = args.join(" ");
        if (
          errorString.includes("hydration") ||
          errorString.includes("mismatch")
        ) {
          hydrationErrors.push(errorString);
        }
        consoleErrors.push(errorString);
        originalConsoleError.apply(console, args);
      };

      // Restore console.error after a short delay
      setTimeout(() => {
        console.error = originalConsoleError;
        results.hydrationErrors = hydrationErrors;
        results.consoleErrors = consoleErrors;
        setMeasurements(results);
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [refreshCount]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        maxHeight: "80vh",
        overflowY: "auto",
        fontSize: "12px",
        fontFamily: "monospace",
        width: "350px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <h3 style={{ margin: 0 }}>Enhanced Height Debugger</h3>
        <div>
          <button
            onClick={refreshMeasurements}
            style={{
              background: "none",
              border: "1px solid white",
              color: "white",
              cursor: "pointer",
              fontSize: "12px",
              marginRight: "8px",
              padding: "2px 5px",
              borderRadius: "3px",
            }}
          >
            Refresh
          </button>
          <button
            onClick={() => setVisible(false)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ×
          </button>
        </div>
      </div>

      {Object.keys(measurements).length === 0 ? (
        <p>Measuring elements...</p>
      ) : (
        <>
          {/* Grid Containers */}
          {measurements.grids && (
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 5px 0", color: "lightblue" }}>
                Grid Containers ({measurements.grids?.length || 0})
              </h4>
              <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                {measurements.grids?.map((grid: any) => (
                  <div
                    key={grid.index}
                    style={{
                      padding: "3px",
                      backgroundColor: "rgba(0, 100, 255, 0.2)",
                      marginBottom: "2px",
                      borderRadius: "3px",
                    }}
                  >
                    Grid {grid.index}: {grid.width.toFixed(0)}×
                    {grid.height.toFixed(0)}px
                    <br />
                    <span style={{ fontSize: "10px" }}>
                      display: {grid.display}, contain: {grid.contain || "none"}
                      <br />
                      template-rows: {grid.gridTemplateRows || "none"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid Cells */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 5px 0", color: "lightgreen" }}>
              Grid Cells ({measurements.gridCells?.length || 0})
            </h4>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              {measurements.gridCells?.map((cell: any) => (
                <div
                  key={cell.index}
                  style={{
                    padding: "3px",
                    backgroundColor:
                      cell.height !== 360
                        ? "rgba(255, 0, 0, 0.3)"
                        : "rgba(0, 255, 0, 0.1)",
                    marginBottom: "2px",
                    borderRadius: "3px",
                  }}
                >
                  Cell {cell.index}: {cell.width.toFixed(0)}×
                  {cell.height.toFixed(0)}px
                  {cell.hasDescription && " (has description)"}
                  <br />
                  <span style={{ fontSize: "10px" }}>
                    display: {cell.display}, position: {cell.position}
                    <br />
                    overflow: {cell.overflow}, contain: {cell.contain || "none"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Cards */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 5px 0", color: "orange" }}>
              Product Cards ({measurements.productCards?.length || 0})
            </h4>
            <div style={{ maxHeight: "150px", overflowY: "auto" }}>
              {measurements.productCards?.map((card: any) => (
                <div
                  key={card.index}
                  style={{
                    padding: "3px",
                    backgroundColor:
                      card.height !== 360
                        ? "rgba(255, 0, 0, 0.3)"
                        : "rgba(0, 255, 0, 0.1)",
                    marginBottom: "2px",
                    borderRadius: "3px",
                  }}
                >
                  Card {card.index}: {card.width.toFixed(0)}×
                  {card.height.toFixed(0)}px
                  <br />
                  <span style={{ fontSize: "10px" }}>
                    display: {card.display}, position: {card.position}
                    <br />
                    overflow: {card.overflow}, contain: {card.contain || "none"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Animation Wrappers */}
          {measurements.animationWrappers && (
            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ margin: "0 0 5px 0", color: "purple" }}>
                Animation Wrappers (
                {measurements.animationWrappers?.length || 0})
              </h4>
              <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                {measurements.animationWrappers?.map((wrapper: any) => (
                  <div
                    key={wrapper.index}
                    style={{
                      padding: "3px",
                      backgroundColor:
                        wrapper.height !== 360
                          ? "rgba(255, 0, 0, 0.3)"
                          : "rgba(128, 0, 128, 0.2)",
                      marginBottom: "2px",
                      borderRadius: "3px",
                    }}
                  >
                    Wrapper {wrapper.index}: {wrapper.width.toFixed(0)}×
                    {wrapper.height.toFixed(0)}px
                    <br />
                    <span style={{ fontSize: "10px" }}>
                      display: {wrapper.display}, position: {wrapper.position}
                      <br />
                      overflow: {wrapper.overflow}, contain:{" "}
                      {wrapper.contain || "none"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card Images */}
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 5px 0" }}>
              Card Images ({measurements.cardImages?.length || 0})
            </h4>
            <div style={{ maxHeight: "100px", overflowY: "auto" }}>
              {measurements.cardImages?.map((img: any) => (
                <div
                  key={img.index}
                  style={{
                    padding: "3px",
                    marginBottom: "2px",
                    borderRadius: "3px",
                  }}
                >
                  Image {img.index}: {img.width.toFixed(0)}×
                  {img.height.toFixed(0)}px (ratio: {img.aspectRatio.toFixed(2)}
                  )<br />
                  <span style={{ fontSize: "10px" }}>
                    objectFit: {img.objectFit}, position: {img.position}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hydration Errors */}
          {measurements.hydrationErrors &&
            measurements.hydrationErrors.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "red" }}>
                  Hydration Errors ({measurements.hydrationErrors?.length || 0})
                </h4>
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {measurements.hydrationErrors?.map(
                    (error: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          padding: "3px",
                          backgroundColor: "rgba(255, 0, 0, 0.3)",
                          marginBottom: "2px",
                          borderRadius: "3px",
                          fontSize: "10px",
                          wordBreak: "break-word",
                        }}
                      >
                        {error.substring(0, 200)}
                        {error.length > 200 ? "..." : ""}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default HeightDebugger;
