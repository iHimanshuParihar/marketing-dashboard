import {
  HttpErrorResponse,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { ApiService } from "./api.service";
import { catchError, tap } from "rxjs/operators";
import { throwError } from "rxjs/internal/observable/throwError";

@Injectable({
  providedIn: "root",
})
export class TokenInterceptorService {
  control = inject(ApiService);

  private stack: number[] = [];

  private handleError(err: HttpErrorResponse) {
    this.control.spinnerSig.set(false);
    if (err.status === 401 || err.status === 403) {
      this.stack = [];
      this.control.logout();
    }
    return throwError(err);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.control.spinnerSig.set(true);

    this.stack.push(1);

    const openAiApiUrl = "https://api.openai.com";

    if (req.url.startsWith(openAiApiUrl)) {
      return next.handle(req).pipe(
        tap((event: any) => {
          if (event instanceof HttpResponse) {
            this.stack.pop();
            if (!this.stack.length) {
              this.control.spinnerSig.set(false);
            }
          }
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
    }

    //GET TOKEN
    const authToken = localStorage.getItem("marketing-token");

    //SET TOKEN
    const authRequest = req.clone({
      headers: req.headers.set("Authorization", "Bearer " + authToken),
    });

    return next
      .handle(authRequest)
      .pipe(
        tap((event: any) => {
          if (event instanceof HttpResponse) {
            this.stack.pop();

            if (!this.stack.length) {
              this.control.spinnerSig.set(false);
            }
          }
        })
      )
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }
}
