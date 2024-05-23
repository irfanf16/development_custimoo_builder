import { Component, Vue } from 'vue-property-decorator'
// @ts-ignore
import VsToast from '@vuesimple/vs-toast';

@Component
export default class ErrorMessages extends Vue{
  /*
  * title= {success, warning, error, info, secondary}
  * */
  public showToast(message:string, title:string, timeout=5000):void{
    VsToast.show({
      title: message,
      variant: title,
      timeout: timeout,
      position: "bottom-left"
    });
  }
  public showError(err: any, timeout=5000):void{
    if(typeof err === 'string') {
      VsToast.show({
        title: err,
        variant: 'error',
        timeout: timeout,
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
  public showErrorArr(errors: Record<any, any>[string], timeout=5000):void{
   const errArr: string[] = [];
    Object.keys(errors).map((field: string) => {
      errArr.push(errors[field][0]);
    });
    for (let i = 0; i < errArr.length; i++) {
      const element = errArr[i];
      setTimeout(() => {
        VsToast.show({
          title: element,
          variant: 'error',
          duration: timeout,
          position: 'bottom-left'
        });
      }, i * timeout); // Delay each toast by the timeout duration
    }
  }

  public showErrorValidation(errors: Record<any, any>[string], timeout=5000):void{
    const errArr: string[] = [];
     Object.keys(errors).map((field: string) => {
       errArr.push(errors[field]);
     });
     errArr.forEach(element => {
       VsToast.show({
         title: element,
         variant: 'error',
         duration: timeout,
         position: 'bottom-left'
       });
     })
   }
}
