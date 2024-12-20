import { error } from "console";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    // TODO: Call your Image Generation API here
    // For now, we'll just echo back the text


    //Validation of valid prompt
    if(!text || text.trim() === ""){
      return NextResponse.json({
        success: false, error: "No prompt was provided"
      },
    {status: 400});
    }

    //Calling the wependpoint from Modal
    const webEndPoint = `https://luciano665--pixelalchemy-inference-web-dev.modal.run/?prompt=${encodeURI(text)}`;

    const response = await fetch(webEndPoint);

    if(!response.ok){
      throw new Error("Got and errro trying to generate the image");
    }

    //We need the image in the binary values = which is the image data
    const buffer = await response.arrayBuffer();
    const img64 = Buffer.from(buffer).toString("base64");

    //Create data URL form IMG
    const dataURL = `data:image/jpeg;base64,${img64}`;


    return NextResponse.json({
      success: true,
      image: dataURL,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
