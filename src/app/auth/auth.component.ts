import { Component, inject } from "@angular/core";
import { ApiService } from "../services/api.service";

@Component({
  selector: "app-auth",
  standalone: false,

  templateUrl: "./auth.component.html",
  styleUrl: "./auth.component.css",
})
export class AuthComponent {
  control = inject(ApiService);

  isCollapsed = false;

  ngOnInit(): void {}

  changeCollapsed(value: any) {
    this.isCollapsed = value;
    this.control.isSidebarCollapsed.set(value);
  }
}
