import { Injectable } from "@angular/core";
import { Post } from "../posts/post.model";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";
const BACKEND_URL = environment.apiUrl + "/items";
import { ToastService } from './toast.service';

@Injectable({
  providedIn: "root",
})
export class PostService {
  private posts: Post[] = [];

  private postsUpdated = new Subject<Post[]>();
  public err = new BehaviorSubject<any>(null);
  constructor(private http: HttpClient, private router: Router,public toastService: ToastService,
    ) {}

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(
    title: string,
    content: string,
    imgpath: File,
    itemDate: Date,
    rent: string,
    cost: string,
    mdate: Date,
    isFree:Boolean
  ) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", imgpath, title);
    postData.append("itemDate", itemDate.toString());
    postData.append("rent", rent);
    postData.append("mdate", mdate.toString());
    postData.append("cost", cost);
    postData.append("isFree", isFree.toString());

    this.http
      .post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        this.err.next(null);
        this.router.navigate(["/"]);
      }),
      (err) => {
        this.err.next(err);
      };
  }

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>(BACKEND_URL)
      .pipe(
        map((postData) => {
          return postData.posts.map((post) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              itemDate: post.itemDate,
              rent: post.rent,
              cost: post.cost,
              mdate: post.mdate,
              isFree: post.isFree,
            };
          });
        })
      )
      .subscribe(
        (transformedPosts) => {
          this.err.next(null);

          this.posts = transformedPosts;
          this.postsUpdated.next([...this.posts]);
        },
        (err) => {
          this.err.next(err);
        }
      );
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
      rent: string;
      cost: string;
      mdate: Date;
      itemDate: Date;
      isFree:Boolean

    }>(BACKEND_URL + "/" + id);
  }

  getMyPost(id: string) {
    this.http
      .get<{ message: string; posts: any }>(BACKEND_URL + "/mypost")
      .pipe(
        map((postData) => {
          return postData.posts.map((post) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              itemDate: post.itemDate,
              rent:  post.rent,
              cost:  post.cost,
              mdate:  post.mdate,
              isFree: post.isFree,

            };
          });
        })
      )
      .subscribe(
        (transformedPosts) => {
          this.err.next(null);

          this.posts = transformedPosts;
          this.postsUpdated.next([...this.posts]);
        },
        (err) => {
          this.err.next(err);
        }
      );
  }

  updatePost(
    id: string,
    title: string,
    content: string,
    image: File | string,
    rent: string,
    cost: string,
    mdate: Date,
    isFree:Boolean
  ) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
      postData.append("rent", rent);
      postData.append("mdate", mdate.toString());
      postData.append("cost", cost);
      postData.append("isFree", isFree.toString());

    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null,
        rent: rent,
        mdate: mdate,
        cost: cost,
        isFree: isFree,
      };
    }
    this.http.put(BACKEND_URL + "/" + id, postData).subscribe(
      (response:any) => {
        if(!response.status){
          this.toastService.showToast("warning",response.message);
        }
        this.err.next(null);
        this.router.navigate(["/myposts"]);
        
      },
      (err) => {
        this.err.next(err);
      }
    );
  }

  deletePost(postId: string) {
    this.http.delete(BACKEND_URL + "/" + postId).subscribe(
      (data:any) => {
        if(!data.status){
          this.toastService.showToast("warning",data.message);
        }
        
        this.err.next(null);
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      },
      (e) => {
        this.err.next(e);
      }
    );
  }

  buyItem(itemId,userId){
    this.http.post(BACKEND_URL + "/buyItem", {itemId,userId}).subscribe(
      (responseData) => {
        this.err.next(null);
        this.toastService.showToast("success","Item purchased on rent successfully");
        this.router.navigate(["/"]);
      }),
      (err) => {
        this.err.next(err);
      };
  }

}
