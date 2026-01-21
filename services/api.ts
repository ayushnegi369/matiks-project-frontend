import { Platform } from 'react-native';

// Use environment variable for BASE_URL
// Expo automatically injects variables prefixed with EXPO_PUBLIC_
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://matiks-project-backend.onrender.com";

export interface User {
    username: string;
    rating: number;
    rank: number;
}

export const fetchLeaderboard = async (limit = 50): Promise<User[]> => {
    try {
        const response = await fetch(`${BASE_URL}/leaderboard?limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch leaderboard");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const searchUsers = async (query: string): Promise<User[]> => {
    try {
        if (!query) return [];
        const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Failed to search users");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};
export const simulateTraffic = async (): Promise<any> => {
    try {
        const response = await fetch(`${BASE_URL}/simulate`);
        if (!response.ok) throw new Error("Failed to simulate traffic");
        return await response.json();
    } catch (error) {
        console.error(error);
        return { message: "Error simulating traffic" };
    }
};
