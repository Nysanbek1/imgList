import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { api } from "./api";
import { Observable } from "rxjs";

const apiCreateImg = api + "imegs/image-items-create";
const apiGetAllUserImg = api + "imegs/image-items-all/";
const apoGetDownload = api + "imegs/image-items";
const apiUpdateImg = api + "imegs/image-items-update";
const apiDellImg = api + "imegs/image-items-dell-one/"
const apiDellImegsAll = api + "imegs/image-items-dell-list"
const apiAllOpenImg = api + "imegs/allOpenImg/"
export interface AllUserIngDto {
    _id: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    imagePath: string[],
    forAllPeople: boolean,
    ownerId: string,
}

export interface ImageCardDto {
    _id: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    imagePath: string,
    forAllPeople: boolean,
    ownerId: string,
}

export interface ImageCardOpenDto {
    _id: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    imagePath: string[],
    forAllPeople: boolean,
    ownerId: string,
    nameUser: string,
}

export interface UpdateImgDto {
    _id: string,
    ownerId: string,
    name: string,
    description: string,
    forAllPeople: boolean,
}



@Injectable({
  providedIn: 'root',
})
export class ImgService {
    constructor(
        private http: HttpClient,
    ){}
    get currentUserId(): string | null {
        return localStorage.getItem('userId');
    }

    dellImegsAll(Ids: string[]) {
        const userId = localStorage.getItem('userId');
        return this.http.post(apiDellImegsAll, {ownerId: userId, _id: Ids })
    }

    dellImg(imgId: string) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        return this.http.delete(`${apiDellImg}${userId}/${imgId}`)
    }

    updateImg(formData: FormData) {

        if (this.currentUserId) {
            formData.append('ownerId', this.currentUserId);
        }
        return this.http.put(`${apiUpdateImg}`, formData)
    }

    download(ImgId: string): Observable<string[]> {
        return this.http.get<string[]>(`${apoGetDownload}/${ImgId}/download`)
    }

    getAllUserIng(): Observable<AllUserIngDto[]> {
        const userId = localStorage.getItem('userId');
        return this.http.get<AllUserIngDto[]>(`${apiGetAllUserImg}${userId}`)
    }

    createImg(formData: FormData) {
        if (this.currentUserId) {
            formData.append('ownerId', this.currentUserId);
        }
        return this.http.post<boolean>(apiCreateImg, formData);
    }

    allOpenImg(skip: number): Observable<ImageCardOpenDto[]> {
      return this.http.get<ImageCardOpenDto[]>(`${apiAllOpenImg}${skip}`)
    }
}
