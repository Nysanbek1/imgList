import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output, HostListener, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { AllUserIngDto, ImgService } from '../../servis/imgs.servis';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-image-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './image-card.html',
  styleUrl: './image-card.scss',
})
export class ImageCard implements OnChanges{
  @Input() imgInfo!: AllUserIngDto;
  @Input() listId: string[] =[];
  @Output() cardClick = new EventEmitter<AllUserIngDto>();
  @Output() deleteClick = new EventEmitter<void>(); 
  @Output() selectAction = new EventEmitter<string>(); 
  @Output() dellSelectAction = new EventEmitter<string>(); 
  isMenuOpen = false;
  action: boolean = false;


  constructor(private imgService: ImgService) {}


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listId'] || changes['imgInfo']) {
      this.checkSelectionStatus();
    }
  }

  private checkSelectionStatus(): void {
    if (this.listId && this.imgInfo) {
      this.action = this.listId.includes(this.imgInfo._id);
    } else {
      this.action = false;
    }
  }

  onCardClick(): void {
    if (!this.action) {
      this.cardClick.emit(this.imgInfo);
    }
  }


  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onDellSelectAction(): void {
    this.isMenuOpen = false;
    this.dellSelectAction.emit(this.imgInfo._id)

  }

  // Клик по действию "Выбрать"
  onSelectAction(): void {
    this.isMenuOpen = false;
    this.selectAction.emit(this.imgInfo._id)
    //this.onCardClick(); 
  }

  onDeleteAction(): void {
    this.isMenuOpen = false;
    const id = this.imgInfo?._id;
    if (id) {
      this.imgService.dellImg(id).subscribe({
        next: () => {
          this.deleteClick.emit(); 
        },
        error: (err) => {
          console.error('Ошибка бэкенда при удалении:', err);
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  clickOut(event: Event) {
    this.isMenuOpen = false;
  }
}