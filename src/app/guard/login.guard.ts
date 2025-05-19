import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ApiService } from "../services/api.service";

export const LoginGuard: CanActivateFn = () => {
  const control = inject(ApiService);
  const router = inject(Router);

  if (control.loggedIn) {
    router.navigateByUrl("/auth");
    return false;
  }
  return true;
};
