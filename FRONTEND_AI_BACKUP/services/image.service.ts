import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImageIdentifyRequest {
    imageUrl?: string;
    imageData?: string; // base64 encoded image
}

export interface ImageIdentifyResponse {
    success: boolean;
    detectedType?: string;
    detectedColor?: string;
    detectedStyle?: string;
    suggestion: string;
    imageUrl?: string;
    error?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ImageService {
    private apiUrl = 'http://localhost:8080/api/image';

    constructor(private http: HttpClient) { }

    identifyImage(request: ImageIdentifyRequest): Observable<ImageIdentifyResponse> {
        return this.http.post<ImageIdentifyResponse>(`${this.apiUrl}/identify`, request);
    }
}
