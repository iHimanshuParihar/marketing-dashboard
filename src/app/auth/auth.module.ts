import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AuthRoutingModule } from "./auth-routing.module";
import { AuthComponent } from "./auth.component";
import { IconsProviderModule } from "../icons-provider.module";
import { NgZorroAntdModule } from "../ng-antd.module";
import { HeaderComponent } from "../shared/header/header.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";

@NgModule({
  declarations: [AuthComponent, SidebarComponent, HeaderComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    NgZorroAntdModule,
    IconsProviderModule,
  ],
})
export class AuthModule {}
