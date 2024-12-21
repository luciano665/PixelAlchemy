/**
 * Fetch request form the server side so the api URL is protected
 */

"use server";

export async function generateImage(text: string) {
    try{
        const response = await fetch(`http://localhost:3000/api/generate-image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X_API_SECRET": process.env.API_SECRET || "",
            },
            body: JSON.stringify({text})
        });

        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json()
        return data;
    } catch(error){
        console.log("Server error", error)
        return {
            success: false,
            error: error instanceof Error ? error.message: "Failed attemp to generate image"
        };
    }
    
}