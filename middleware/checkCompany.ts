import store from '../src/store'
import {getCompany} from "@/helpers/Helpers";

const checkCompanyStatus = async (to, from, next) => {
  await getCompany()

  if (store.getters.getCompany.pending_payment == 1) {
    if(to.name !== 'Payment')
      next('/payment')
  } else if (store.getters.getCompany.status == 0) {
    if(to.name !== 'Deactive')
      next('/deactive')
  }else if(to.name === 'Deactive' || to.name === 'Payment') {
    next('/')
  }

  next();
}

export {
  checkCompanyStatus
}
