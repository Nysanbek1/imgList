import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { api } from "./api";
import { Observable } from "rxjs";

const apiCreateImg = api + "imegs/createPostImg";
const apiGetAllUserImg = api + "imegs/getAllUserImgs/";
const apoGetBiId = api + "imegs/getBiId";
const apiUpdateImg = api + "imegs/updateImg";
const apiDellImg = api + "imegs/delleteImgUser/"
const apiDellImegsAll = api + "imegs/dellImegs"
const apiAllOpenImg = api + "imegs/allOpenImg/"
export interface AllUserIngDto {
    _id: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    imagePath: string,
    forAllPeople: boolean,
    onerId: string,
}

export interface ImageCardDto {
    _id: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    imagePath: string,
    forAllPeople: boolean,
    onerId: string,
}

export interface ImageCardOpenDto {
    _id: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    imagePath: string,
    forAllPeople: boolean,
    onerId: string,
    nameUser: string,
}

export interface UpdateImgDto {
    _id: string,
    onerId: string,
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
        return this.http.post(apiDellImegsAll, {onerId: userId, _id: Ids })
    }

    dellImg(imgId: string) {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        return this.http.delete(`${apiDellImg}${userId}/${imgId}`)
    }

    updateImg(formData: FormData) {

        if (this.currentUserId) {
            formData.append('onerId', this.currentUserId);
        }
        return this.http.put(`${apiUpdateImg}`, formData)
    }

    getBiId(ImgId: string): Observable<ImageCardDto> {
        const userId = localStorage.getItem('userId');
        return this.http.get<ImageCardDto>(`${apoGetBiId}/${userId}/${ImgId}`)
    }

    getAllUserIng(): Observable<AllUserIngDto[]> {
        const userId = localStorage.getItem('userId');
        return this.http.get<AllUserIngDto[]>(`${apiGetAllUserImg}${userId}`)
    }

    createImg(formData: FormData) {
        if (this.currentUserId) {
            formData.append('onerId', this.currentUserId);
        }
        return this.http.post<boolean>(apiCreateImg, formData);
    }

    allOpenImg(skip: number): Observable<ImageCardOpenDto[]> {
      return this.http.get<ImageCardOpenDto[]>(`${apiAllOpenImg}${skip}`)
    }
}
