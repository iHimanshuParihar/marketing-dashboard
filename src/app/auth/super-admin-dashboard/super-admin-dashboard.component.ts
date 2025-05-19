import { GlobalUnsubscribe } from "@/app/class/global-unsubscribe.class";
import { Component, inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NzMessageService } from "ng-zorro-antd/message";
import { catchError, delay, takeUntil, throwError } from "rxjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ExcelService } from "@/app/services/excel.service";
@Component({
  selector: "app-super-admin-dashboard",
  standalone: false,

  templateUrl: "./super-admin-dashboard.component.html",
  styleUrl: "./super-admin-dashboard.component.css",
})
export class SuperAdminDashboardComponent extends GlobalUnsubscribe {
  listOfData: any[] = [];
  listOfCampaigns: any[] = [];

  pageSize: any = 10;
  pageIndex: any = 1;
  totalDataCount: any = 0;
  currentTab: any = 0;
  search: string = "";
  pageSizeCampaign: any = 10;
  pageIndexCampaign: any = 1;
  totalDataCountCampaign: any = 0;
  createUserForm!: FormGroup;
  fb = inject(FormBuilder);

  constructor(
    private message: NzMessageService,
    private excelService: ExcelService
  ) {
    super();
  }
  ngOnInit(): void {
    this.createUserForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      businessName: ["", [Validators.required]],
      individualName: ["", [Validators.required]],
      businessDescription: ["", [Validators.required]],
      mobile: [
        "",
        [
          Validators.required,
          Validators.pattern("^[0-9]{10}$"), // Pattern for 10-digit mobile number
        ],
      ],
    });
    this.getAllUsers();
  }
  onPageChange(page: number, type = ""): void {
    if (type === "campaign") {
      this.pageIndexCampaign = page;
    } else {
      this.pageIndex = page;
    }
  }

  async onTabChange(event: any) {
    if (event === 1) {
      await this.getAllCampaigns();
    } else {
      await this.getAllUsers();
    }
    this.currentTab = event;
    this.pageIndex = 1;
    this.pageIndexCampaign = 1;
    this.search = "";
  }

  onDelete(data: any): void {
    console.log("Delete:", data);
  }

  getAllUsers() {
    this.control
      .getUsers({ page: this.pageIndex, limit: 10, search: this.search.trim() })
      .pipe(
        catchError((err) => {
          return throwError(() => {
            return err;
          });
        }),
        delay(500),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res) => {
        if (res.code) {
          this.listOfData = res.result.rows;
          this.totalDataCount = res.result.totalCount;
        } else {
          this.control.openNotification(res.message, "error");
        }
      });
  }

  getAllCampaigns() {
    this.control
      .getAllCampaigns({
        page: this.pageIndexCampaign,
        limit: 10,
        search: this.search.trim(),
      })
      .pipe(
        catchError((err) => {
          return throwError(() => {
            return err;
          });
        }),
        delay(500),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res) => {
        if (res.code) {
          this.listOfCampaigns = res.result.data;
          console.log(this.listOfCampaigns);
          this.totalDataCountCampaign = res.result.totalCount;
        } else {
          this.control.openNotification(res.message, "error");
        }
      });
  }

  getFileURL(data: any) {
    return `http://13.232.19.125:4222${data}`;
  }
  isVisible = false;

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    if (this.createUserForm.valid) {
      this.control
        .createUser(this.createUserForm.value)
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
            this.control.openNotification(res.message);
            this.isVisible = false;
            this.getAllUsers();
          } else {
            this.control.openNotification(res.message, "error");
          }
        });
    } else {
      return this.control.openNotification("Please enter all fields", "error");
    }
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  loading = false;

  deleteManager(userId: string, isActive: boolean) {
    this.loading = true;
    this.control
      .deleteUser(userId, isActive)
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
          if (res.result.isActive) {
            this.control.openNotification("User Account Activated");
          } else {
            this.control.openNotification("User Account Deactivated");
          }
          this.getAllUsers();
        } else {
          this.control.openNotification(res.message, "error");
        }
        this.loading = false;
      });
  }

  generatePasswordToken(email: string) {
    this.control
      .changePassword({ email: email.toLowerCase() })
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
          this.control.openNotification(res.message);
          this.getAllUsers();
        } else {
          this.control.openNotification(res.message, "error");
        }
      });
  }

  copyPasswordLink(token: string) {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const value = `${protocol}//${host}/#/change-password/${token}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          this.control.openNotification("Link copied to clipboard");
        })
        .catch(() => {
          this.control.openNotification("Could not copy text", "error");
        });
    }
  }

  editableValue: any;
  isEditing = false;

  toggleEdit(credit: any) {
    this.isEditing = true;
    this.editableValue = credit || 0;
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveEdit(userId: string) {
    this.control
      .updateCredit({ userId, credit: this.editableValue })
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
          this.control.openNotification(res.message);
          this.listOfData.forEach((element) => {
            if (element.userId === userId) {
              element.credit = this.editableValue;
            }
          });
          this.isEditing = false;
        } else {
          this.control.openNotification(res.message, "error");
        }
      });
  }

  selectedFiles: { [key: number]: File } = {};
  isChartsVisible: boolean = false;
  validatedData: { [key: number]: any[] } = {};
  isLoading: { [key: number]: boolean } = {};
  selectedUserId: any;
  okChartsModel(): void {
    const hasInvalidFiles = Object.keys(this.selectedFiles).some(
      (chartNum: any) => !this.validatedData[chartNum]
    );

    if (hasInvalidFiles) {
      this.message.warning("Please ensure all uploaded files are valid");
      return;
    }

    try {
      console.log("Validated data:", this.validatedData);

      this.message.success("Charts updated successfully");
      this.isChartsVisible = false;
      this.resetForm();
    } catch (error) {
      this.message.error("Error updating charts");
    }
    this.isChartsVisible = false;
  }
  showChartsModal(id: any): void {
    this.isChartsVisible = true;
    this.selectedUserId = id;
    this.resetForm();
  }

  closeChartsModel(): void {
    this.isChartsVisible = false;
    this.selectedUserId = "";
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedFiles = {};
    this.validatedData = {};
    this.isLoading = {};

    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input: Element) => {
      if (input instanceof HTMLInputElement) {
        input.value = "";
      }
    });
  }

  async onFileSelected(event: any, chartNumber: number) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.isLoading[chartNumber] = true;
      this.selectedFiles[chartNumber] = file;

      const result = await this.excelService.validateExcelForChart(
        file,
        chartNumber
      );

      if (result.isValid && result.data) {
        this.validatedData[chartNumber] = result.data;
        this.message.success(`Valid data uploaded for Chart ${chartNumber}`);
        let chartType = "";
        if (chartNumber === 1) chartType = "chart1";
        if (chartNumber === 2) chartType = "chart2";
        if (chartNumber === 3) chartType = "chart3";
        if (chartNumber === 4) chartType = "chart4";
        if (chartNumber === 5) chartType = "chart5";
        if (chartNumber === 6) chartType = "chart6";

        await this.updateChart(
          this.selectedUserId,
          chartType,
          this.validatedData[chartNumber]
        );
      } else {
        delete this.selectedFiles[chartNumber];
        delete this.validatedData[chartNumber];
        event.target.value = "";

        this.message.error(
          result.error || `Invalid data for Chart ${chartNumber}`
        );
      }
    } catch (error) {
      delete this.selectedFiles[chartNumber];
      delete this.validatedData[chartNumber];
      event.target.value = "";
    } finally {
      this.isLoading[chartNumber] = false;
    }
  }

  updateChart(userId: string, type: string, chart: any) {
    this.control
      .updateCharts({ userId, type, chart })
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
          this.control.openNotification(res.message);
        } else {
          this.control.openNotification(res.message, "error");
        }
      });
  }

  downloadSample(chartNumber: number): void {
    const sampleData = this.getSampleData(chartNumber);
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, `chart${chartNumber}_sample.xlsx`);
  }

  private getSampleData(chartNumber: number): any[] {
    switch (chartNumber) {
      case 1:
        return [
          { label: "SMS", performance: 75 },
          { label: "WhatsApp", performance: 60 },
          { label: "RCS", performance: 85 },
        ];
      case 2:
        return [
          { label: "Cohort A", engagement: 65 },
          { label: "Cohort B", engagement: 55 },
          { label: "Cohort C", engagement: 70 },
          { label: "Cohort D", engagement: 60 },
          { label: "Cohort E", engagement: 80 },
        ];
      case 3:
        return [
          { month: "Jan", ctr: 5 },
          { month: "Feb", ctr: 10 },
          { month: "Mar", ctr: 8 },
          { month: "Apr", ctr: 11 },
          { month: "May", ctr: 7 },
          { month: "Jun", ctr: 3 },
          { month: "Jul", ctr: 9 },
          { month: "Aug", ctr: 3 },
          { month: "Sep", ctr: 12 },
          { month: "Oct", ctr: 20 },
          { month: "Nov", ctr: 4 },
          { month: "Dec", ctr: 8 },
        ];
      case 4:
        return [
          { status: "Opened", percentage: 75 },
          { status: "Not Opened", percentage: 25 },
        ];
      case 5:
        return [
          { week: "Week 1", newUsers: 150 },
          { week: "Week 2", newUsers: 200 },
          { week: "Week 3", newUsers: 250 },
          { week: "Week 4", newUsers: 300 },
          { week: "Week 5", newUsers: 350 },
          { week: "Week 6", newUsers: 400 },
          { week: "Week 7", newUsers: 300 },
        ];
      case 6:
        return [
          { status: "Sent", percentage: 80 },
          { status: "Failed", percentage: 20 },
        ];
      default:
        return [];
    }
  }
}
