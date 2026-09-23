console.log("Hello world");

// M - Task
const arr12 = [1,2,3,4];
function getSquare(arr: number[]): number[] {
    let a = 0;
    const squaredArr = []

    /* for (let i = 0; i <= arr.length; i++){

        squaredArr.push(Math.pow(i,2));
    } */
    for(let num of arr){
        squaredArr.push(Math.pow(num,2));
    }
    for(let res of squaredArr){
        //console.log(res);
    }
    return squaredArr;
}

const newArr = getSquare(arr12);
console.log(newArr);