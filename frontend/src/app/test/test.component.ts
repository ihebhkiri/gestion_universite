import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-test',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class TestComponent implements OnInit {
  authservice = inject(AuthService);
  ngOnInit() {
    this.authservice.getUserInfo().subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

}
