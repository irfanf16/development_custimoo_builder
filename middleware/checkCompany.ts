import store from '../src/store'
import {getCompany} from "@/helpers/Helpers";

const checkCompanyStatus = async (to, from, next) => {
  await getCompany()
  if (store.getters.getCompany.status == 0) {
    if (to.name !== 'Deactive'){
        next('/deactive')
    }
  }else if (to.name === 'Deactive'){
    next('/')
  }

  next();
}

export {
  checkCompanyStatus
}
