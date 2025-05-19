import { Component, OnInit, inject } from "@angular/core";
import {
  NonNullableFormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors,
  AbstractControl,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, takeUntil, throwError } from "rxjs";
import { GlobalUnsubscribe } from "../class/global-unsubscribe.class";
@Component({
  selector: "app-change-password",
  standalone: false,

  templateUrl: "./change-password.component.html",
  styleUrl: "./change-password.component.css",
})
export class ChangePasswordComponent
  extends GlobalUnsubscribe
  implements OnInit
{
  router = inject(Router);
  route = inject(ActivatedRoute);

  email: string = "manager@domain.tld";

  showNewPassword = false;
  showConfirmPassword = false;
  passwordSubmitted: any;
  token: any;
  message: any;
  fb = inject(NonNullableFormBuilder);

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const formGroup = control as FormGroup;
    const newPassword = formGroup.get("newPassword")?.value;
    const confirmPassword = formGroup.get("confirmPassword")?.value;

    if (newPassword !== confirmPassword) {
      const errors = formGroup.get("confirmPassword")?.errors || {};
      if (!errors["mismatch"]) {
        formGroup
          .get("confirmPassword")
          ?.setErrors({ ...errors, mismatch: true });
      }
    } else {
      const errors = formGroup.get("confirmPassword")?.errors || {};
      if (errors["mismatch"]) {
        delete errors["mismatch"];
        formGroup
          .get("confirmPassword")
          ?.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }

    return null;
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get("token");
    this.control
      .tokenData(this.token!)
      .pipe(
        catchError((err) => {
          return throwError(() => {
            return err;
          });
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res) => {
        if (res.code) {
          this.email = res.result.email;
        } else {
          this.passwordSubmitted = "error";
          this.message = res.message;
          this.control.openNotification(res.message, "error");
        }
      });
  }

  validateForm: FormGroup<{
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> = this.fb.group(
    {
      newPassword: ["", [Validators.required]],
      confirmPassword: ["", [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  async changePassword(): Promise<void> {
    if (this.validateForm.valid) {
      this.control
        .confirmPassword({
          token: this.token,
          password: this.validateForm.value.confirmPassword,
        })
        .pipe(
          catchError((err) => {
            return throwError(() => {
              return err;
            });
          }),
          takeUntil(this.unsubscribe$)
        )
        .subscribe((res) => {
          if (res.code) {
            this.passwordSubmitted = "success";
            this.control.openNotification("Password Changed Successfully");
            this.validateForm.reset();
          } else {
            this.passwordSubmitted = "error";
            this.message = res.message;
            this.control.openNotification(res.message, "error");
          }
        });

      this.validateForm.reset();
    } else {
      this.validateForm.markAllAsTouched();
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  errorMessageForConfirmPassword() {
    return this.validateForm.get("confirmPassword")?.errors?.["required"]
      ? "Confirm Password is required"
      : this.validateForm.get("confirmPassword")?.errors?.["mismatch"]
      ? "Passwords do not match"
      : "";
  }
  goToLogin() {
    if (this.control.loggedIn) {
      this.control.logout();
    }
    this.router.navigateByUrl("/login");
  }
}
