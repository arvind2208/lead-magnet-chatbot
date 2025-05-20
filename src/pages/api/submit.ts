// src/pages/api/submit.ts
import type { NextApiRequest, NextApiResponse } from "next";
import https from 'https';

// Create an HTTPS agent that allows self-signed certificates.
// WARNING: Use this ONLY for local development and trusted self-signed certificates.
// Do NOT use rejectUnauthorized: false in production environments with public APIs.
const devAgent = new https.Agent({
  rejectUnauthorized: false,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const externalApiUrl = 'https://localhost:7068/api/leads';
      console.log(`Forwarding request to: ${externalApiUrl}`);
      console.log("Request body to external API:", JSON.stringify(req.body, null, 2));

      // Prepare fetch options separately
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
        // Do NOT include 'agent' here directly
      };

      // Conditionally add the agent for development environments with localhost HTTPS
      if (process.env.NODE_ENV === 'development' && externalApiUrl.startsWith('https://localhost')) {
        (fetchOptions as any).agent = devAgent; // Add agent using type assertion
      }
      // Pass the prepared fetchOptions object to fetch
      const externalApiResponse = await fetch(externalApiUrl, fetchOptions);
      const responseText = await externalApiResponse.text();

      if (!externalApiResponse.ok) {
        console.error(`External API Error (${externalApiResponse.status}):`, responseText);
        res.status(externalApiResponse.status).json({
          message: `Error from external API: ${externalApiResponse.statusText || 'Failed request'}`,
          details: responseText,
          source: 'external-api'
        });
        return;
      }

      try {
        const data = JSON.parse(responseText);
        console.log("External API Success Response Data:", data);
        res.status(200).json(data);
      } catch (parseError) {
        console.error("External API Success (2xx) but non-JSON response:", responseText);
        res.status(502).json({ message: "External API returned success status but non-JSON content.", details: responseText, source: 'external-api-non-json-success' });
      }
    } catch (error) {
      console.error("Error in /api/submit handler (e.g., network issue to external API):", error);
      res.status(500).json({ message: "Internal server error while contacting external API.", error: error instanceof Error ? error.message : String(error), source: 'submit-handler' });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}