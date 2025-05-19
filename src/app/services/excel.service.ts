import { Injectable } from "@angular/core";
import * as XLSX from "xlsx";

@Injectable({
  providedIn: "root",
})
export class ExcelService {
  // Define required columns for each chart type
  private chartRequirements: any = {
    1: {
      required: ["label", "performance"],
      expectedLabels: ["SMS", "WhatsApp", "RCS"], // Strict labels
      strict: true,
    },
    2: {
      required: ["label", "engagement"],
      expectedLabels: ["Cohort 1", "Cohort 2", "Cohort 3"],
      minData: 3, // At least 3 data points
    },
    3: {
      required: ["month", "ctr"],
      expectedLabels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      strict: true, // Strictly 12 months
    },
    4: {
      required: ["status", "percentage"],
      expectedLabels: ["Opened", "Not Opened"], // Strictly 2 statuses
      strict: true,
    },
    5: {
      required: ["week", "newUsers"],
      expectedLabels: [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
        "Week 6",
        "Week 7",
      ],
      strict: true, // Strictly 7 weeks
    },
    6: {
      required: ["status", "percentage"],
      expectedLabels: ["Sent", "Failed"], // Strictly 3 statuses
      strict: true,
    },
  };

  validateExcelForChart(
    file: File,
    chartNumber: number
  ): Promise<{ isValid: boolean; data?: any[]; error?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.chartRequirements[chartNumber]) {
        resolve({ isValid: false, error: "Invalid chart number" });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: "binary" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Validate the data
          const validationResult = this.validateData(jsonData, chartNumber);
          resolve(validationResult);
        } catch (error) {
          resolve({ isValid: false, error: "Error processing Excel file" });
        }
      };

      reader.onerror = () => {
        resolve({ isValid: false, error: "Error reading file" });
      };

      reader.readAsBinaryString(file);
    });
  }

  private validateData(
    data: any[],
    chartNumber: number
  ): { isValid: boolean; data?: any[]; error?: string } {
    const requirements = this.chartRequirements[chartNumber];

    // Check if data is empty
    if (!data || data.length === 0) {
      return { isValid: false, error: "No data found in Excel file" };
    }

    // Check if all required columns exist
    const columns = Object.keys(data[0]);
    const missingColumns = requirements.required.filter(
      (col: any) =>
        !columns.some(
          (existingCol) => existingCol.toLowerCase() === col.toLowerCase()
        )
    );

    if (missingColumns.length > 0) {
      return {
        isValid: false,
        error: `Missing required columns: ${missingColumns.join(", ")}`,
      };
    }

    // Validate data according to chart type
    switch (chartNumber) {
      case 1:
        if (
          !this.validateBarChartData(data, requirements.expectedLabels, true)
        ) {
          return {
            isValid: false,
            error:
              "Invalid data for chart 1. Labels must be strictly 'SMS', 'WhatsApp', and 'RCS'.",
          };
        }
        break;

      case 2:
        if (data.length < requirements.minData) {
          return {
            isValid: false,
            error: "Chart 2 requires at least 3 data points.",
          };
        }
        if (
          !this.validateBarChartData(
            data,
            requirements.expectedLabels,
            false,
            requirements.minData
          )
        ) {
          return {
            isValid: false,
            error: "Invalid data format for chart 2. Check labels and values.",
          };
        }
        break;

      case 3:
        if (!this.validateStrictLabels(data, requirements.expectedLabels)) {
          return {
            isValid: false,
            error: "Chart 3 must strictly contain data for 12 months.",
          };
        }
        if (!this.validateLineChartData(data)) {
          return {
            isValid: false,
            error:
              "Invalid data format for chart 3. Ensure all values are numeric.",
          };
        }
        break;

      case 4:
        if (!this.validateStrictLabels(data, requirements.expectedLabels)) {
          return {
            isValid: false,
            error:
              "Chart 4 must strictly contain 'Opened' and 'Not Opened' statuses.",
          };
        }
        if (!this.validatePieChartData(data)) {
          return {
            isValid: false,
            error: "Invalid data format for chart 4. Check percentages.",
          };
        }
        break;

      case 5:
        if (!this.validateStrictLabels(data, requirements.expectedLabels)) {
          return {
            isValid: false,
            error: "Chart 5 must strictly contain data for 7 weeks.",
          };
        }
        if (!this.validateLineChartData(data)) {
          return {
            isValid: false,
            error:
              "Invalid data format for chart 5. Ensure all values are numeric.",
          };
        }
        break;

      case 6:
        if (!this.validateStrictLabels(data, requirements.expectedLabels)) {
          return {
            isValid: false,
            error: "Chart 6 must strictly contain 'Sent', 'Failed',  statuses.",
          };
        }
        if (!this.validatePieChartData(data)) {
          return {
            isValid: false,
            error: "Invalid data format for chart 6. Check percentages.",
          };
        }
        break;

      default:
        return { isValid: false, error: "Invalid chart type." };
    }

    // Transform data to match chart format
    const transformedData = this.transformData(data, chartNumber);
    return { isValid: true, data: transformedData };
  }

  private validateBarChartData(
    data: any[],
    expectedLabels: string[],
    strict = false,
    minData = 0
  ): boolean {
    const labels = data.map(
      (item) => item.label || item.Label || item.labels || item.Labels
    );
    let validLabels;
    if (minData) {
      validLabels = minData <= labels.length;
    } else {
      validLabels = strict
        ? labels.every((label) => expectedLabels.includes(label)) &&
          labels.length === expectedLabels.length
        : labels.every((label) => expectedLabels.includes(label));
    }

    const validValues = data.every(
      (item) =>
        typeof (
          item.performance ||
          item.engagement ||
          item.Performance ||
          item.Engagement
        ) === "number"
    );
    return validLabels && validValues;
  }

  private validateLineChartData(data: any[]): boolean {
    return data.every((item) => {
      const value = item.ctr || item.newUsers;
      return typeof value === "number" && !isNaN(value);
    });
  }

  private validatePieChartData(data: any[]): boolean {
    const percentages = data.map((item) => item.percentage || item.Percentage);
    return (
      percentages.every((p) => typeof p === "number") &&
      Math.abs(percentages.reduce((a, b) => a + b, 0) - 100) < 0.1
    );
  }

  private validateStrictLabels(data: any[], expectedLabels: string[]): boolean {
    const labels = data.map(
      (item) =>
        item.label ||
        item.Label ||
        item.status ||
        item.Status ||
        item.week ||
        item.Week ||
        item.month ||
        item.Month ||
        item.months ||
        item.Months
    );
    return (
      labels.every((label) => expectedLabels.includes(label)) &&
      labels.length === expectedLabels.length
    );
  }

  private transformData(data: any[], chartNumber: number): any[] {
    switch (chartNumber) {
      case 1:
      case 2:
        return data.map((item) => ({
          label: item.label || item.Label,
          value: item.performance || item.engagement,
        }));

      case 3:
        return data.map((item) => ({
          month: item.month || item.Month,
          value: item.ctr || item.CTR,
        }));

      case 4:
      case 6:
        return data.map((item) => ({
          status: item.status || item.Status,
          percentage: item.percentage || item.Percentage,
        }));

      case 5:
        return data.map((item) => ({
          week: item.week || item.Week,
          users: item.newUsers || item.NewUsers,
        }));

      default:
        return data;
    }
  }
}
