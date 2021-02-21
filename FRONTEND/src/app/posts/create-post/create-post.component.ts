import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Post } from '../post.model';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { mimeType } from './mime-type.validator';
import { PostService } from '../../services/post.service';
import { ProfileService } from 'src/app/services/profile.service';


@Component({
  selector: "app-create-post",
  templateUrl: "./create-post.component.html",
  styleUrls: ["./create-post.component.css"],
})
export class CreatePostComponent implements OnInit {
  itemdate: Date;
  fetchedDate: Date;
  form: FormGroup;
  isLoading: boolean = false;
  imagePreview: string;
  post: Post;
  private mode = "create";
  private postId: string;
  constructor(
    private ps: PostService,
    public route: ActivatedRoute,
    public profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkProfileCreated();
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has("postId")) {
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        this.getPostById(this.postId);
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
    this.createForm();
  }

  getPostById(id) {
    this.isLoading = true;
    this.ps.getPost(id).subscribe((postData) => {
      this.post = {
        id: postData._id,
        title: postData.title,
        content: postData.content,
        imagePath: postData.imagePath,
        creator: postData.creator,
        rent: postData.rent,
        cost: postData.cost,
        mdate: postData.mdate,
        isFree: postData.isFree,

      };
      this.imagePreview = postData.imagePath;
      this.form.setValue({
        title: this.post.title,
        content: this.post.content,
        image: this.post.imagePath,
        rent: postData.rent,
        cost: postData.cost,
        mdate: postData.mdate,
        isFree: postData.isFree,
      });
      if(postData.isFree){        
        this.form.get('rent').setValue(null);
      }
      this.isLoading = false;
    });
  }

  createForm() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
      isFree: new FormControl(false),
      rent: new FormControl(null, {
        validators: [Validators.required],
      }),
      mdate: new FormControl(null, {
        validators: [Validators.required],
      }),
      cost: new FormControl(null, {
        validators: [Validators.required],
      }),
    },{ validators: this.checkvalue });
    this.form.get('isFree').setValue(false);
  }


  checkvalue(group: FormGroup) { // here we have the 'passwords' group
  const rent = group.get('rent').value;
  const cost = group.get('cost').value;
  return cost > rent ? null : { gretter: true }     
}

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  checkIsFree(e){
    this.form.value.isFree = e.currentTarget.checked
    if(this.form.value.isFree){
      this.form.value.rent = null
    }
  }

  onSaveItem() {    
    this.itemdate = new Date();;
    // if (this.form.invalid) {
    //   return;
    // }
    this.isLoading = true;
    if (this.mode === "create") {
      this.ps.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
        this.itemdate,
        this.form.value.rent,
        this.form.value.cost,
        this.form.value.mdate,
        this.form.value.isFree,

      );
    } else {
      this.ps.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
        this.form.value.rent,
        this.form.value.cost,
        this.form.value.mdate,
        this.form.value.isFree,

      );
    }
    this.form.reset();
  }

  checkProfileCreated() {
    this.profileService.getProfileByCreatorId().subscribe(
      (profile) => {
        if (!profile) {
          this.router.navigate(["/profile"]);
        }
      },
      (e) => {
        this.router.navigate(["/profile"]);
      }
    );
  }

  isValid(): boolean {    
    if( (this.form.get('title').valid && this.form.get('content').valid && this.form.get('image').valid && this.form.get('cost').valid && this.form.get('mdate').valid) && !this.form.hasError('gretter') && ( this.form.get('rent').valid|| ( this.form.value.isFree == true ) ) ) {
       return false;
    }
 return true;
}

}


