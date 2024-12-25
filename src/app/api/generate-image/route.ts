import { NextResponse } from "next/server";
import {put, list} from "@vercel/blob";
import crypto from "crypto";

interface Blob {
  url: string;
}


 

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

//Fecth images
export async function GET() {
  try {
    const {blobs}: {blobs: Blob[]} = await list();
    if(!blobs || blobs.length === 0) {
      console.log("No saved images found");
      return NextResponse.json({
        success: true,
        imageUrls: [],
      });
    }
    const imageUrls = blobs.map(blob => blob.url);

    console.log("Fetched images saved:", imageUrls);

    return NextResponse.json({
      success: true,
      imageUrls,
    });
  } catch(error: unknown){
    console.log("An error occur trying to fetch from BLOB", error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Fail fetching images"
      },
      {status: 500}
    );
  }
}

