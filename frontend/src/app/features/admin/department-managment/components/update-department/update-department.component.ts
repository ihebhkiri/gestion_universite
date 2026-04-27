import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {DepartmentResponse, AddDepartmentRequest, UpdateDepartmentRequest} from '../../models/department.model';

@Component({
  selector: 'app-update-department',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-department.component.html',
  styleUrl: './update-department.component.scss'
})
export class UpdateDepartmentComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() department: DepartmentResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UpdateDepartmentRequest>()
  private readonly fb = inject(FormBuilder);
  updatedDepartment!: UpdateDepartmentRequest;

  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required]
  })

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['department'] && this.department) {
      this.form.patchValue({
        code: this.department!.code,
        name: this.department!.name
      })
    }
  }

  test() {
    this.form.valueChanges.subscribe({ next :(value) => console.log("form has changed",value.name)})
  }


  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAsTouched();
      return
    }
    this.updatedDepartment = {id: this.department!.id, data: this.form.getRawValue()};
    this.save.emit(this.updatedDepartment);

  }

  onClose(): void {
    this.close.emit();
  }
}
