import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {GradeRecord} from '../../models/grade-management.model';

interface DistributionBucket {
  label: string;
  min: number;
  max: number;
  count: number;
  percent: number;
}

@Component({
  selector: 'app-grade-distribution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grade-distribution.component.html',
  styleUrl: './grade-distribution.component.scss'
})
export class GradeDistributionComponent {
  @Input() records: GradeRecord[] | null = [];

  get buckets(): DistributionBucket[] {
    const scores = (this.records ?? [])
      .map(record => record.score)
      .filter((score): score is number => score !== null && score !== undefined);
    const total = scores.length || 1;

    return [
      {label: '0-5', min: 0, max: 5, count: 0, percent: 0},
      {label: '5-10', min: 5, max: 10, count: 0, percent: 0},
      {label: '10-14', min: 10, max: 14, count: 0, percent: 0},
      {label: '14-17', min: 14, max: 17, count: 0, percent: 0},
      {label: '17-20', min: 17, max: 20.01, count: 0, percent: 0}
    ].map(bucket => {
      const count = scores.filter(score => score >= bucket.min && score < bucket.max).length;
      return {...bucket, count, percent: Math.round((count / total) * 100)};
    });
  }
}
