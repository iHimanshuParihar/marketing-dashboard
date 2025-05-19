import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ApiService } from "../services/api.service";

export const UserGuard: CanActivateFn = () => {
  const control = inject(ApiService);
  const router = inject(Router);

  if (!control.userRole) {
    router.navigateByUrl("/auth/home");
    return false;
  }
  return true;
};
