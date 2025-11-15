import { Component } from '@angular/core';
import { ChatMessage, ChatService } from '../../services/chat.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-chat-widget',
  imports: [NgFor,NgIf],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent {
    messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;

  constructor(private chatService: ChatService) {
    // Initial greeting from the bot
    this.messages.push({ author: 'bot', text: 'Hi! I am GeminiStore. How can I help you find the perfect product today?' });
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;
    console.log(this.userInput);
    

    // Add user message to chat
    this.messages.push({ author: 'user', text: this.userInput });
    const userMessage = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    // Send to backend and get bot response
    this.chatService.sendMessage(userMessage).subscribe({
      next: (response) => {
        this.messages.push({ author: 'bot', text: response.reply });
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({ author: 'bot', text: 'Oops! Something went wrong. Please try again later.' });
        this.isLoading = false;
      }
    });
  }

}
