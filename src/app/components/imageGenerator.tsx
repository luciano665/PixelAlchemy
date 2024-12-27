"use client";

// Import necessary React hooks for state and side-effect management
import { useEffect, useState } from "react";

// Define the props interface for the ImageGenerator component
interface ImageGeneratorProps {
  /**
   * A function to generate an image based on the provided text prompt.
   * @param text - The text prompt describing the desired image.
   * @returns A promise that resolves to an object containing the success status,
   *          the generated image URL if successful, and an error message if not.
   */
  generateImage: (
    text: string
  ) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
}

/**
 * ImageGenerator Component
 *
 * This component allows users to input a text prompt to generate an image.
 * It handles the submission of the prompt, displays the generated image,
 * and fetches previously generated images from the server.
 *
 * @param generateImage - Function to call the backend API for image generation.
 */
export default function ImageGenerator({ generateImage }: ImageGeneratorProps) {
  // State to manage the current input text from the user
  const [inputText, setInputText] = useState("");

  // State to indicate if an image generation request is in progress
  const [isLoading, setIsLoading] = useState(false);

  // State to hold the URL of the newly generated image
  const [imageURL, setImageURL] = useState<string | null>(null);

  // State to capture and display any errors that occur during image generation or fetching
  const [error, setError] = useState<string | null>(null);

  // States to manage previously generated images
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [loadingImages, setImagesLoading] = useState(true);

  /**
   * useEffect Hook - Fetches previously generated images when the component mounts.
   *
   * This side-effect runs once after the component is mounted and attempts to
   * retrieve a list of previously saved images from the backend API.
   */
  useEffect(() => {
    /**
     * fetcheSavedImages - Asynchronous function to fetch saved images from the server.
     *
     * It sends a GET request to the `/api/generate-image` endpoint to retrieve
     * previously generated images. On success, it updates the `savedImages` state.
     * On failure, it sets an error message.
     */
    const fetcheSavedImages = async () => {
      try {
        // Send a GET request to fetch saved images
        const response = await fetch("/api/generate-image", {
          method: "GET",
        });

        // Parse the JSON response
        const data = await response.json();

        // Check if the response indicates success
        if (!data.success) {
          throw new Error(
            data.error || "Failed to fetch images generated before"
          );
        }

        // Update the savedImages state with the fetched image URLs
        setSavedImages(data.imageUrl || []);
      } catch (error) {
        // Log the error and update the error state to notify the user
        console.log("Error fetching images", error);
        setError("Unable to load images");
      } finally {
        // Regardless of success or failure, indicate that loading has finished
        setImagesLoading(false);
      }
    };

    // Invoke the asynchronous function to fetch saved images
    fetcheSavedImages();
  }, []); // Empty dependency array ensures this runs only once on mount

  /**
   * handleSubmit - Event handler for form submission.
   *
   * This function handles the user's request to generate a new image based on
   * the input text. It manages the loading state, calls the `generateImage` prop,
   * updates the relevant states based on the response, and handles any errors.
   *
   * @param e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the default form submission behavior which would cause a page reload
    e.preventDefault();

    // Indicate that a generation request is in progress
    setIsLoading(true);

    // Reset previous image and error states
    setImageURL(null);
    setError(null);

    try {
      // Call the generateImage function passed via props with the input text
      const result = await generateImage(inputText);

      // Check if the generation was unsuccessful and throw an error if so
      if (!result.success) {
        console.log(result.error);
        throw new Error(
          result.error || "Failed trying to generate the Image 😖"
        );
      }

      // If an image URL is returned, update the imageURL state and prepend it to savedImages
      if (result.imageUrl) {
        setImageURL(result.imageUrl);
        setSavedImages(prev => [result.imageUrl!, ...prev]);
      } else {
        // If no image URL is received, throw an error
        throw new Error("No image URL was received 😭");
      }

      // Clear the input text field after successful submission
      setInputText("");
    } catch (error) {
      // Log the error and update the error state to display a message to the user
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Not able to generate the image 😭"
      );
    } finally {
      // Indicate that the generation request has completed
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-8">
      {/* Header Section */}
      <header className="text-center mb-12 animate-fade-in">
        <h1 className="text-6xl font-extrabold tracking-widest">
          PIXELALCHEMY 🎨
        </h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Display Error Message if any */}
        {error && (
          <div className="w-full max-w-2xl p-4 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Display the newly generated image */}
        {imageURL && (
          <div className="w-full max-w2xl rounded-lg overflow-hidden shadow-lg">
            <img
              src={imageURL}
              alt="Artwork generated"
              className="mx-auto max-w-6xl h-auto"
            />
          </div>
        )}

        {/* Display Loading Spinner while generating image */}
        {isLoading && (
          <div className="w-full max-w-2xl flex items-center justify-center">
            <div
              className="w-12 h-12 border-4 border-gray-300 border-t-black dark:border-gray-500"
              style={{ animation: "spin 1s linear infinite" }}
            />
          </div>
        )}

        {/* Section to Display Previously Generated Images */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Look at previous images generated by PixelAlchemy
          </h2>

          {/* Show loading text while fetching saved images */}
          {loadingImages && <p>Loading images 🔎....</p>}

          {/* Display saved images in a responsive grid if available */}
          {!loadingImages && savedImages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {savedImages.map((url, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden shadow-lg"
                >
                  <img
                    src={url}
                    alt={`Saved image ${index + 1}`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Display a message if no saved images are found */}
          {!loadingImages && savedImages.length === 0 && (
            <p className="text-gray-600">No saved images found</p>
          )}
        </div>
      </main>

      {/* Footer Section containing the Image Generation Form */}
      <footer className="w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            {/* Input field for the user to enter the image description */}
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Describe the image you want to generate..."
              disabled={isLoading} // Disable input while loading
            />

            {/* Submit button to trigger image generation */}
            <button
              type="submit"
              disabled={isLoading} // Disable button while loading
              className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
            >
              {/* Display different button text based on loading state */}
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
