import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header';
import { FeedbackFormComponent } from './components/feedback-form/feedback-form';
import { ResultsDashboardComponent } from './components/results-dashboard/results-dashboard';
import { FeedbackAnalysisService } from './services/feedback-analysis.service';
import { AnalysisResult, FeedbackInput } from './models/feedback.model';

type AppState = 'form' | 'loading' | 'result' | 'error';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FeedbackFormComponent, ResultsDashboardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  state: AppState = 'form';
  result: AnalysisResult | null = null;
  errorMessage = '';
  loadingSteps = [
    'Parsing feedback entries...',
    'Running sentiment analysis...',
    'Identifying key themes...',
    'Generating recommendations...',
    'Compiling executive report...'
  ];
  currentStep = 0;
  private stepInterval?: ReturnType<typeof setInterval>;

  constructor(private analysisService: FeedbackAnalysisService) {}

  onAnalyze(payload: { input: FeedbackInput; useMock: boolean }) {
    this.state = 'loading';
    this.currentStep = 0;
    this.startLoadingAnimation();

    // if (payload.useMock) {
    //   setTimeout(() => {
    //     this.stopLoadingAnimation();
    //     this.result = this.analysisService.getMockResult(payload.input);
    //     this.state = 'result';
    //   }, 3500);
    //   return;
    // }

    this.analysisService.analyzeFeedback(payload.input).subscribe({
      next: (result) => {
        this.stopLoadingAnimation();
        this.result = result;
        this.state = 'result';
      },
      error: (err: Error) => {
        this.stopLoadingAnimation();
        this.errorMessage = err.message || 'Analysis failed. Please check your API key and try again.';
        this.state = 'error';
      }
    });
  }

  private startLoadingAnimation() {
    this.stepInterval = setInterval(() => {
      if (this.currentStep < this.loadingSteps.length - 1) {
        this.currentStep++;
      }
    }, 650);
  }

  private stopLoadingAnimation() {
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
    }
    this.currentStep = this.loadingSteps.length - 1;
  }

  reset() {
    this.state = 'form';
    this.result = null;
    this.errorMessage = '';
    this.currentStep = 0;
  }
}
