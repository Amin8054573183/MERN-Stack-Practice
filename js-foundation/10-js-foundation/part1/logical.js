// && -> and
// || -> or
// ! -> reverse

let isLoggedin = true;
let ispaid = true;

// console.log(isLoggedin && ispaid);

let isEmailuser = true;
let isGoogleuser = false;

console.log(isEmailuser || isGoogleuser);
  

//  && ka matlab dono conditions true honi chahiye.
// | isLoggedin | ispaid | Result |
// | ---------- | ------ | ------ |
// | true       | true   | true   |
// | true       | false  | false  |
// | false      | true   | false  |
// | false      | false  | false  |


//  || ka matlab kam se kam ek condition true honi chahiye.
// | isEmailuser | isGoogleuser | Result |
// | ----------- | ------------ | ------ |
// | true        | true         | true   |
// | true        | false        | true   |
// | false       | true         | true   |
// | false       | false        | false  |


// ! value ko ulta kar deta hai
// true → false
// false → true


