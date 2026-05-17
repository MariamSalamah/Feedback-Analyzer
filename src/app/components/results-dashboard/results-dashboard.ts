import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../../models/feedback.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-results-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-dashboard.html',
  styleUrl: './results-dashboard.scss'
})
export class ResultsDashboardComponent implements AfterViewInit, OnChanges {
  @Input() result!: AnalysisResult;
  @Output() reset = new EventEmitter<void>();

  @ViewChild('sentimentChart') sentimentChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('themesChart') themesChartRef!: ElementRef<HTMLCanvasElement>;

  private sentimentChart?: Chart;
  private themesChart?: Chart;

  get npsLabel(): string {
    const s = this.result.npsScore;
    if (s >= 50) return 'Excellent';
    if (s >= 20) return 'Good';
    if (s >= 0) return 'Neutral';
    if (s >= -20) return 'Poor';
    return 'Critical';
  }

  get npsColor(): string {
    const s = this.result.npsScore;
    if (s >= 50) return '#64ffda';
    if (s >= 20) return '#a9a0ff';
    if (s >= 0) return '#f0b429';
    return '#ff6b6b';
  }

  get sentimentLabel(): string {
    const map: Record<string, string> = {
      positive: '😊 Positive',
      negative: '😞 Negative',
      neutral: '😐 Neutral',
      mixed: '🔀 Mixed'
    };
    return map[this.result.overallSentiment] || this.result.overallSentiment;
  }

  get frequencyBadge() {
    return (f: string) => ({
      high: { label: 'High', cls: 'freq--high' },
      medium: { label: 'Medium', cls: 'freq--medium' },
      low: { label: 'Low', cls: 'freq--low' }
    }[f] || { label: f, cls: '' });
  }

  get priorityBadge() {
    return (p: string) => ({
      critical: { label: 'Critical', cls: 'prio--critical' },
      high: { label: 'High Priority', cls: 'prio--high' },
      medium: { label: 'Medium', cls: 'prio--medium' }
    }[p] || { label: p, cls: '' });
  }

  ngAfterViewInit() {
    this.initCharts();
  }

  ngOnChanges() {
    setTimeout(() => this.initCharts(), 100);
  }

  private initCharts() {
    this.destroyCharts();
    if (this.sentimentChartRef?.nativeElement) {
      this.buildSentimentChart();
    }
    if (this.themesChartRef?.nativeElement) {
      this.buildThemesChart();
    }
  }

  private buildSentimentChart() {
    const ctx = this.sentimentChartRef.nativeElement.getContext('2d')!;
    this.sentimentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [{
          data: [
            this.result.sentimentScore.positive,
            this.result.sentimentScore.negative,
            this.result.sentimentScore.neutral
          ],
          backgroundColor: ['#64ffda', '#ff6b6b', '#7c6fff'],
          borderColor: 'transparent',
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw}%`
            }
          }
        },
        animation: { animateRotate: true, duration: 800 }
      }
    });
  }

  private buildThemesChart() {
    const ctx = this.themesChartRef.nativeElement.getContext('2d')!;
    const colors = ['#7c6fff', '#64ffda', '#f0b429', '#ff6b6b', '#60b8ff'];
    this.themesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.result.keyThemes,
        datasets: [{
          label: 'Mentions',
          data: this.result.keyThemes.map((_, i) =>
            Math.floor(this.result.totalFeedbacks * (0.8 - i * 0.12))
          ),
          backgroundColor: colors.slice(0, this.result.keyThemes.length),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } }
          },
          y: {
            grid: { display: false },
            ticks: { color: 'rgba(255,255,255,0.65)', font: { size: 12 } }
          }
        },
        animation: { duration: 800 }
      }
    });
  }

  private destroyCharts() {
    this.sentimentChart?.destroy();
    this.themesChart?.destroy();
  }

  exportReport() {
    const data = JSON.stringify(this.result, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-report-${Date.now()}.json`;
    a.click();
  }
}
