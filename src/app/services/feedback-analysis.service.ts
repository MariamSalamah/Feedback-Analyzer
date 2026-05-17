import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeedbackInput, AnalysisResult } from '../models/feedback.model';


@Injectable({
  providedIn: 'root'
})
export class FeedbackAnalysisService {

  private readonly OPENAI_API = 'https://api.openai.com/v1/chat/completions';

  constructor(private http: HttpClient) {}

 analyzeFeedback(input: FeedbackInput): Observable<AnalysisResult> {
  return this.http.post<AnalysisResult>('http://localhost:3000/analyze', {
    feedbacks: input.feedbacks,
    productName: input.productName,
  }).pipe(
    catchError(err => throwError(() => new Error(err.error?.error || err.message)))
  );
}

//   private async callOpenAI(input: FeedbackInput): Promise<AnalysisResult> {
//     const feedbackText = input.feedbacks
//       .map((f, i) => `[${i + 1}] ${f}`)
//       .join('\n\n');

//     const prompt = `You are a business intelligence analyst. Analyze these ${input.feedbacks.length} customer feedback entries for "${input.productName}".

// FEEDBACK ENTRIES:
// ${feedbackText}

// Respond ONLY with a valid JSON object (no markdown, no backticks) matching this exact schema:
// {
//   "productName": "${input.productName}",
//   "totalFeedbacks": ${input.feedbacks.length},
//   "overallSentiment": "positive|negative|neutral|mixed",
//   "sentimentScore": {
//     "positive": <0-100 integer>,
//     "negative": <0-100 integer>,
//     "neutral": <0-100 integer>
//   },
//   "summary": "<2-3 sentence executive summary>",
//   "keyThemes": ["<theme1>", "<theme2>", "<theme3>", "<theme4>", "<theme5>"],
//   "problems": [
//     {
//       "title": "<short title>",
//       "description": "<what the problem is>",
//       "frequency": "high|medium|low",
//       "affectedArea": "<product area>"
//     }
//   ],
//   "recommendations": [
//     {
//       "title": "<action title>",
//       "description": "<specific actionable recommendation>",
//       "priority": "critical|high|medium",
//       "impact": "<expected business impact>"
//     }
//   ],
//   "npsScore": <integer -100 to 100>,
//   "analyzedAt": "${new Date().toISOString()}"
// }

// Rules:
// - sentimentScore values must sum to 100
// - Include 3-5 problems ordered by frequency
// - Include 3-5 recommendations ordered by priority
// - Be specific and data-driven`;

//     const response = await fetch(this.OPENAI_API, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${environment.anthropicApiKey}`
//       },
//       body: JSON.stringify({
//         model: 'gpt-4o-mini',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are a business intelligence analyst. Always respond with valid JSON only.'
//           },
//           {
//             role: 'user',
//             content: prompt
//           }
//         ],
//         max_tokens: 2000,
//         temperature: 0.3
//       })
//     });

//     if (!response.ok) {
//       const err = await response.json();
//       throw new Error(err?.error?.message || 'OpenAI API request failed');
//     }

//     const data = await response.json();
//     const text = data.choices?.[0]?.message?.content || '';

//     try {
//       return JSON.parse(text) as AnalysisResult;
//     } catch {
//       const match = text.match(/\{[\s\S]*\}/);
//       if (match) return JSON.parse(match[0]) as AnalysisResult;
//       throw new Error('Failed to parse AI response');
//     }
//   }

  analyzeViaWebhook(input: FeedbackInput): Observable<AnalysisResult> {
    return this.http.post<AnalysisResult>('YOUR_N8N_WEBHOOK_URL', input).pipe(
      catchError(err => throwError(() => new Error(err.message)))
    );
  }

  // getMockResult(input: FeedbackInput): AnalysisResult {
  //   return {
  //     productName: input.productName,
  //     totalFeedbacks: input.feedbacks.length,
  //     overallSentiment: 'mixed',
  //     sentimentScore: { positive: 42, negative: 35, neutral: 23 },
  //     summary: `Analysis of ${input.feedbacks.length} feedback entries for ${input.productName} reveals a mixed customer experience. While users appreciate core functionality, significant pain points exist around performance and support responsiveness.`,
  //     keyThemes: ['User Interface', 'Performance Issues', 'Customer Support', 'Feature Requests', 'Pricing Concerns'],
  //     problems: [
  //       {
  //         title: 'Slow Loading Times',
  //         description: 'Multiple users report the application takes 5–10 seconds to load.',
  //         frequency: 'high',
  //         affectedArea: 'Performance'
  //       },
  //       {
  //         title: 'Unresponsive Support Team',
  //         description: 'Customers wait 3–5 business days for support responses.',
  //         frequency: 'high',
  //         affectedArea: 'Customer Support'
  //       },
  //       {
  //         title: 'Mobile Experience Gaps',
  //         description: 'Key features are unavailable or broken on mobile devices.',
  //         frequency: 'medium',
  //         affectedArea: 'Mobile App'
  //       }
  //     ],
  //     recommendations: [
  //       {
  //         title: 'Implement Performance Optimization Sprint',
  //         description: 'Audit and optimize database queries, implement CDN caching, and add lazy loading.',
  //         priority: 'critical',
  //         impact: 'Reduce churn by ~25% and improve conversion rates'
  //       },
  //       {
  //         title: 'Hire 2 Additional Support Agents',
  //         description: 'Expand support team to reduce first-response time to under 4 hours.',
  //         priority: 'high',
  //         impact: 'Increase customer satisfaction score by 30+ points'
  //       },
  //       {
  //         title: 'Launch Mobile App Redesign',
  //         description: 'Rebuild critical flows with a mobile-first approach.',
  //         priority: 'high',
  //         impact: 'Capture 40% more mobile users'
  //       }
  //     ],
  //     npsScore: 12,
  //     analyzedAt: new Date().toISOString()
  //   };
  // }
}
