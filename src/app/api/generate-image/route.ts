import { NextResponse } from "next/server";
import {put} from "@vercel/blob";
import { error } from "console";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    // TODO: Call your Image Generation API here
    // For now, we'll just echo back the text
    if (!process.env.URL) {
        throw new Error("URL environment variable is not defined");
    }
    const url = new URL(process.env.URL);

    url.searchParams.set("prompt", text)


    console.log("Requating URL: ", url.toString());

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "X-API-KEY": process.env.API_KEY || "",
            Accept: "image/jpeg",
        },
    });

    if (!response.ok) {
        const errorMsg = await response.text();
        console.log("API response: ", errorMsg);
        throw new Error(
            `HTTP error status: ${response.status}, message: ${errorMsg}`
        ) 
    }

    const imageBuffer = await response.arrayBuffer();

    const fileName = `${crypto.randomUUID()}.jpg`

    const blob = await put(fileName, imageBuffer, {
        access: "public",
        contentType: "image/jpeg"
    })


    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}

