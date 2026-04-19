import {Component, Input} from '@angular/core';
import {UserStats} from '../../model/user.model';

@Component({
  selector: 'app-statistics',
  imports: [],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent  {
  @Input({required:true}) statistics!: UserStats

}
