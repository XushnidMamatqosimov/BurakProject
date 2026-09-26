console.log("Hello world");

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