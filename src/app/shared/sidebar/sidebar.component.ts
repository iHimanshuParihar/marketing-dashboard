import { ApiService } from "@/app/services/api.service";
import { Component, inject } from "@angular/core";

@Component({
  selector: "app-sidebar",
  standalone: false,

  templateUrl: "./sidebar.component.html",
  styleUrl: "./sidebar.component.css",
})
export class SidebarComponent {
  control = inject(ApiService);
  user: any;
  async ngOnInit() {
    await this.control.profile();
    this.user = await this.control.userDataSig();
  }

  logout() {
    this.control.logout();
  }
}
