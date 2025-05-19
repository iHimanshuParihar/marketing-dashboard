import { GlobalUnsubscribe } from "@/app/class/global-unsubscribe.class";
import { HttpClient } from "@angular/common/http";
import {
  Component,
  ElementRef,
  inject,
  NgZone,
  ViewChild,
} from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  catchError,
  debounceTime,
  delay,
  lastValueFrom,
  Subject,
  takeUntil,
  throwError,
} from "rxjs";
import * as L from "leaflet";
import { Router } from "@angular/router";
import { population } from "./population";
@Component({
  selector: "app-create-campaign",
  standalone: false,

  templateUrl: "./create-campaign.component.html",
  styleUrl: "./create-campaign.component.css",
})
export class CreateCampaignComponent extends GlobalUnsubscribe {
  campaignForm!: FormGroup;
  currentStep = 0;
  isUploadMethod: boolean = false;
  isCohortMethod: boolean = true;
  uploadedFile: File | null = null;
  mediaFile: File | null = null;
  isMediaFile: boolean = false;
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  router = inject(Router);

  selectedCreativeTypeOptions: any = [];
  ngOnInit(): void {
    this.campaignForm = this.fb.group({
      campaignName: ["", Validators.required],
      campaignGoals: [[], Validators.required],
      cohortOrUpload: [[], Validators.required],
      ageGroup: [[18, 60]],
      gender: [""],
      location: [""],
      content: [""],
      SMScontent: [""],
      creativeType: [["WhatsApp", "SMS", "RCS"], Validators.required],
      toneOptions: ["formal"],
      uploadedFile: [null],
      mediaFile: [null],
      dateAndTime: [""],
    });

    this.campaignForm.get("cohortOrUpload")?.valueChanges.subscribe((value) => {
      this.isUploadMethod = value === "Upload";
      this.isCohortMethod = value === "Cohort";
    });

    this.searchSubject.pipe(debounceTime(500)).subscribe((query) => {
      this.performSearch(query);
    });
  }

  onSubmit(): void {
    if (this.campaignForm.valid) {
      const userId = JSON.stringify(localStorage.getItem("marketing-userId"));
      const formData = new FormData();
      formData.append("campaignName", this.campaignForm.value.campaignName);
      formData.append("campaignGoals", this.campaignForm.value.campaignGoals);
      formData.append("campaignType", this.campaignForm.value.cohortOrUpload);
      formData.append("messageContent", this.campaignForm.value.content);
      formData.append("smsContent", this.campaignForm.value.SMScontent);
      formData.append("creativeType", this.campaignForm.value.creativeType);
      formData.append("dateAndTime", this.campaignForm.value.dateAndTime);
      formData.append("userId", userId);

      if (this.campaignForm.get("cohortOrUpload")?.value === "Upload") {
        if (this.uploadedFile) {
          formData.append("file", this.uploadedFile);
        }
      } else {
        formData.append("ageGroup", this.campaignForm.value.ageGroup);
        formData.append("gender", this.campaignForm.value.gender);
        formData.append("location", this.campaignForm.value.location);
      }

      if (this.mediaFile) {
        formData.append("media", this.mediaFile);
      }

      this.control
        .createCampaign(formData)
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
            this.control.openNotification("Campaign created successfully!");
            this.router.navigateByUrl("/auth/home");
          } else {
            this.control.openNotification(res.message, "error");
          }
        });
    }
  }

  isAutogenerate: boolean = false;
  isEmoji: boolean = false;
  contentText: string = "";
  generateButtonText: string = "Auto Generate";

  zone = inject(NgZone);
  map!: L.Map;
  marker!: L.Marker;
  searchQuery: string = "";
  suggestions: any[] = [];
  change(value: boolean): void {}

  nextStep(): void {
    const formData = this.campaignForm.value;
    console.log(formData);

    switch (this.currentStep) {
      case 0:
        // Check campaignName and campaignGoals for Step 0
        if (formData.campaignName && formData.campaignGoals.length) {
          this.currentStep++;
        } else {
          this.control.openNotification(
            "Please fill out campaign name and goals!",
            "error"
          );
        }
        break;

      case 1:
        if (this.isCohortMethod) {
          this.campaignForm.controls["cohortOrUpload"].setValue("Cohort");
        } else if (this.isUploadMethod) {
          this.campaignForm.controls["cohortOrUpload"].setValue("Upload");
        }

        if (formData.cohortOrUpload) {
          if (this.isUploadMethod) {
            this.currentStep = 3;
          } else {
            this.currentStep++;
          }
        } else {
          this.control.openNotification(
            "Please select a cohort or upload a file!",
            "error"
          );
        }
        break;

      case 2:
        // Check ageGroup and gender if cohortOrUpload === "Cohort"
        if (
          formData.cohortOrUpload === "Cohort" &&
          formData.ageGroup &&
          formData.gender
        ) {
          this.currentStep++;
          setTimeout(() => {
            this.initializeMap();
          }, 100);
        } else if (formData.cohortOrUpload !== "Cohort") {
          this.currentStep++; // Skip validation for ageGroup and gender if not "Cohort"
        } else {
          this.control.openNotification(
            "Please fill out age group and gender!",
            "error"
          );
        }
        break;

      case 3:
        if (this.isCohortMethod) {
          this.campaignForm.controls["location"].setValue(this.searchQuery);
          formData.location = this.searchQuery;
          if (formData.location) {
            this.currentStep++;
          } else {
            this.control.openNotification("Please select a location", "error");
          }
        } else {
          if (
            formData.toneOptions &&
            formData.creativeType &&
            formData.content
          ) {
            this.currentStep++;
          } else {
            this.control.openNotification(
              "Please complete tone options, creative type, and content!",
              "error"
            );
          }
        }
        break;

      case 4:
        if (this.isCohortMethod) {
          if (
            formData.SMScontent &&
            formData.creativeType &&
            formData.content
          ) {
            this.currentStep++;
          } else {
            this.control.openNotification(
              "Please complete SMS content, creative type, and content!",
              "error"
            );
          }
        } else {
          if (formData.dateAndTime) {
            this.currentStep++;
          } else {
            this.control.openNotification(
              "Please select date and time",
              "error"
            );
          }
        }
        break;

      case 5:
        if (this.isCohortMethod) {
          if (formData.dateAndTime) {
            this.currentStep++;
          } else {
            this.control.openNotification(
              "Please select date and time",
              "error"
            );
          }
        } else {
          this.currentStep++;
        }
        break;

      case 6:
        if (this.isCohortMethod) {
          this.currentStep++;
        }
        break;

      default:
        break;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) this.currentStep--;

    if (this.isUploadMethod && this.currentStep == 3) {
      this.currentStep = 1;
    }
    if (this.isCohortMethod && this.currentStep === 3) {
      this.initializeMap();
    }
  }

  async onAutoGenerate(type: string = "") {
    if (!this.contentText) {
      return this.control.openNotification("Prompt can't be empty!", "error");
    }

    const toneOptions = this.campaignForm.get("toneOptions")?.value;

    try {
      // Call the generateContent function and wait for the response
      const response = await lastValueFrom(
        this.control.generateContent(
          this.contentText,
          toneOptions,
          this.isEmoji,
          type
        )
      );
      this.isAutogenerate = false;

      // Use the generated content in your form

      if (type === "SMS") {
        const generatedContent =
          response?.choices?.[0]?.message?.content ||
          "Failed t genereate please try again!";
        this.campaignForm.get("SMScontent")?.setValue(generatedContent);
        console.log("Generated SMS Content:", generatedContent);
      } else {
        const generatedContent =
          response?.choices?.[0]?.message?.content ||
          "Failed t genereate please try again!";
        this.campaignForm.get("content")?.setValue(generatedContent);
        if (this.campaignForm.value.creativeType.includes("SMS")) {
          this.onAutoGenerate("SMS");
        }
        console.log("Generated Content:", generatedContent);
      }
      this.generateButtonText = "Regenerate";
    } catch (error) {
      console.error("Error generating content:", error);
      this.control.openNotification("Failed to generate content!", "error");
    }
  }
  // onTargetingMethodChange(value: any): void {
  //   console.log(value);
  //   this.isUploadMethod = value === "Upload";
  //   this.isCohortMethod = value === "Cohort";
  // }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFile = file;
      this.campaignForm.patchValue({
        uploadedFile: file,
      });
      this.isUploadMethod = true;
      this.isCohortMethod = false;
    }
  }

  onMediaFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.mediaFile = file;
      this.isMediaFile = true;
    }
  }

  removeMedia() {
    this.mediaFile = null;
    this.campaignForm.patchValue({
      mediaFile: null,
    });
    this.isMediaFile = false;
  }

  handleClick() {
    if (this.isCohortMethod && this.currentStep === 6) {
      this.onSubmit();
    } else if (!this.isCohortMethod && this.currentStep === 5) {
      this.onSubmit();
    } else {
      this.nextStep();
    }
  }

  @ViewChild("fileInput") fileInput!: ElementRef;
  openFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onReupload(): void {
    this.uploadedFile = null;
    this.campaignForm.patchValue({
      uploadedFile: null,
    });
    const fileInput = document.getElementById(
      "dropzone-file"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  // Handle file removal
  onRemoveFile(): void {
    this.uploadedFile = null;
    this.campaignForm.patchValue({
      uploadedFile: null,
    });
    const fileInput = document.getElementById(
      "dropzone-file"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    this.isCohortMethod = true;
    this.isUploadMethod = false;
  }

  states: string[] = [];

  async getAllStates() {
    try {
      const response = await lastValueFrom(this.control.getStates());
      if (response?.data?.states) {
        this.states = response.data.states.map((state: any) => state.name);
      } else {
        console.error("No states found in response");
        this.control.openNotification("No states available", "error");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      this.control.openNotification("Failed to generate content!", "error");
    }
  }

  setDateAndTime(customDateTime: any): void {
    const dateTime = customDateTime || new Date().toISOString();
    this.campaignForm.controls["dateAndTime"].setValue(dateTime);
  }

  private regionLayer!: L.LayerGroup;
  private searchSubject = new Subject<string>();
  selectedSuggestion: any;
  initializeMap(): void {
    setTimeout(() => {
      const mapContainer = document.getElementById("map");
      if (!mapContainer) {
        console.error("Map container not found.");
        return;
      }

      this.map = L.map("map", {
        center: [18.52043, 73.856743],
        zoom: 12,
      });

      setTimeout(() => {
        this.map.invalidateSize();
      }, 0);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(this.map);

      const iconDefault = L.icon({
        iconUrl: "assets/marker.png",
        iconSize: [35, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      L.Marker.prototype.options.icon = iconDefault;

      this.marker = L.marker([37.7749, -122.4194]).addTo(this.map);
      this.regionLayer = L.layerGroup().addTo(this.map);
    });

    if (this.selectedSuggestion) {
      setTimeout(() => {
        this.selectSuggestion(this.selectedSuggestion);
      }, 1000);
    }
  }

  onSearchChange(): void {
    if (this.searchQuery.trim() === "") {
      this.suggestions = [];
      this.regionLayer.clearLayers(); // Remove any region borders from the map
      return;
    }
    this.searchSubject.next(this.searchQuery.trim());
  }
  private performSearch(query: string): void {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=IN&addressdetails=1`;
    this.http.get<any[]>(url).subscribe((data) => {
      this.zone.run(() => {
        this.suggestions = data;
      });
    });
  }

  updateCharacterCount(controlName: string) {
    const control = this.campaignForm.get(controlName);
    if (control) {
      control.updateValueAndValidity();
    }
  }

  malesCount: number = 0;
  femalesCount: number = 0;
  totalCount: number = 0;

  selectSuggestion(suggestion: any): void {
    this.selectedSuggestion = suggestion;
    this.suggestions = [];
    this.searchQuery = suggestion?.display_name;

    const cityName = suggestion?.display_name?.split(",")[0]?.trim(); // Extract city name from suggestion.
    const cityData = population.find(
      (city) => city.name_of_city.toLowerCase() === cityName.toLowerCase()
    );

    if (cityData) {
      this.malesCount = cityData.population_male;
      this.femalesCount = cityData.population_female;
      this.totalCount = cityData.population_total;
    } else {
      this.malesCount = Math.floor(Math.random() * (50000 - 35000 + 1)) + 35000;
      this.femalesCount =
        Math.floor(Math.random() * (50000 - 35000 + 1)) + 35000;
      this.totalCount = Math.floor(Math.random() * (80000 - 50000 + 1)) + 50000;
    }

    const boundingBox = suggestion.boundingbox;
    if (boundingBox) {
      this.regionLayer.clearLayers();

      const southWest = L.latLng(boundingBox[0], boundingBox[2]); // [south, west]
      const northEast = L.latLng(boundingBox[1], boundingBox[3]); // [north, east]
      const bounds = L.latLngBounds(southWest, northEast);

      const region = L.rectangle(bounds, {
        color: "#FF5733",
        weight: 2,
        fillOpacity: 0.2,
      });
      this.regionLayer.addLayer(region);

      this.map.fitBounds(bounds);
    } else {
      const lat = parseFloat(suggestion.lat);
      const lon = parseFloat(suggestion.lon);
      this.map.setView([lat, lon], 14);
      this.marker.setLatLng([lat, lon]);
    }
  }

  onCohortSelected() {
    this.isCohortMethod = true;
    this.isUploadMethod = false;
    this.onRemoveFile();
  }
}
