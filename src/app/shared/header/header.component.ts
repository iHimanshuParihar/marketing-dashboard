import { GlobalUnsubscribe } from "@/app/class/global-unsubscribe.class";
import { Component, EventEmitter, inject, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { NzModalService } from "ng-zorro-antd/modal";

@Component({
  selector: "app-header",
  standalone: false,

  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css",
})
export class HeaderComponent extends GlobalUnsubscribe {
  @Output() fromChildCollapse = new EventEmitter<boolean>();
  item: boolean = false;
  route = inject(Router);
  modal = inject(NzModalService);
  userInitial: any = "I";
  isNotification: boolean = false;

  ngOnInit(): void {
    const user = localStorage.getItem("marketing-user");
    if (user) {
      this.userInitial = user.charAt(0).toUpperCase();
    }
  }

  openCloseNotification(event: any) {}
  clickMe(): void {
    this.item = !this.item;
    this.fromChildCollapse.emit(this.item);
  }
}
