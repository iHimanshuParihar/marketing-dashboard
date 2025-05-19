import { GlobalUnsubscribe } from "@/app/class/global-unsubscribe.class";
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import Chart from "chart.js/auto";

@Component({
  selector: "app-dashboard",
  standalone: false,
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent extends GlobalUnsubscribe {
  dataSet = [
    {
      campaignName: "Savings Account Promo",
      createdDate: "2024-06-18 10:00",
      scheduledSentDate: "2024-08-02 15:30",
      totalSent: 367,
      status: "In Progress",
    },
    {
      campaignName: "Personal Loan Offers",
      createdDate: "2024-03-28 08:45",
      scheduledSentDate: "2024-04-05 14:00",
      totalSent: 500,
      status: "Scheduled",
    },
    {
      campaignName: "Fixed Deposit Benefits",
      createdDate: "2024-07-12 12:30",
      scheduledSentDate: "2024-09-15 16:00",
      totalSent: 200,
      status: "Completed",
    },
    {
      campaignName: "Credit Card Discounts",
      createdDate: "2024-11-08 09:00",
      scheduledSentDate: "2024-12-20 11:00",
      totalSent: 150,
      status: "Failed",
    },
    {
      campaignName: "Home Loan Festival Offers",
      createdDate: "2024-05-12 10:00",
      scheduledSentDate: "2024-06-17 18:00",
      totalSent: 650,
      status: "Scheduled",
    },
    {
      campaignName: "Mutual Funds Awareness",
      createdDate: "2024-02-19 07:30",
      scheduledSentDate: "2024-03-03 20:00",
      totalSent: 800,
      status: "Completed",
    },
    {
      campaignName: "Business Loan Solutions",
      createdDate: "2024-01-28 14:00",
      scheduledSentDate: "2024-02-02 17:45",
      totalSent: 300,
      status: "In Progress",
    },
    {
      campaignName: "Exclusive Wealth Management",
      createdDate: "2024-10-05 08:15",
      scheduledSentDate: "2024-10-15 14:30",
      totalSent: 400,
      status: "Scheduled",
    },
    {
      campaignName: "Loan EMI Reduction Plan",
      createdDate: "2024-11-11 09:45",
      scheduledSentDate: "2024-11-15 16:15",
      totalSent: 120,
      status: "Failed",
    },
    {
      campaignName: "Student Education Loans",
      createdDate: "2024-03-01 13:00",
      scheduledSentDate: "2024-04-10 11:30",
      totalSent: 550,
      status: "In Progress",
    },
    {
      campaignName: "Recurring Deposit Benefits",
      createdDate: "2024-04-10 10:45",
      scheduledSentDate: "2024-05-06 12:00",
      totalSent: 700,
      status: "Completed",
    },
    {
      campaignName: "Exclusive Banking for NRIs",
      createdDate: "2024-08-04 11:30",
      scheduledSentDate: "2024-08-15 10:00",
      totalSent: 430,
      status: "Scheduled",
    },
    {
      campaignName: "Premium Account Offers",
      createdDate: "2024-07-09 08:30",
      scheduledSentDate: "2024-07-18 19:00",
      totalSent: 620,
      status: "In Progress",
    },
    {
      campaignName: "Agriculture Loan Support",
      createdDate: "2024-02-25 15:00",
      scheduledSentDate: "2024-03-02 13:30",
      totalSent: 330,
      status: "Failed",
    },
    {
      campaignName: "Retirement Investment Plans",
      createdDate: "2024-06-01 09:00",
      scheduledSentDate: "2024-06-10 18:00",
      totalSent: 500,
      status: "Completed",
    },
    {
      campaignName: "Zero Balance Account Promo",
      createdDate: "2024-04-03 14:00",
      scheduledSentDate: "2024-12-12 17:00",
      totalSent: 750,
      status: "Scheduled",
    },
    {
      campaignName: "Gold Loan Offers",
      createdDate: "2024-01-17 10:00",
      scheduledSentDate: "2024-01-23 15:30",
      totalSent: 180,
      status: "Failed",
    },
    {
      campaignName: "Corporate Banking Services",
      createdDate: "2024-05-03 07:45",
      scheduledSentDate: "2024-05-10 14:30",
      totalSent: 420,
      status: "In Progress",
    },
    {
      campaignName: "Savings Plus Account Offers",
      createdDate: "2024-08-16 11:15",
      scheduledSentDate: "2024-12-12 13:30",
      totalSent: 550,
      status: "Scheduled",
    },
    {
      campaignName: "Long-term Investment Tips",
      createdDate: "2024-02-12 16:00",
      scheduledSentDate: "2025-01-10 12:45",
      totalSent: 700,
      status: "Scheduled",
    },
  ];

  createdValue = 500;
  sentValue = 367;
  scheduledValue = 10;
  failedValue = 3;
  deletedValue = 1;
  inProgressValue = 35;
  router = inject(Router);

  tabs = [
    {
      name: "Dashboard",
      icon: "mail",
    },
    {
      name: "Campaigns",
      icon: "appstore",
    },
    {
      name: "Calendar",
      icon: "calendar",
    },
    // {
    //   name: "Help",
    //   icon: "question-circle",
    // },
  ];

  currentTab = 0;
  onTabChange(event: any) {
    this.currentTab = event;
    setTimeout(() => {
      if (event === 0) {
        this.sampleCharts();
      }
    }, 100);
  }

  sampleCharts() {
    const userData = this.control.userDataSig();

    // Channel-wise Performance Chart
    new Chart("chart1", {
      type: "bar",
      data: {
        labels: userData.chart1.map((item: any) => item.label),
        datasets: [
          {
            label: "Performance (%)",
            data: userData.chart1.map((item: any) => item.value),
            backgroundColor: [
              "#4caf50",
              "#2196f3",
              "#ff9800",
              "#9c27b0",
              "#3f51b5",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Channel-wise Performance",
          },
        },
      },
    });

    // Cohort-wise Performance Chart
    new Chart("chart2", {
      type: "bar",
      data: {
        labels: userData.chart2.map((item: any) => item.label),
        datasets: [
          {
            label: "Engagement (%)",
            data: userData.chart2.map((item: any) => item.value),
            backgroundColor: [
              "#4caf50",
              "#2196f3",
              "#ff9800",
              "#9c27b0",
              "#3f51b5",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Cohort-wise Performance",
          },
        },
      },
    });

    // Click Through Rate (CTR) Chart
    new Chart("chart3", {
      type: "line",
      data: {
        labels: userData.chart3.map((item: any) => item.month),
        datasets: [
          {
            label: "CTR (%)",
            data: userData.chart3.map((item: any) => item.value),
            borderColor: "#2196f3",
            backgroundColor: "rgba(33, 150, 243, 0.1)",
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Click Through Rate (CTR)",
          },
        },
      },
    });

    // Open Rate Chart
    new Chart("chart4", {
      type: "doughnut",
      data: {
        labels: userData.chart4.map((item: any) => item.status),
        datasets: [
          {
            data: userData.chart4.map((item: any) => item.percentage),
            backgroundColor: ["#4caf50", "#f44336"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Open Rate",
          },
        },
      },
    });

    // Audience Growth Chart
    new Chart("chart5", {
      type: "line",
      data: {
        labels: userData.chart5.map((item: any) => item.week),
        datasets: [
          {
            label: "User Targeted",
            data: userData.chart5.map((item: any) => item.users),
            borderColor: "#4caf50",
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "User Targeted",
          },
        },
      },
    });

    new Chart("chart6", {
      type: "pie",
      data: {
        labels: userData.chart6.map((item: any) => item.status),
        datasets: [
          {
            data: userData.chart6.map((item: any) => item.percentage),
            backgroundColor: ["#4caf50", "#f44336", "#ffeb3b", "#3f51b5"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Messages Sent",
          },
        },
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.sampleCharts();
    }, 100);
  }

  ngOnInit(): void {
    try {
      const userData = this.control.userDataSig();
      if (!userData) {
        console.error("User data is not available");
        return;
      }
    } catch (error) {
      console.error("Error initializing charts:", error);
    }
  }
  getStatusBgColor(status: string): string {
    switch (status) {
      case "Scheduled":
        return "yellow"; // Yellow (bright)
      case "In Progress":
        return "blue"; // Blue (bright)
      case "Completed":
        return "green"; // Green (bright)
      case "Created":
        return "purple"; // Purple (bright)
      case "Failed":
        return "red"; // Red (bright)
      default:
        return "#ffffff"; // default background
    }
  }
  createCampaign() {
    this.router.navigateByUrl("/auth/create-campaign");
  }

  // Generate events from dataSet for only "Scheduled" campaigns
  generateEventsFromDataSet() {
    const events: any = [];

    // Filter only the "Scheduled" campaigns
    this.dataSet
      .filter((campaign) => campaign.status === "Scheduled")
      .forEach((campaign) => {
        // Create event date from scheduledSentDate
        const eventDate = new Date(campaign.scheduledSentDate); // Use scheduledSentDate for the event date

        // Push the event to the list
        events.push({
          date: eventDate,
          type: "warning",
          content: `${campaign.campaignName} - ${campaign.status}: ${campaign.totalSent} messages sent.`,
        });
      });

    return events;
  }

  readonly listDataMap = this.generateEventsFromDataSet();

  // Function to get events for a given date
  getEventsForDate(date: Date) {
    return this.listDataMap.filter(
      (event: any) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  }

  getMonthData(date: Date): number | null {
    if (date.getMonth() === 12) {
      return 1394;
    }
    return null;
  }
}
