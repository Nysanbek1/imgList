import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ImageCardOpenDto, ImgService } from '../../servis/imgs.servis';
import { Header } from '../header/header';
import { CommonModule } from '@angular/common'; // Импортируем CommonModule

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [Header, CommonModule], // Добавили CommonModule сюда
  templateUrl: './posts.html',
  styleUrl: './posts.scss',
})
export class Posts implements OnInit {
  allImg: ImageCardOpenDto[] = [];
  skip = 0;

  // Переменная для хранения активного поста в модальном окне
  selectedPost: ImageCardOpenDto | null = null;

  // Базовый URL твоего бэкенда для картинок (поменяй порт, если другой)
  readonly baseUrl = 'http://localhost:3010/';

  constructor(private imgService: ImgService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadImages();
  }

  loadImages(): void {
    this.imgService.allOpenImg(this.skip).subscribe({
      next: (res) => {
        this.allImg = [...this.allImg, ...res];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Ошибка загрузки галереи:', err)
    });
  }

  // Открыть модалку
  openDetail(post: ImageCardOpenDto): void {
    this.selectedPost = post;
    this.cdr.detectChanges();
  }

  // Закрыть модалку
  closeDetail(): void {
    this.selectedPost = null;
    this.cdr.detectChanges();
  }

  // Метод для скачивания картинки
  downloadImage(post: ImageCardOpenDto, event: Event): void {
    event.stopPropagation(); // Чтобы не срабатывал клик по самой карточке

    const imageUrl = `${this.baseUrl}${post.imagePath}`;

    // Скачивание через создание временной ссылки
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = post.name || 'downloaded-image';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(err => console.error('Ошибка при скачивании файла:', err));
  }
}
