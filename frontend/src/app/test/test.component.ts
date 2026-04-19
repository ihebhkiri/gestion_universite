import {Component, inject} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-test',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TestComponent  {
  fb = inject(FormBuilder);
  table =[1,2,3,4,5];
  getPages(): number[] {
    return Array.from({length:4}, (_, i) => i);
  }
form = this.fb.group({
    status: ['',Validators.required],
  });
  onsubmit(): unknown {
    console.log(this.form.value.status);
    // @ts-ignore
    return this.form.controls   ;
  }

}
