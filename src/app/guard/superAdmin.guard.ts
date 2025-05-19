import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { ApiService } from "../services/api.service";

export const SuperAdminGuard: CanActivateFn = () => {
  const control = inject(ApiService);
  const router = inject(Router);
  console.log("here");
  if (control.userRole === "SUPER_ADMIN") {
    router.navigateByUrl("/sdashboard");
    return false;
  }
  return true;
};
