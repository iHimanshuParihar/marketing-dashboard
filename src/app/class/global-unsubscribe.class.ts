import { ApiService } from "@/app/services/api.service";
import { Injectable, OnDestroy, Renderer2, inject } from "@angular/core";

import { Subject } from "rxjs";

@Injectable()
export abstract class GlobalUnsubscribe implements OnDestroy {
  protected unsubscribe$ = new Subject<void>();

  protected control = inject(ApiService);

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
