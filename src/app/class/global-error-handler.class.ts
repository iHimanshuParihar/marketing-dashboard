import { ApiService } from "@/app/services/api.service";
import { ErrorHandler, Injectable, NgZone, inject } from "@angular/core";

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  // Dependency Injection Starts

  private control = inject(ApiService);
  private zone = inject(NgZone);

  // Dependency Injection Ends

  handleError(error: any) {
    this.zone.run(() => {
      this.control.openNotificationNoMod(
        error?.message || "Error was detected! We are already working on it!",
        "error"
      );

      // Device offline: Check your internet connection.
      // eslint-disable-next-line no-console
      console.warn(error);
    });
  }
}
