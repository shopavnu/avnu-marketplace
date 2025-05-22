import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { merchantId, shopDomain } = req.query;

  if (
    !merchantId ||
    !shopDomain ||
    Array.isArray(merchantId) ||
    Array.isArray(shopDomain)
  ) {
    return res.status(400).json({ error: "Missing or invalid parameters" });
  }

  try {
    // Call the backend API to get the authorization URL
    const backendResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/integrations/shopify/authorize`,
      {
        params: {
          merchantId,
          shopDomain,
        },
      },
    );

    return res.status(200).json({ url: backendResponse.data.url });
  } catch (error) {
    console.error("Error generating Shopify authorization URL:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate Shopify authorization URL" });
  }
}
