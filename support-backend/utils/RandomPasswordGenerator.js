function generatePassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return password;
}
export const generateOTP=(length=6)=>{
    const chars="0123456789";
    let otp="";

    for (let i = 0; i < length; i++) {
        otp += chars.charAt(
            Math.floor(Math.random() * chars.length)
        );
    }

    return otp;
}

export default generatePassword;

