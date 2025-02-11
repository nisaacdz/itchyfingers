import { Challenge } from "../types/request";
import { Axios } from "../util/axios";

export { websocketAPI } from "./websockets";

export async function getTypingText(challengeId: string) {
    try {
        const req = await Axios.get(`challenges/${challengeId}/text`);

        if (req.status !== 200) {
            throw new Error("Failed to fetch typing text");
        }

        return (req.data.text || "") as string;
    } catch (e) {
        throw new Error("Failed to fetch typing text");
    }
}

export async function fetchChallenges({ pageParam = 1, pageSize = 10 }) {
    try {
        const req = await Axios.get("/challenges", {
            params: {
                page: pageParam,
                pageSize,
            },
        });

        if (req.status !== 200) {
            throw new Error("Failed to fetch challenges");
        }

        console.log(req.data)
        
        return req.data as { challenges: Challenge[]; totalPages: number };
    } catch (e) {
        throw new Error("Failed to fetch challenges");
    }
}
