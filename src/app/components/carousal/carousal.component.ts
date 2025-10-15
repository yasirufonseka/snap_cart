import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators, ɵInternalFormsSharedModule } from "@angular/forms";
import { HttpClient } from '@angular/common/http';



@Component({
  selector: 'app-carousal',
  imports: [RouterLink],
  templateUrl: './carousal.component.html',
  styleUrl: './carousal.component.scss'
})
export class CarousalComponent {
assistence!: FormGroup;
styleForm: any;

constructor(private fb:FormBuilder,private http:HttpClient ) {
  this.assistence =  this.fb.group({
    description: ['',[Validators.required]],
    gender: ['',[Validators.required]],
    occasion: ['',[Validators.required]],
    bodyType: ['',[Validators.required]]
 });

 
}

handleChangeGender() {

  //get value on changes
  const selectedGender = this.assistence.get('gender')?.value;
  console.log('Selected Gender:', selectedGender);
  throw new Error('Method not implemented.');
}

handleChangeOccasion() {

  //get value on changes
  const selectedOccasion = this.assistence.get('occasion')?.value;
  console.log('Selected Occasion:', selectedOccasion);
  throw new Error('Method not implemented.');
}
handleChangeBodyType() {

  //get value on changes
  const selectedBodyType = this.assistence.get('bodyType')?.value;
  console.log('Selected Body Type:', selectedBodyType);
  throw new Error('Method not implemented.');
}




onSubmit() {
  if(this.assistence.valid){
    const formData = this.assistence.value;
   this.http.post('http://localHost:8080/api/stylesAssistence',{params:formData}).subscribe({
     next: (response) => {
       console.log('Response from backend:', response);
     },
     error: (error) => {
       console.error('Error from backend:', error);
     }
   });


  
  }
//}
}


}
