// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  author: 'user' | 'bot';
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private backendUrl = 'http://localhost:8080/api/chat'; // Your Spring Boot API URL

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(this.backendUrl, { message });
  }
}