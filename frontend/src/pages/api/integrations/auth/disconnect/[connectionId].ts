import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { connectionId } = req.query;

  if (!connectionId || Array.isArray(connectionId)) {
    return res.status(400).json({ error: "Missing or invalid connection ID" });
  }

  try {
    // Call the backend API to disconnect the platform
    const backendResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/integrations/disconnect/${connectionId}`,
    );

    return res.status(200).json({ success: backendResponse.data.success });
  } catch (error) {
    console.error("Error disconnecting platform:", error);
    return res.status(500).json({ error: "Failed to disconnect platform" });
  }
}
