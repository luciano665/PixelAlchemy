import { NextResponse } from "next/server";
import {put} from "@vercel/blob";

 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if(!text || typeof text != "string"){
      throw new Error("Invalid prompt, you need to provide string.")
    }

    console.log("Prompt was recieved", text);

   
    const url = new URL("https://luciano665--pixelalchemy-model-generate.modal.run");
    url.searchParams.set("prompt", text)
    
    console.log("Requating URL: ", url.toString());

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "x_API_KEY": process.env.API_KEY || "",
            Accept: "image/jpeg",
        },
    });

    if (!response.ok) {
        const errorMsg = await response.text();
        console.log("API response: ", errorMsg);
        throw new Error(
            `HTTP error status: ${response.status}, message: ${errorMsg}`
        ); 
    }

    const imageBuffer = await response.arrayBuffer();
    const fileName = `${crypto.randomUUID()}.jpg`

    const blob = await put(fileName, imageBuffer, {
        access: "public",
        contentType: "image/jpeg",
        token: process.env.BLOB_READ_WRITE_TOKEN
    })


    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to generate image",
        details: error instanceof Error ? error.stack: undefined,
       },
      { status: 500 }
    );
  }
}

