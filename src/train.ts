import { T } from "./libs/types/common";

console.log("Hello world");

// U - Task
function getOddNumbers(number: number): number {
    let son= 0;
    const oddNumbers: number[] = [];
    while (son < number) {
        if (son % 2 === 1) {
            oddNumbers.push(son);
        }
        son++;
    }
    return oddNumbers.length;
}
console.log(getOddNumbers(10));


// T - Task
/* function sortedArrays(arr: number[], arr2: number[]): number[]{
    const res = arr.concat(arr2).sort();
    return res;
}
const array = [1,2,3];
const array2 = [6,5,4];
console.log(sortedArrays(array, array2)); */

//S - TAsk
/* function missingNumbers(arr: number[]): number[] {
    let res = arr.sort((a,b)=>a-b);
    let finalRes: number[] = [];
    const maxNum = res[res.length-1];
    const minNum = res[0];
    for(let i = minNum; i<maxNum; i++){
        if(!res.includes(i)){
            finalRes.push(i);
        }
    }
    return finalRes;
}
const iniatalArray = [1,4,5,8,12,];
console.log(missingNumbers(iniatalArray));
 */



// R -Task
/* function calculate(a: string, b: string): number{
    let number;
    number = parseInt(a)+parseInt(b);

    return number;
}
const res = calculate("1", "2");
console.log(res) */



// Q - Task
/* function hasPropety(obj: object, isPropety: string) : boolean{
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
 */



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