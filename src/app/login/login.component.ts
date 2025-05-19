import { Component, inject } from "@angular/core";
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";
import { GlobalUnsubscribe } from "../class/global-unsubscribe.class";
import { Router } from "@angular/router";
import { catchError, takeUntil, throwError } from "rxjs";

@Component({
  selector: "app-login",
  standalone: false,
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent extends GlobalUnsubscribe {
  loginForm!: FormGroup;

  fb = inject(FormBuilder);
  router = inject(Router);

  ngOnInit() {
    this.loginForm = this.fb.group({
      password: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
    });
  }
  async onLogin(): Promise<void> {
    const data = {
      email: this.loginForm.value.email.toLowerCase(),
      password: this.loginForm.value.password,
    };
    if (this.loginForm.valid) {
      try {
        this.control
          .login(data)
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
              localStorage.setItem("marketing-token", res.result.token);
              localStorage.setItem("marketing-userId", res.result.user.userId);

              if (res.result.user.role === "SUPER_ADMIN") {
                localStorage.setItem("user-role", "SUPER_ADMIN");
                this.router.navigateByUrl("/auth/s-dashboard");
              } else {
                localStorage.setItem("user-role", "USER");
                this.router.navigateByUrl("/auth/home");
              }
              this.control.openNotification("Login Successfully");

              this.loginForm.reset({
                email: "",
                password: "",
              });
            } else {
              this.control.openNotification(res.message, "error");
            }
          });
        this.router.navigateByUrl("/auth/s-dashboard");

        this.control.openNotification("Login Success");
      } catch (error) {
        console.log(error);
      }
    } else {
      this.control.openNotification("Login Failed", "error");
    }
  }
}
