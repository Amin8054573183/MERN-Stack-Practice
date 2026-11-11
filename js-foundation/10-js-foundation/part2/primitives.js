// Number

let balance = 120;    //type of = number
let anotherBalance = new Number(120);   //type of = object

// console.log(balance);
// console.log(anotherBalance.valueOf());     // output hoga 120

// console.log(typeof balance);
// console.log(typeof anotherBalance);

//boolean
let isActive = true;     // type of boolean
let isReallyActive = new Boolean(true); // not recommended     ye hai object

// null and undefined

let firstname = null;    //object
let lastname = undefined;   //undefined
// console.log(firstname);
// console.log(lastname);

//string

let myString = "hello";
let myStringOne = "Hola";
let username = "hitesh";

let oldGreet = myString + " " + "hitesh";
// console.log(oldGreet);    hello hitesh

let greetMessage = `Hello ${username} !`;   //Hello hitesh !
let demoOne = `Value is ${2 * 2}`;     //Value is 4
// console.log(demoOne);

let sm1 = Symbol("hitesh");
let sm2 = Symbol("hitesh");
//false

console.log(sm1===sm2);

//Primitive Types Covered
// | Type      | Example            |
// | --------- | ------------------ |
// | Number    | `120`              |
// | Boolean   | `true`             |
// | Null      | `null`             |
// | Undefined | `undefined`        |
// | String    | `"hello"`          |
// | Symbol    | `Symbol("hitesh")` |

