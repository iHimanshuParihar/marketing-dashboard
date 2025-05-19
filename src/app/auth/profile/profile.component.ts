import { GlobalUnsubscribe } from "@/app/class/global-unsubscribe.class";
import { Component } from "@angular/core";
import { catchError, takeUntil, throwError } from "rxjs";

@Component({
  selector: "app-profile",
  standalone: false,
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.css",
})
export class ProfileComponent extends GlobalUnsubscribe {
  businessName = "Uni Trust Bank, Kolkata branch";
  individualName = "Jhon Doe";
  businessDescription =
    "Uni Trust Bank is a trusted financial institution, serving the Kolkata region with a commitment to excellence since 2023. \nWe specialize in personalized banking solutions, catering to individuals, small businesses, and enterprises. \nOur services include savings accounts, loans, investment advice, and cutting-edge digital banking options. \nWith a customer-first approach, Uni Trust Bank aims to empower your financial growth and provide a seamless banking experience. Partner with us to achieve your financial goals.";
  activeSince = "2023";

  async ngOnInit() {
    const user = await this.control.profile();
    this.businessName = user.businessName;
    this.businessDescription = user.businessDescription;
    this.individualName = user.individualName;
    this.activeSince = user.updatedAt;
  }
}
