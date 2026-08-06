import { GoogleGenAI } from "@google/genai";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponses.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const tools = [
    {
        functionDeclarations: [
            {
                name: "search_videos",
                description: "Search for videos on the platform by title keyword.",
                parameters: {
                    type: "object",
                    properties: {
                        query: { type: "string", description: "Keyword to search video titles for" },
                    },
                    required: ["query"],
                },
            },
            {
                name: "find_channel",
                description: "Find a channel/user by username.",
                parameters: {
                    type: "object",
                    properties: {
                        username: { type: "string", description: "Username or partial username to search for" },
                    },
                    required: ["username"],
                },
            },
        ],
    },
];

const SYSTEM_PROMPT = `You are a helpful assistant embedded in TuneX, a video-sharing platform.
You help users find videos, find channels, and navigate the app.

Write in plain conversational sentences only. Do not use markdown formatting of any kind — no asterisks for bold or italics, no bullet points, no numbered lists, no headers. Your responses are rendered as plain text, so any markdown symbols would show up as literal characters instead of formatting.

Available pages in the app (mention these when relevant):
- / — Home feed
- /subscriptions — videos from subscribed channels
- /playlists — user's playlists
- /dashboard — manage your own uploaded videos
- /upload — upload a new video
- /settings — update avatar, cover image, account details
- /history — watch history
- /search?query=TERM — search results page

When a user asks to find a video or channel, use the tools available to look it up in the real database — don't guess or make up results. Keep replies short and conversational. Don't wrap results in markdown lists yourself — just describe what you found in a sentence; the actual clickable results are shown separately by the app.`;

const runTool = async (name, args) => {
    if (name === "search_videos") {
        if (!args?.query) return { videos: [] };

        const videos = await Video.find({
            title: { $regex: args.query, $options: "i" },
            isPublished: true,
        })
        .limit(5)
        .populate("owner", "username avatar");

        return {
            videos: videos.map(v => ({
                _id: v._id, title: v.title, thumbnail: v.thumbnail, owner: v.owner?.username
            }))
        };
    }

    if (name === "find_channel") {
        if (!args?.username) return { channels: [] };

        const users = await User.find({
            username: { $regex: args.username, $options: "i" },
        })
        .limit(5)
        .select("username fullname avatar");

        return { channels: users };
    }

    return { error: "Unknown tool" };
};

const callGemini = async (contents) => {
    try {
        return await genAI.models.generateContent({
            model: "gemini-3.6-flash",
            contents,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                tools,
            },
        });
    } catch (err) {
        if (err?.status === 429 || err?.error?.code === 429) {
            throw new ApiError(429, "FREE CREDITS EXPIRED. Please wait 30-40 seconds and try again.");
        }
        throw err;
    }
};

const chatWithAgent = asyncHandler(async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message?.trim())
        throw new ApiError(400, "Message is required");

    let contents = [
        ...history,
        { role: "user", parts: [{ text: message }] },
    ];

    let foundVideos = [];
    let foundChannels = [];

    let response = await callGemini(contents);
    let functionCalls = response.functionCalls;

    while (functionCalls && functionCalls.length > 0) {
        const modelParts = response.candidates?.[0]?.content?.parts;
        if (modelParts) {
            contents.push({ role: "model", parts: modelParts });
        }

        const functionResponseParts = [];
        for (const call of functionCalls) {
            const result = await runTool(call.name, call.args);

            if (result.videos) foundVideos.push(...result.videos);
            if (result.channels) foundChannels.push(...result.channels);

            functionResponseParts.push({
                functionResponse: {
                    name: call.name,
                    response: result,
                },
            });
        }

        contents.push({ role: "user", parts: functionResponseParts });

        response = await callGemini(contents);
        functionCalls = response.functionCalls;
    }

    const reply = response.text || "";

    const finalModelParts = response.candidates?.[0]?.content?.parts;
    if (finalModelParts) {
        contents.push({ role: "model", parts: finalModelParts });
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            reply,
            videos: foundVideos,
            channels: foundChannels,
            history: contents,
        }, "Agent responded")
    );
});

export { chatWithAgent };