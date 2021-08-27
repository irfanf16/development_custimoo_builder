import { Component, Vue } from 'vue-property-decorator'
@Component
export default class ErrorMessages extends Vue{
  public showToast(message:string, title:string):void{
    Vue.$toast.open({
      message: message,
      type: title === 'SUCCESS' ? 'success' : 'error',
      dismissible: true,
      duration: 5000,
      position: 'bottom-left'
    })
  }
  public showError(err: any):void{
    if(typeof err === 'string') {
      Vue.$toast.open({
        message: err,
        type: 'error',
        dismissible: true,
        duration: 5000,
        position: 'bottom-left'
      });
    }
    else {
      const errors = err.response.data.errors;
      const errArr: string[] = [];
      Object.keys(errors).map((field) => {
        errArr.push(errors[field][0]);
      });
      errArr.forEach(element => {
        Vue.$toast.open({
          message: element,
          type: 'error',
          dismissible: true,
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
      Vue.$toast.open({
        message: element,
        type: 'error',
        dismissible: true,
        duration: 5000,
        position: 'bottom-left'
      });
    })
  }
}
