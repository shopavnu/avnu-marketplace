import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { merchantId } = req.query;

  if (!merchantId || Array.isArray(merchantId)) {
    return res.status(400).json({ error: 'Missing or invalid merchant ID' });
  }

  try {
    // Call the backend API to get platform connections for this merchant
    const backendResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/integrations/connections/${merchantId}`
    );

    return res.status(200).json(backendResponse.data);
  } catch (error) {
    console.error('Error fetching platform connections:', error);
    return res.status(500).json({ error: 'Failed to fetch platform connections' });
  }
}
