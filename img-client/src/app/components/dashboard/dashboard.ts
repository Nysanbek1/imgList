import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AllUserIngDto, ImgService } from '../../servis/imgs.servis';
import { ImageCard } from '../image-card/image-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ImageCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  imgForm!: FormGroup;
  selectedFile: File | null = null;
  updateImgForm!: FormGroup;
  updateFile: File | null = null;
  updateImagePreview: string | null = null;
  imagePreview: string | null = null;
  allImg: AllUserIngDto[] = []
  selectedCard: AllUserIngDto | null = null
  isUpdate: boolean = false
  action = false
  listId: string[] = []
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileUpdateInput') fileUpdateInput!: ElementRef<HTMLInputElement>;
  constructor(private fb: FormBuilder, private imgService: ImgService, private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.imgForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
    this.updateImgForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['']
    });
    this.loadImages()
  }
  loadImages(): void {
    this.imgService.getAllUserIng().subscribe({
      next: (response) => {
        const timestamp = new Date().getTime();
        this.allImg = response.map(img => ({
        ...img,
        imagePath: img.imagePath.includes('?') 
          ? `${img.imagePath}&cb=${timestamp}` 
          : `${img.imagePath}?cb=${timestamp}`
      }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Ошибка загрузки галереи:', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (this.imagePreview) URL.revokeObjectURL(this.imagePreview); // очистка памяти
      this.selectedFile = input.files[0];
      this.imagePreview = URL.createObjectURL(this.selectedFile);
    }
  }
  onFileUpdate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (this.updateImagePreview) URL.revokeObjectURL(this.updateImagePreview); // очистка памяти
      
      this.updateFile = input.files[0]; 
      this.updateImagePreview = URL.createObjectURL(this.updateFile);
      this.cdr.detectChanges();
    }
  }

  onUpload(): void {
    if (this.imgForm.invalid || !this.selectedFile) return;
    const formData = new FormData();
    const fileExtension = this.selectedFile.name.split('.').pop()
    formData.append('name', this.imgForm.get('name')?.value);
    formData.append('description', this.imgForm.get('description')?.value);
    formData.append('file', this.selectedFile, `${this.imgForm.get('name')?.value}.${fileExtension}`);
    this.imgService.createImg(formData).subscribe({
      next: (response) => {
        this.imgForm.reset();
        this.selectedFile = null;
        this.imagePreview = null;
        this.loadImages()
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      },
      error: (err) => {
        console.error('Ошибка бэкенда:', err);
      }
    });
  }

  openUpdateStart(): void {
    this.isUpdate = true;
    this.updateImgForm.patchValue({
      name: this.selectedCard?.name,
      description: this.selectedCard?.description
    });
    this.updateImagePreview = null;
    this.cdr.detectChanges();
  }

  saveUpdate() {
    if (!this.isUpdate) {
      return
    }
    const id = this.selectedCard?._id
    const formData = new FormData();
    formData.append('name', this.updateImgForm.get('name')?.value);
    formData.append('description', this.updateImgForm.get('description')?.value);
    if(id) {
      formData.append('_id', id);
    } 
    if (this.updateFile) {
      const fileExtension = this.updateFile.name.split('.').pop();
      formData.append('file', this.updateFile, `${this.updateImgForm.get('name')?.value}.${fileExtension}`);
    }
    this.imgService.updateImg(formData).subscribe({
      next: (response) => {
        this.isUpdate = false
        this.selectedCard = null;
        this.updateFile = null;
        this.updateImagePreview = null;
        this.loadImages()
      },
      error: (err) => {
        console.error('Ошибка бэкенда:', err);
      }
    })
  }

  dellImg() {
    const id = this.selectedCard?._id
    if (id) {
      this.imgService.dellImg(id).subscribe({
        next: (response) => {
          this.selectedCard = null;
          this.loadImages()
          
        },
        error: (err) => {
          console.error('Ошибка бэкенда:', err);
        }
      })
    }
  }

  dellImegsAll() {
    this.imgService.dellImegsAll(this.listId).subscribe({
      next: () => {
        this.listId =[]
        this.action = false
        this.loadImages()

      }
    })
  }

  openModal(card: AllUserIngDto): void {
    this.selectedCard = card;
    this.isUpdate = false; 
    this.updateImagePreview = null;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.selectedCard = null;
    this.isUpdate = false;
    this.updateImagePreview = null;
    this.cdr.detectChanges();
  }

  selectAction(id: string): void {
    this.listId = [...this.listId, id]; 
    if (this.listId.length > 0) {
      this.action = true;
    }
    this.cdr.detectChanges();
  }

  dellSelectAction(id: string): void {
    this.listId = this.listId.filter(filt => filt !== id);
    if (this.listId.length <= 0) {
      this.action = false;
    }
    this.cdr.detectChanges();
  }
  
}