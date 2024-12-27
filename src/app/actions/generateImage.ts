/**
 * Server-side function to generate an image based on a text prompt.
 * This function securely communicates with the internal API endpoint
 * to ensure that sensitive information, such as API keys, remains protected.
 */

"use server";

// Define the shape of the response returned by the generateImage function
interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Generates an image by sending a text prompt to the internal API.
 * 
 * @param text - The text prompt describing the desired image.
 * @returns A promise that resolves to an object indicating the success status,
 *          the URL of the generated image if successful, and an error message if not.
 */
export async function generateImage(text: string): Promise<GenerateImageResponse> {
  try {
    // Send a POST request to the internal API endpoint to generate an image
    const response = await fetch(`http://localhost:3000/api/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include the API secret in the headers for authentication
        // The API_KEY is retrieved from environment variables to keep it secure
        "x_API_SECRET": process.env.API_KEY || "",
      },
      // Serialize the text prompt into a JSON string as the request body
      body: JSON.stringify({ text }),
    });

    // Check if the response status indicates a successful request
    if (!response.ok) {
      // Log the response text for debugging purposes
      const errorText = await response.text();
      console.error("API Response Error:", errorText);

      // Throw an error with the status text to be caught in the catch block
      throw new Error(`HTTP error! status: ${response.statusText}`);
    }

    // Parse the JSON response from the API
    const data: GenerateImageResponse = await response.json();

    // Return the parsed data, which includes success status and image URL if successful
    return data;
  } catch (error) {
    // Log the error details for server-side debugging
    console.error("Server error during image generation:", error);

    // Return a standardized error response
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed attempt to generate image",
    };
  }
}
