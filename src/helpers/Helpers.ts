const getRandom = (length= 5, type= 'number') => {
  let rand_string: number|string = "";
  if (type === 'number') {
    let max_number: number|string = "9";
    for (let i = 1; i < length; i++) {
      max_number = max_number + "9";
    }
    max_number = parseInt(max_number);
    rand_string = Math.floor(max_number + (Math.random() * max_number));
  } else if (type === 'string') {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    for( let i=0; i < length; i++ ) {
      rand_string += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  } else {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    for( let i=0; i < length; i++ ) {
      rand_string += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  return rand_string;
}

export {getRandom};
