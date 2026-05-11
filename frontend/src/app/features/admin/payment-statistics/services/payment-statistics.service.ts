import {HttpClient, HttpContext} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {PaymentStatisticsResponse} from '../models/payment-statistics.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentStatisticsService {
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getStatistics(): Observable<PaymentStatisticsResponse> {
    return this.http.get<PaymentStatisticsResponse>(`${environment.apiUrl}payments/statistics`, {
      context: this.localLoaderContext
    });
  }
}

