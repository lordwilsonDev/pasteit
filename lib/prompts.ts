/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const RANDOM_PROMPTS: string[] = [
    "A cyberpunk city street at night, neon signs reflecting on wet pavement.",
    "An enchanted forest library, with books growing on trees.",
    "A retro-futuristic diner on Mars, with a view of the stars.",
    "A tranquil Japanese garden with a koi pond and cherry blossoms.",
    "The interior of a grand, baroque-style spaceship bridge.",
    "A minimalist desert landscape at sunset, with long shadows.",
    "A whimsical candy land with chocolate rivers and lollipop trees.",
    "A steampunk workshop filled with gears, gadgets, and steam.",
    "An underwater city made of coral and bioluminescent plants.",
    "A post-apocalyptic wasteland with overgrown ruins of a modern city.",
];

export interface StylePreset {
    name: string;
    prompt: string;
}

export const STYLE_PRESETS: StylePreset[] = [
    { name: "Cinematic", prompt: "cinematic lighting, dramatic, high detail, 8k" },
    { name: "Fantasy Art", prompt: "fantasy, painterly, intricate detail, epic, matte painting" },
    { name: "Watercolor", prompt: "watercolor painting, soft, blended, artistic" },
    { name: "Vintage Photo", prompt: "vintage photograph, sepia, grainy, 1940s style" },
    { name: "Anime", prompt: "anime style, vibrant colors, cel-shaded, studio ghibli inspired" },
    { name: "Cyberpunk", prompt: "cyberpunk, neon, futuristic, dystopian, high tech" },
    { name: "Minimalist", prompt: "minimalist, clean, simple, solid color background" },
];

export const LOADING_MESSAGES: string[] = [
    "Warming up the AI brushes...",
    "Mixing the digital paints...",
    "Weaving the background threads...",
    "Consulting the muses of creativity...",
    "Adding the finishing touches...",
    "Rendering pixels into a masterpiece...",
];
