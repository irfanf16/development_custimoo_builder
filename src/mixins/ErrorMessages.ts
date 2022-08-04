import { Component, Vue } from 'vue-property-decorator'
// @ts-ignore
import VsToast from '@vuesimple/vs-toast';

@Component
export default class ErrorMessages extends Vue{
  public showToast(message:string, title:string):void{
    VsToast.show({
      title: message,
      variant: title == 'SUCCESS' ? 'success' : 'error',
      timeout: 5000,
      position: "bottom-left"
    });
  }
  public showError(err: any):void{
    if(typeof err === 'string') {
      VsToast.show({
        title: err,
        variant: 'error',
        timeout: 5000,
        position: "bottom-left"
      });
    }
    else {
      const errors = err.response.data.errors;
      const errArr: string[] = [];
      Object.keys(errors).map((field) => {
        errArr.push(errors[field][0]);
      });
      errArr.forEach(element => {
        VsToast.show({
          title: element,
          variant: 'error',
          duration: 5000,
          position: 'bottom-left'
        });
      })
    }

  }
  public showErrorArr(errors: Record<any, any>[string]):void{
   const errArr: string[] = [];
    Object.keys(errors).map((field: string) => {
      errArr.push(errors[field][0]);
    });
    errArr.forEach(element => {
      VsToast.show({
        title: element,
        variant: 'error',
        duration: 5000,
        position: 'bottom-left'
      });
    })
  }

  public showErrorValidation(errors: Record<any, any>[string]):void{
    const errArr: string[] = [];
     Object.keys(errors).map((field: string) => {
       errArr.push(errors[field]);
     });
     errArr.forEach(element => {
       VsToast.show({
         title: element,
         variant: 'error',
         duration: 5000,
         position: 'bottom-left'
       });
     })
   }

}
