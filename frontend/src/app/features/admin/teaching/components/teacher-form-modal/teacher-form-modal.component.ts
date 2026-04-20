import {Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AddTeacherRequest, Department, Teacher, UpdateTeacherRequest} from '../../models/teaching.model';

@Component({
  selector: 'app-teacher-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './teacher-form-modal.component.html',
  styleUrl: './teacher-form-modal.component.scss',
})
export class TeacherFormModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() open = false;
  @Input() departments: Department[] = [];
  @Input() teacherToEdit: Teacher | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() createTeacher = new EventEmitter<AddTeacherRequest>();
  @Output() updateTeacher = new EventEmitter<{ id: number; request: UpdateTeacherRequest }>();

  protected readonly grades = ['Assistant', 'Associate', 'Professor', 'Lecturer'];
  protected readonly genders = ['Male', 'Female'];

  protected form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    cin: ['', Validators.required],
    phone: ['', Validators.required],
    gender: ['Male', Validators.required],
    grade: ['Assistant', Validators.required],
    departmentId: [null as number | null, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teacherToEdit'] || changes['open']) {
      this.patchForm();
    }
  }

  private patchForm() {
    if (!this.open) {
      return;
    }

    if (this.teacherToEdit) {
      this.form.patchValue({
        firstName: this.teacherToEdit.firstName,
        lastName: this.teacherToEdit.lastName,
        cin: this.teacherToEdit.cin,
        phone: this.teacherToEdit.phone,
        gender: this.teacherToEdit.gender,
        grade: this.teacherToEdit.grade,
        departmentId: this.teacherToEdit.department?.id ?? null,
        email: this.teacherToEdit.user?.email ?? '',
        password: '',
      });
      this.form.get('email')?.disable();
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.form.reset({
        firstName: '',
        lastName: '',
        cin: '',
        phone: '',
        gender: 'Male',
        grade: 'Assistant',
        departmentId: this.departments[0]?.id ?? null,
        email: '',
        password: '',
      });
      this.form.get('email')?.enable();
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  protected onClose() {
    this.closeModal.emit();
  }

  protected onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    if (this.teacherToEdit) {
      this.updateTeacher.emit({
        id: this.teacherToEdit.id,
        request: {
          firstName: raw.firstName!,
          lastName: raw.lastName!,
          cin: raw.cin!,
          phone: raw.phone!,
          gender: raw.gender!,
          grade: raw.grade!,
          departmentId: raw.departmentId!,
          specialityId: null,
        }
      });
      return;
    }

    this.createTeacher.emit({
      role: 'TEACHER',
      email: raw.email!,
      password: raw.password!,
      firstName: raw.firstName!,
      lastName: raw.lastName!,
      cin: raw.cin!,
      phone: raw.phone!,
      gender: raw.gender!,
      departmentId: raw.departmentId!,
      grade: raw.grade!,
      specialityId: null,
    });
  }
}
