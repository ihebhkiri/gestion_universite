import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ResultFiltersValue} from '../result-ui.types';

@Component({
  selector: 'app-result-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './result-filters.component.html',
  styleUrl: './result-filters.component.scss'
})
export class ResultFiltersComponent implements OnChanges {
  @Input() filters: ResultFiltersValue | null = null;
  @Output() filtersChanged = new EventEmitter<ResultFiltersValue>();

  value: ResultFiltersValue = {
    search: '',
    status: 'ALL',
    mention: 'ALL',
    minScore: null,
    maxScore: null
  };

  readonly statuses = [
    {value: 'ALL', label: 'Tous statuts'},
    {value: 'PASSED', label: 'Admis'},
    {value: 'FAILED', label: 'Echec'},
    {value: 'ABSENT', label: 'Absent'},
    {value: 'PENDING', label: 'En attente'}
  ];

  readonly mentions = [
    {value: 'ALL', label: 'Toutes mentions'},
    {value: 'EXCELLENT', label: 'Excellent'},
    {value: 'BIEN', label: 'Bien'},
    {value: 'ASSEZ_BIEN', label: 'Assez bien'},
    {value: 'PASSABLE', label: 'Passable'}
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && this.filters) {
      this.value = {...this.value, ...this.filters};
    }
  }

  emit(): void {
    this.filtersChanged.emit({...this.value});
  }

  reset(): void {
    this.value = {
      search: '',
      status: 'ALL',
      mention: 'ALL',
      minScore: null,
      maxScore: null
    };
    this.emit();
  }
}
