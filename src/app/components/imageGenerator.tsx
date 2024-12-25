"use client";

import { useEffect, useState } from "react";
//import { generateImage } from "../actions/generateImage";
interface ImageGeneratorProps {
  generateImage: (
    text: string
  ) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
}

export default function ImageGenerator({ generateImage }: ImageGeneratorProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  //States to display images generated before
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [loadingImages, setImagesLoading] = useState(true);

  useEffect(() => {
    const fetcheSavedImages = async () => {
      try {
        const response = await fetch("/api/generate-image", {
          method: "GET",
        });
        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error || "Failed to fetch images generated before"
          );
        }
        setSavedImages(data.imageUrl || []);
      } catch (error) {
        console.log("Error fectching imagaes", error);
        setError("Unable to load images");
      } finally {
        setImagesLoading(false);
      }
    };
    fetcheSavedImages();
  }, []);

  // Submit handle

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setImageURL(null);
    setError(null);

    try {
      const result = await generateImage(inputText);

      if (!result.success) {
        console.log(result.error);
        throw new Error(
          result.error || "Failed trying to generate the Image 😖"
        );
      }

      if (result.imageUrl) {
        setImageURL(result.imageUrl);
      } else {
        throw new Error("No image URL was recieved 😭");
      }
      setInputText("");
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Not able to generate the image 😭"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-8">
      <main className="flex-1">
        {/* Main content can go here */}
        {error && (
          <div className="w-full max-w-2xl p-4 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {imageURL && (
          <div className="w-full max-w2xl rounded-lg overflow-hidden shadow-lg">
            <img
              src={imageURL}
              alt="Artwork generated"
              className="w-full h-auto"
            />
          </div>
        )}

        {isLoading && (
          <div className="w-full max-w-2xl flex items-center justify-center">
            <div
              className="w-12 h-12 border-4 border-gray-300border-t-black dark:border-gray-500"
              style={{ animation: "spin 1s linear infinite" }}
            />
          </div>
        )}

        {/* SAVED IMAGES DISPLAY */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">SAVED IMAGES</h2>
          {loadingImages && <p>Loading images 🔎....</p>}

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
          {!loadingImages && savedImages.length === 0 && (
            <p className="text-gray-600">No saved images found</p>
          )}
        </div>
      </main>

      <footer className="w-full max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="Describe the image you want to generate..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
