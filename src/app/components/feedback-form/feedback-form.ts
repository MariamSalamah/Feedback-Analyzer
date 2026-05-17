import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackInput } from '../../models/feedback.model';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-form.html',
  styleUrl: './feedback-form.scss'
})
export class FeedbackFormComponent {
  @Output() analyze = new EventEmitter<{ input: FeedbackInput; useMock: boolean }>();

  productName = '';
  feedbackText = '';
  // apiKey = '';
  analysisType: 'quick' | 'detailed' = 'detailed';
  // showApiKey = false;
  useMockData = false;

  sampleFeedbacks = [
    `The app crashes every time I try to upload a file larger than 10MB. This is extremely frustrating and I've lost work multiple times. Please fix this ASAP!`,
    `I absolutely love the dashboard design. It's clean, intuitive and everything is where I expect it to be. The analytics features are top-notch!`,
    `Customer support is non-existent. I sent 3 emails over 2 weeks and got zero response. When you're paying this much, you expect better service.`,
    `The mobile app needs serious work. Features that work on desktop are completely broken on iPhone. Buttons don't respond, pages don't load properly.`,
    `Overall satisfied with the product but the pricing feels a bit steep for small businesses like ours. Would love a more affordable starter plan.`,
    `The new export to PDF feature is fantastic! Saved me hours of manual work. Keep adding features like this and you'll have a customer for life.`,
    `Loading times have gotten worse with the latest update. Pages that used to load instantly now take 5-8 seconds. Not acceptable for a productivity tool.`,
    `Onboarding was confusing. Took me 3 days to figure out the basics. A proper tutorial or video walkthrough would make a huge difference.`
  ];

  loadSample() {
    this.productName = 'ProjectFlow Pro';
    this.feedbackText = this.sampleFeedbacks.join('\n\n---\n\n');
    this.useMockData = false;
  }

  get feedbackCount(): number {
    if (!this.feedbackText.trim()) return 0;
    return this.feedbackText
      .split(/\n\s*---\s*\n|\n{3,}/)
      .map(f => f.trim())
      .filter(f => f.length > 10).length || 1;
  }

  get isValid(): boolean {
    return (this.productName.trim().length > 0) &&
           (this.feedbackText.trim().length > 20 || this.useMockData);
  }

  onSubmit() {
    if (!this.isValid) return;

    // if (!this.useMockData && this.apiKey) {
    //   (window as any).__ANTHROPIC_KEY__ = this.apiKey;
    // }

    const feedbacks = this.useMockData
      ? this.sampleFeedbacks
      : this.feedbackText
          .split(/\n\s*---\s*\n|\n{3,}/)
          .map(f => f.trim())
          .filter(f => f.length > 10);

    const input: FeedbackInput = {
      feedbacks,
      productName: this.productName || 'My Product',
      analysisType: this.analysisType
    };

    this.analyze.emit({ input, useMock: this.useMockData });
  }
}
