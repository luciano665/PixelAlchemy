// Importing NextResponse from Next.js to facilitate server-side responses
// and relevant utility functions from Vercel Blob Storage
import { NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import crypto from "crypto";

// Define an interface to type the blob objects retrieved from Vercel Blob
interface Blob {
  url: string;
}

/**
 * This POST handler accepts a JSON payload containing a prompt (text),
 * invokes an external image generation service, and stores the generated
 * image in Vercel's blob storage. Finally, it returns the publicly accessible
 * URL to the client.
 */
export async function POST(request: Request) {
  try {
    // Parse the JSON payload from the incoming request
    const body = await request.json();
    const { text } = body;

    // Validate the prompt to ensure that it is a non-empty string
    if (!text || typeof text !== "string") {
      throw new Error("Invalid prompt, you need to provide a string.");
    }

    console.log("Prompt was received", text);

    // Construct the external service URL with the prompt as a query parameter
    const url = new URL("https://luciano665--pixelalchemy-model-generate.modal.run");
    url.searchParams.set("prompt", text);
    
    console.log("Requesting URL:", url.toString());

    // Perform a GET request to the external image generation service
    // The x_API_KEY is provided via environment variables
    // We request a JPEG image in response
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x_API_KEY": process.env.API_KEY || "",
        Accept: "image/jpeg",
      },
    });

    // Check if the external request was successful, otherwise capture and throw error
    if (!response.ok) {
      const errorMsg = await response.text();
      console.log("API response:", errorMsg);
      throw new Error(
        `HTTP error status: ${response.status}, message: ${errorMsg}`
      );
    }

    // The image is received as an ArrayBuffer so that we can directly store it in blob
    const imageBuffer = await response.arrayBuffer();
    // Generate a random UUID-based filename to avoid collisions
    const fileName = `${crypto.randomUUID()}.jpg`;

    // Store the image in Vercel Blob with public access, specifying the correct content type
    const blob = await put(fileName, imageBuffer, {
      access: "public",
      contentType: "image/jpeg",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Return a JSON response containing the newly generated image URL
    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
    });
  } catch (error) {
    // Return an error response if anything fails during the process
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate image",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * This GET handler retrieves all previously saved images from the
 * Vercel Blob Storage and returns their URLs.
 */
export async function GET() {
  try {
    // Fetch the list of all blobs stored (each blob has a .url property)
    const { blobs }: { blobs: Blob[] } = await list();

    // If no images exist, respond with an empty list
    if (!blobs || blobs.length === 0) {
      console.log("No saved images found");
      return NextResponse.json({
        success: true,
        imageUrls: [],
      });
    }

    // Extract URLs from all stored blobs
    const imageUrls = blobs.map((blob) => blob.url);

    console.log("Fetched images saved:", imageUrls);

    // Return the list of image URLs as a success response
    return NextResponse.json({
      success: true,
      imageUrls,
    });
  } catch (error: unknown) {
    // If the blob listing fails, log the error and respond with an error message
    console.log("An error occurred trying to fetch from Blob", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Fail fetching images",
      },
      { status: 500 }
    );
  }
}
