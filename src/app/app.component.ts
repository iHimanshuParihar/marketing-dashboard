import { Component, inject, OnInit } from "@angular/core";
import { ApiService } from "./services/api.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  standalone: false,
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  title = "marketing-dashboard";
  control = inject(ApiService);

  async ngOnInit() {
    if (this.control.loggedIn) await this.control.profile();
  }
}
