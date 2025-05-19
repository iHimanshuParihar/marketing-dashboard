import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd/message";
import { lastValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { environment } from "@/environments/environment";
interface ResApi {
  code: boolean;
  result: any;
  message: string;
}

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor() {}
  spinnerSig = signal<boolean>(false);
  router = inject(Router);
  notification = inject(NzMessageService);
  private baseUrl = environment.baseURL;
  http = inject(HttpClient);
  userDataSig = signal<any | null>(null);
  isSidebarCollapsed = signal<boolean>(false);

  capitalize = (s: string) =>
    s
      .toLowerCase()
      .split(" ")
      .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
      .join(" ");

  openNotification(message: string, type = "success"): void {
    this.notification.create(type, this.capitalize(message));
  }
  openNotificationNoMod(message: string, type = "success"): void {
    this.notification.create(type, message);
  }

  async profile() {
    const data = await lastValueFrom(
      this.http.get<ResApi>(`${this.baseUrl}/user/profile`)
    );

    const user = data.result;
    if (user && user.isActive) {
      this.userDataSig.set(user);
      return user;
    } else {
      this.logout();
    }
  }

  login(payload: object) {
    return this.http.post<ResApi>(`${this.baseUrl}/user/login`, payload);
  }

  createUser(payload: any) {
    return this.http.post<ResApi>(`${this.baseUrl}/user/create-user`, payload);
  }

  tokenData(token: string) {
    return this.http.get<ResApi>(`${this.baseUrl}/user/token-data`, {
      params: {
        token,
      },
    });
  }

  deleteUser(userId: string, isActive: boolean) {
    const params = { isActive };
    return this.http.post<ResApi>(
      `${this.baseUrl}/user/delete/${userId}`,
      null,
      { params }
    );
  }

  changePassword(payload: any) {
    return this.http.post<ResApi>(
      `${this.baseUrl}/user/change-password`,
      payload
    );
  }
  confirmPassword(payload: any) {
    return this.http.post<ResApi>(
      `${this.baseUrl}/user/confirm-password`,
      payload
    );
  }

  updateCredit(payload: any) {
    return this.http.post<ResApi>(`${this.baseUrl}/user/credit`, payload);
  }

  updateCharts(payload: any) {
    return this.http.post<ResApi>(`${this.baseUrl}/user/charts`, payload);
  }

  getUsers(params: any) {
    return this.http.get<ResApi>(`${this.baseUrl}/user/`, { params: params });
  }

  getStates() {
    const body = {
      country: "India",
    };
    return this.http.post<any>(
      `https://countriesnow.space/api/v0.1/countries/states`,
      body
    );
  }

  updateManagerSignal(manager: any) {
    this.userDataSig.set(manager);
  }

  createCampaign(body: any) {
    return this.http.post<ResApi>(`${this.baseUrl}/campaign/create`, body);
  }

  deleteCampaign(id: string) {
    return this.http.post<ResApi>(`${this.baseUrl}/campaign/delete/${id}`, {});
  }

  getAllCampaigns(params: any) {
    return this.http.get<ResApi>(`${this.baseUrl}/campaign/`, {
      params: params,
    });
  }

  public get loggedIn(): boolean {
    return localStorage.getItem("marketing-token") !== null;
  }

  public get userRole() {
    return localStorage.getItem("user-role");
  }

  logout() {
    localStorage.removeItem("marketing-token");
    this.router.navigate(["/login"]);
  }

  private apiUrl = "https://api.openai.com/v1/chat/completions";
  private apiKey = environment.KEY;

  generateContent(
    prompt: string,
    tone: any,
    isEmoji: boolean,
    type: string = ""
  ) {
    let message = "";
    if (type === "SMS") {
      if (isEmoji) {
        message = `Generate a marketing message strictly within 160 characters based on the following tone(s): ${tone}. Here is the prompt: ${prompt}. Include relevant emojis. Do not add anything other than the response text.`;
      } else {
        message = `Generate a marketing message strictly within 160 characters based on the following tone(s): ${tone}. Here is the prompt: ${prompt}. Do not add anything other than the response text.`;
      }
    } else {
      if (isEmoji) {
        message = `Generate a marketing message strictly within 1024 characters based on the following tone(s): ${tone}. Here is the prompt: ${prompt} and also add related emojis. Make it 300 tokens max and minimum 150. Include line breaks and spaces. Do not add anything other than the response text.`;
      } else {
        message = `Generate a marketing message strictly within 1024 characters based on the following tone(s): ${tone}. Here is the prompt: ${prompt}. Make it 300 tokens max and minimum 150. Include line breaks and spaces. Do not add anything other than the response text.`;
      }
    }
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        { role: "developer", content: "You are a helpful assistant." },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    };

    return this.http.post<any>(`${this.apiUrl}`, requestBody, { headers });
  }
}
