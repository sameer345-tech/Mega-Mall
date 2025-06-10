import dotenv from "dotenv";
dotenv.config();

import { OpenAI } from "openai/client.js";
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
export async function suggestImageDetails(imageUrl: string) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
You are an e-commerce product data generator.

Given the product image, return an array of  object.  must include a "title" and "description" key.
- "title" should be short, attractive, and SEO-friendly.
- "description" should be 1-2 lines long, clearly describing the product’s key features, materials, or usage.
- Avoid generic phrases. Be product-specific based on the image.

Return the result in JSON format like:
[
  { "title": "Stylish Wooden Coffee Table", "description": "A handcrafted coffee table made from solid oak, perfect for modern living rooms." },
  ...
]
Now, here is the image:
          `,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const message = response.choices[0]?.message?.content;
    return JSON.parse(message as string);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      return error.message;
    }
    return "Something went wrong during image suggestion generation.";
  }
}
