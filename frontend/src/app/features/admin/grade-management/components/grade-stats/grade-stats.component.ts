import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {GradeStats} from '../../models/grade-management.model';

interface GradeStatCard {
  label: string;
  value: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-grade-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grade-stats.component.html',
  styleUrl: './grade-stats.component.scss'
})
export class GradeStatsComponent {
  @Input() stats: GradeStats | null = null;

  get cards(): GradeStatCard[] {
    return [
      {label: 'Average', value: this.score(this.stats?.averageScore), icon: 'monitoring', tone: 'blue'},
      {label: 'Best', value: this.score(this.stats?.maxScore), icon: 'emoji_events', tone: 'green'},
      {label: 'Minimum', value: this.score(this.stats?.minScore), icon: 'south_east', tone: 'orange'},
      {label: 'Graded', value: `${this.stats?.gradedCount ?? 0}/${this.stats?.totalStudents ?? 0}`, icon: 'fact_check', tone: 'cyan'},
      {label: 'Completion', value: `${this.completionRate}%`, icon: 'data_check', tone: 'slate'},
      {label: 'Pass / Fail', value: `${this.successRate}% / ${this.failureRate}%`, icon: 'rule', tone: 'red'}
    ];
  }

  get completionRate(): number {
    if (!this.stats?.totalStudents) return 0;
    return Math.round((this.stats.gradedCount / this.stats.totalStudents) * 100);
  }

  get successRate(): number {
    return Math.round(this.stats?.successRate ?? 0);
  }

  get failureRate(): number {
    return Math.max(0, 100 - this.successRate);
  }

  private score(value: number | null | undefined): string {
    return value === null || value === undefined ? '-' : `${value}/20`;
  }
}
