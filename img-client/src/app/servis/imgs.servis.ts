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
export interface AllUserIngDto {
    _id: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    imagePath: string,
    onerId: string,
}

export interface ImageCardDto {
    _id: string,
    name: string,
    description: string,
    createdAt: string,
    updatedAt: string,
    imagePath: string,
    onerId: string,
}

export interface UpdateImgDto {
    _id: string,
    onerId: string,
    name: string,
    description: string,
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
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        const userId = localStorage.getItem('userId');
        return this.http.post(apiDellImegsAll, {onerId: userId, _id: Ids }, { headers })
    }
    
    dellImg(imgId: string) {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        const userId = localStorage.getItem('userId');
        return this.http.delete(`${apiDellImg}${userId}/${imgId}`, { headers })
    }

    updateImg(formData: FormData) {
        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        if (this.currentUserId) {
            formData.append('onerId', this.currentUserId);
        }
        return this.http.put(`${apiUpdateImg}`, formData, { headers })
    }

    getBiId(ImgId: string): Observable<ImageCardDto> {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<ImageCardDto>(`${apoGetBiId}/${userId}/${ImgId}`, { headers })
    }

    getAllUserIng(): Observable<AllUserIngDto[]> {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
        return this.http.get<AllUserIngDto[]>(`${apiGetAllUserImg}${userId}`, { headers })
    }

    createImg(formData: FormData) {
        const token = localStorage.getItem('token');
        
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        if (this.currentUserId) {
            formData.append('onerId', this.currentUserId);
        }
        return this.http.post<boolean>(apiCreateImg, formData, { headers });
    }
}