import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AllUserIngDto, ImgService } from '../../servis/imgs.servis';
import { ImageCard } from '../image-card/image-card';
import { Header } from '../header/header';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ImageCard, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  imgForm!: FormGroup;
  updateImgForm!: FormGroup;

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  updateFiles: File[] = [];
  updateImagePreviews: string[] = [];

  allImg: AllUserIngDto[] = [];
  selectedCard: AllUserIngDto | null = null;
  isUpdate: boolean = false;
  action = false;
  listId: string[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileUpdateInput') fileUpdateInput!: ElementRef<HTMLInputElement>;

  constructor(private fb: FormBuilder, private imgService: ImgService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.imgForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      forAllPeople: [false]
    });
    this.updateImgForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      forAllPeople: [false]
    });
    this.loadImages();
  }

  loadImages(): void {
    this.imgService.getAllUserIng().subscribe({
      next: (response) => {
        const timestamp = new Date().getTime();

        // Добавляем кэш-бастер к каждому пути внутри массива, чтобы избежать кэширования картинок браузером
        this.allImg = response.map(img => ({
          ...img,
          imagePath: img.imagePath.map(p => p.includes('?') ? `${p}&cb=${timestamp}` : `${p}?cb=${timestamp}`)
        }));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Ошибка загрузки галереи:', err)
    });
  }

  // Чтение нескольких файлов при создании публикации
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clearImagePreviews();

      this.selectedFiles = Array.from(input.files);
      this.imagePreviews = this.selectedFiles.map(file => URL.createObjectURL(file));
      this.cdr.detectChanges();
    }
  }

  // Чтение нескольких файлов при обновлении поста
  onFileUpdate(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.clearUpdatePreviews();

      this.updateFiles = Array.from(input.files);
      this.updateImagePreviews = this.updateFiles.map(file => URL.createObjectURL(file));
      this.cdr.detectChanges();
    }
  }

  // Отправка формы создания
  onUpload(): void {
    if (this.imgForm.invalid || this.selectedFiles.length === 0) {
      return;
    }

    const formData = new FormData();
    formData.append('name', this.imgForm.get('name')?.value);
    formData.append('description', this.imgForm.get('description')?.value);
    formData.append('forAllPeople', String(this.imgForm.get('forAllPeople')?.value));
    const baseName = this.imgForm.get('name')?.value || 'image';
    this.selectedFiles.forEach((file: File, index: number) => {
      const extension = file.name.split('.').pop() || 'jpg';
      const newFileName = `${baseName}_${index}.${extension}`;
      formData.append('file', file, newFileName);
    });

    this.imgService.createImg(formData).subscribe({
      next: (response) => {
        console.log('Успешно загружено:', response);
        this.resetUploadForm();
        this.loadImages();
      },
      error: (err) => {
        console.error('Ошибка бэкенда при загрузке:', err);
      }
    });
  }

  openUpdateStart(): void {
    this.isUpdate = true;
    this.updateImgForm.patchValue({
      name: this.selectedCard?.name,
      description: this.selectedCard?.description,
      forAllPeople: this.selectedCard?.forAllPeople
    });
    this.clearUpdatePreviews();
    this.updateFiles = [];
    this.cdr.detectChanges();
  }

  saveUpdate(): void {
    if (!this.isUpdate) return;

    const id = this.selectedCard?._id;
    const formData = new FormData();
    formData.append('name', this.updateImgForm.get('name')?.value);
    formData.append('description', this.updateImgForm.get('description')?.value);
    formData.append('forAllPeople', String(this.updateImgForm.get('forAllPeople')?.value));

    if (id) {
      formData.append('_id', id);
    }

    // ИСПРАВЛЕНО: Ключ отправки файлов ('image') сделан таким же, как и в onUpload,
    // чтобы бэкенд-интерцептор отработал штатно.
    if (this.updateFiles.length > 0) {
      this.updateFiles.forEach((file, index) => {
        const fileExtension = file.name.split('.').pop();
        const customName = `${this.updateImgForm.get('name')?.value}_${index}.${fileExtension}`;
        formData.append('image', file, customName);
      });
    }

    this.imgService.updateImg(formData).subscribe({
      next: () => {
        this.isUpdate = false;
        this.selectedCard = null;
        this.clearUpdatePreviews();
        this.updateFiles = [];
        this.loadImages();
      },
      error: (err) => {
        console.error('Ошибка бэкенда при обновлении:', err);
      }
    });
  }

  dellImg(): void {
    const id = this.selectedCard?._id;
    if (id) {
      this.imgService.dellImg(id).subscribe({
        next: () => {
          this.selectedCard = null;
          this.loadImages();
        },
        error: (err) => console.error('Ошибка бэкенда:', err)
      });
    }
  }

  dellImegsAll(): void {
    if (this.listId.length === 0) return;

    this.imgService.dellImegsAll(this.listId).subscribe({
      next: () => {
        this.listId = [];
        this.action = false;
        this.loadImages();
      },
      error: (err) => console.error('Ошибка при массовом удалении:', err)
    });
  }

  openModal(card: AllUserIngDto): void {
    this.selectedCard = card;
    this.isUpdate = false;
    this.clearUpdatePreviews();
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.selectedCard = null;
    this.isUpdate = false;
    this.clearUpdatePreviews();
    this.cdr.detectChanges();
  }

  selectAction(id: string): void {
    if (!this.listId.includes(id)) {
      this.listId = [...this.listId, id];
    }
    this.action = this.listId.length > 0;
    this.cdr.detectChanges();
  }

  dellSelectAction(id: string): void {
    this.listId = this.listId.filter(filt => filt !== id);
    this.action = this.listId.length > 0;
    this.cdr.detectChanges();
  }

  downloadSelectedFromModal(): void {
    if (!this.selectedCard || !this.selectedCard._id) return;

    this.imgService.download(this.selectedCard._id).subscribe({
      next: (response: string[]) => {
        if (!response || response.length === 0) return;

        response.forEach((fullUrl: string, index: number) => {

          fetch(fullUrl)
            .then(res => {
              if (!res.ok) throw new Error(`Ошибка сети: ${res.statusText}`);
              return res.blob();
            })
            .then(blob => {
              const blobUrl = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = blobUrl;

              const extension = fullUrl.split('.').pop() || 'jpg';

              a.download = `${this.selectedCard?.name || 'image'}_${index + 1}.${extension}`;

              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(blobUrl);
            })
            .catch(err => console.error(`Ошибка при скачивании файла №${index + 1}:`, err));
        });
      },
      error: (err) => {
        console.error('Не удалось получить пути к файлам от сервера:', err);
      }
    });
  }

  // Вспомогательные методы очистки ресурсов памяти (Revoke Object URL)
  private clearImagePreviews(): void {
    this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
    this.imagePreviews = [];
  }

  private clearUpdatePreviews(): void {
    this.updateImagePreviews.forEach(url => URL.revokeObjectURL(url));
    this.updateImagePreviews = [];
  }

  private resetUploadForm(): void {
    this.imgForm.reset({ name: '', description: '', forAllPeople: false });
    this.clearImagePreviews();
    this.selectedFiles = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
