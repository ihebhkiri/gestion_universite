import {animate, style, transition, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {Component, DestroyRef, OnInit, inject} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ReactiveFormsModule, Validators} from '@angular/forms';
import {NonNullableFormBuilder} from '@angular/forms';
import {RoomRequest, RoomResponse} from '../../models/room.model';
import {RoomFacadeService} from '../../services/room-facade.service';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  animations: [
    trigger('panelIn', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(12px) scale(0.98)'}),
        animate('180ms ease-out', style({opacity: 1, transform: 'translateY(0) scale(1)'}))
      ])
    ])
  ],
  templateUrl: './room-form.component.html',
  styleUrl: './room-form.component.scss'
})
export class RoomFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    capacity: [30, [Validators.required, Validators.min(1)]],
    type: ['CLASSROOM', Validators.required],
    building: ['', Validators.maxLength(120)],
    location: ['', Validators.maxLength(160)]
  });

  constructor(public readonly facade: RoomFacadeService) {}

  ngOnInit(): void {
    this.facade.selectedRoom$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(room => this.patchForm(room));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: RoomRequest = {
      name: value.name.trim(),
      capacity: value.capacity,
      type: value.type,
      building: this.optional(value.building),
      location: this.optional(value.location)
    };

    this.facade.saveRoom(request);
  }

  private patchForm(room: RoomResponse | null): void {
    this.form.reset({
      name: room?.name ?? '',
      capacity: room?.capacity ?? 30,
      type: room?.type ?? 'CLASSROOM',
      building: room?.building ?? '',
      location: room?.location ?? ''
    });
  }

  private optional(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
