import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ApiService } from "../services/api.service";

export const AuthGuard: CanActivateFn = () => {
  const control = inject(ApiService);
  const router = inject(Router);

  if (!control.loggedIn) {
    router.navigateByUrl("/login");
    return false;
  }
  return true;
};
