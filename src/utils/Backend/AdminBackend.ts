import {Backend, type BackendResponse} from "./Backend";

export interface VideoFilters {
    limit?: string | number;
    verified?: string | boolean;
    sortBy?: string;
    music?: string | boolean;
    hasNER?: string | boolean;
}

export interface VideosResponse {
    videos: any[];
    pagination: {
        totalVideos: number;
        limit: number;
        offset: number;
    };
}

export interface GenreReviewPayload {
    watchID: string;
    genres: string[];
}

export interface MusicReviewPayload {
    watchID: string;
    is_music: boolean;
}

export interface NERReviewPayload {
    watchID: string;
    language: string;
    namedEntities: any[];
}

export interface AIPredictionPayload {
    watchID: string;
}

export default class AdminBackend extends Backend {
    static async getVideos(filters: VideoFilters = {}): Promise<BackendResponse<VideosResponse>> {
        return AdminBackend.GET("/videos", filters as Record<string, any>);
    }

    static async submitGenreReview(payload: GenreReviewPayload): Promise<BackendResponse<any>> {
        return AdminBackend.POST("/review/genre", payload);
    }

    static async submitMusicReview(payload: MusicReviewPayload): Promise<BackendResponse<any>> {
        return AdminBackend.POST("/review/music", payload);
    }

    static async submitNERReview(payload: NERReviewPayload): Promise<BackendResponse<any>> {
        return AdminBackend.POST("/review/ner", payload);
    }

    static async getAIPrediction(payload: AIPredictionPayload): Promise<any> {
        return AdminBackend.GET("/ai/ner", payload);
    }

    static async getAdminActivity(): Promise<BackendResponse<any>> {
        return AdminBackend.GET("/admin/activity-logs");
    }
}
