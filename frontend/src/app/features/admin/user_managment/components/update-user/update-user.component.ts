import {Component, Input} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {Role} from '../../model/role.model';

@Component({
  selector: 'app-update-user',
    imports: [
        ReactiveFormsModule
    ],
  templateUrl: './update-user.component.html',
  styleUrl: './update-user.component.scss',
})
export class UpdateUserComponent {


}
