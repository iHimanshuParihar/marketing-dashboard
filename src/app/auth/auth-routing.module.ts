import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IconsProviderModule } from "../icons-provider.module";
import { NgZorroAntdModule } from "../ng-antd.module";
import { AuthComponent } from "./auth.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzGridModule } from "ng-zorro-antd/grid";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ProfileComponent } from "./profile/profile.component";
import { CreateCampaignComponent } from "./create-campaign/create-campaign.component";
import { SuperAdminDashboardComponent } from "./super-admin-dashboard/super-admin-dashboard.component";
import { SuperAdminGuard } from "../guard/superAdmin.guard";
import { UserGuard } from "../guard/user.gaurd";

const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "",
    component: AuthComponent,
    children: [
      {
        path: "home",
        title: "Dashboard",
        component: DashboardComponent,
      },

      {
        path: "profile",
        title: "Profile",
        component: ProfileComponent,
      },

      {
        path: "create-campaign",
        title: "Create Campaign",
        component: CreateCampaignComponent,
      },
      {
        path: "s-dashboard",
        title: "S-Dashboard",
        component: SuperAdminDashboardComponent,
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    NgZorroAntdModule,
    IconsProviderModule,
    ReactiveFormsModule,
    NgxChartsModule,
    FormsModule,
    NzModalModule,
    NzTableModule,
    NzGridModule,
  ],
  exports: [RouterModule],
  declarations: [
    DashboardComponent,
    ProfileComponent,
    CreateCampaignComponent,
    SuperAdminDashboardComponent,
  ],
})
export class AuthRoutingModule {}
