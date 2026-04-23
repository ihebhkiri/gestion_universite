import { Component, Input } from '@angular/core';
import { DepartmentStat, EnrollmentChartPoint } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-enrollment-chart',
  standalone: true,
  templateUrl: './enrollment-chart.component.html',
  styleUrl: './enrollment-chart.component.scss',
})
export class EnrollmentChartComponent {
  @Input({ required: true }) points: EnrollmentChartPoint[] = [];
  @Input({ required: true }) departments: DepartmentStat[] = [];

  get maxValue(): number {
    if (this.points.length === 0) {
      return 1;
    }

    return Math.max(...this.points.map((point) => point.value), 1);
  }

  get topDepartments(): DepartmentStat[] {
    return [...this.departments]
      .sort((left, right) => right.teachers - left.teachers || right.programs - left.programs)
      .slice(0, 4);
  }

  getDepartmentWidth(item: DepartmentStat): number {
    const maxTeachers = Math.max(...this.departments.map((department) => department.teachers), 1);
    return (item.teachers / maxTeachers) * 100;
  }
}
