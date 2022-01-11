module.exports = {
    emailRegEx: /^[A-Za-z\d\.\_\-\+]{2,64}\@([A-Za-z\d\-\_]{1,256})\.[A-Za-z\d]+(.[A-Za-z\d]+)?$/,
    passwordRegEx: /^[a-zA-Z0-9-_\!\@\#\$\%\^&\*]{6,15}$/,
    passwordAppRegEx: /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])[\w\d!@#$%_]{8,15}$/,
    otpRegEx: /^[0-9]{6}$/,
    phoneRegEx: /^[0-9]{10,12}$/,
    nameRegExp: /^[a-z\sA-z]{50}$/,
    nickNameRegEx: /^[a-z0-9]{30}$/,
    percentageRegEx: /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/,
    addressRegex:/^0x[a-fA-F0-9]{40}$/,

}