import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class TokenInterceptorComponent implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const key = environment.apiKey; // Implementa este método para obtener el token

    if (key) {
      const cloned = req.clone({
        setHeaders: {
          'x-api-key': key
        }
      });
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
