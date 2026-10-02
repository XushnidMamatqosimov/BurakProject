import { T } from "./libs/types/common";

console.log("Hello world");

// Q - Task
function hasPropety(obj: object, isPropety: string) : boolean{
    let res =  Object.keys(obj);
    for(let key of res){
        if(key === isPropety){
            return true;
        }
    }
    return false;
}
const person = {
    name: "Declan",
    age: 21
}
const isTrue = hasPropety(person, "name");
console.log(isTrue);




// P-Task
/* const User = {
    name: "Ali",
    age: 24,
    email: "ali@gmail.com"
}
function objectToArray (arr: Object): Array<T>{
    const resArr = [];
    const res = Object.entries(arr);
    for(let loop of res){
        resArr.push(loop);
    }
    return resArr;
}

const res = objectToArray(User)
console.log(res); */



/* // O - Task
function numberSum(arr: any[]){
    let res = 0;
    for(let num of arr){
        if(typeof num === "number"){
            res += num;
        }
    }
    console.log(res);
}

const arrayBu = [1,"ali", "vali", 4,5, true, 9]
numberSum(arrayBu);
 */
// N - Task
/* function getPalindronCheck(text: string): boolean{
    const reversedText = text.split('').reverse().join("");

    console.log(reversedText)
    if(text === reversedText){
        return true
    }
    return false;
}
 const a= getPalindronCheck("qovoq");
 console.log(a); */





// M - Task
/* const arr12 = [1,2,3,4];
function getSquare(arr: number[]): number[] {
    let a = 0;
    const squaredArr = []

    for(let num of arr){
        squaredArr.push(Math.pow(num,2));
    }
    for(let res of squaredArr){
        //console.log(res);
    }
    return squaredArr;
}

const newArr = getSquare(arr12);
console.log(newArr); */



// O - Task
/* function numberSum(arr: any[]){
    let res = 0;
    for(let num of arr){
        if(typeof num === "number"){
            res += num;
        }
    }
    console.log(res);
}

const arrayBu = [1,"ali", "vali", 4,5, true, 9]
numberSum(arrayBu); */