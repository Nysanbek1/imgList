import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ImageCardOpenDto, ImgService } from '../../servis/imgs.servis';
import { Header } from '../header/header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [Header, CommonModule],
  templateUrl: './posts.html',
  styleUrl: './posts.scss',
})
export class Posts implements OnInit {
  allImg: ImageCardOpenDto[] = [];
  skip = 0;

  selectedPost: ImageCardOpenDto | null = null;

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

  openDetail(post: ImageCardOpenDto): void {
    this.selectedPost = post;
    this.cdr.detectChanges();
  }

  closeDetail(): void {
    this.selectedPost = null;
    this.cdr.detectChanges();
  }

  downloadImage(post: ImageCardOpenDto, event: Event): void {
    event.stopPropagation();

    if (!post.imagePath || post.imagePath.length === 0) return;

    this.imgService.download(post._id).subscribe({
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

              a.download = `${post?.name || 'image'}_${index + 1}.${extension}`;

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


}
