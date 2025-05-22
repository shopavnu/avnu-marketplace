import React from "react";
import { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { useTheme, colorPalettes, PaletteType } from "@/context/ThemeContext";

const AccountSettings: NextPage = () => {
  const { paletteType, setPaletteType } = useTheme();

  return (
    <>
      <Head>
        <title>Account Settings | Avnu Marketplace</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1
            className="text-3xl font-bold mb-8"
            style={{ color: "var(--color-text)" }}
          >
            Account Settings
          </h1>

          <div
            className="bg-white rounded-xl shadow-sm p-6 mb-8"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <p
              className="text-gray-600 mb-6"
              style={{ color: "var(--color-textSecondary)" }}
            >
              Choose a color palette that matches your style. This will be
              applied across all your devices.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(Object.keys(colorPalettes) as PaletteType[]).map((type) => (
                <div
                  key={type}
                  className={`rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    paletteType === type ? "ring-2" : "hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor:
                      paletteType === type
                        ? `${colorPalettes[type].backgroundAlt}`
                        : "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    boxShadow:
                      paletteType === type
                        ? `0 0 0 2px ${colorPalettes[type].primary}`
                        : "none",
                  }}
                  onClick={() => setPaletteType(type)}
                >
                  <div className="flex items-center mb-3">
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: colorPalettes[type].primary }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: colorPalettes[type].secondary }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: colorPalettes[type].accent }}
                    ></div>
                  </div>

                  <h3
                    className="font-medium"
                    style={{
                      color:
                        paletteType === type
                          ? colorPalettes[type].primary
                          : "var(--color-text)",
                    }}
                  >
                    {colorPalettes[type].name}
                  </h3>

                  {paletteType === type && (
                    <span
                      className="text-sm mt-2 inline-block"
                      style={{ color: colorPalettes[type].primary }}
                    >
                      Currently active
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div
              className="mt-8 p-4 rounded-lg"
              style={{ backgroundColor: "var(--color-backgroundAlt)" }}
            >
              <h3 className="font-medium mb-2">
                Preview your selected palette
              </h3>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <button
                    className="px-4 py-2 rounded-md w-full text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    Primary Button
                  </button>

                  <button
                    className="px-4 py-2 rounded-md w-full text-white"
                    style={{ backgroundColor: "var(--color-secondary)" }}
                  >
                    Secondary Button
                  </button>

                  <button
                    className="px-4 py-2 rounded-md w-full text-white"
                    style={{ backgroundColor: "var(--color-accent)" }}
                  >
                    Accent Button
                  </button>
                </div>

                <div
                  className="space-y-2 p-3 rounded-lg"
                  style={{ backgroundColor: "var(--color-surface)" }}
                >
                  <h4 style={{ color: "var(--color-text)" }}>Text Sample</h4>
                  <p style={{ color: "var(--color-textSecondary)" }}>
                    This is how your secondary text will appear.
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-1"
                      style={{ backgroundColor: "var(--color-success)" }}
                    ></span>
                    <span style={{ color: "var(--color-success)" }}>
                      Success
                    </span>

                    <span
                      className="inline-block w-3 h-3 rounded-full ml-3 mr-1"
                      style={{ backgroundColor: "var(--color-error)" }}
                    ></span>
                    <span style={{ color: "var(--color-error)" }}>Error</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-sm p-6"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            <h2 className="text-xl font-semibold mb-4">Other Settings</h2>
            <p
              className="text-gray-600"
              style={{ color: "var(--color-textSecondary)" }}
            >
              More account settings would appear here.
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="text-blue-600"
              style={{ color: "var(--color-primary)" }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings;
