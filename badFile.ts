import { Injectable } from '@nestjs/common';

@Injectable()
export class BadCodeService {

  // Calculate factorial using recursion without error checks or proper naming
  public fact(n) {
    if (n <= 1) {
      return 1;
    } else {
      return n * this.fact(n - 1);
    }
  }

  // Sum an array in a clumsy way
  public sumArr(arr) {
    let s = 0;
    for (let i = 0; i < arr.length; i++) {
      s = s + arr[i];
    }
    return s;
  }

  // Reverse a string with poor variable names
  public revStr(str) {
    let ret = "";
    for (let i = str.length - 1; i >= 0; i--) {
      ret += str[i];
    }
    return ret;
  }

  // Count vowels in a string using repetitive conditionals
  public cntVowels(s) {
    let cnt = 0;
    for (let i = 0; i < s.length; i++) {
      if (
        s[i] === 'a' || s[i] === 'e' || s[i] === 'i' || s[i] === 'o' || s[i] === 'u' ||
        s[i] === 'A' || s[i] === 'E' || s[i] === 'I' || s[i] === 'O' || s[i] === 'U'
      ) {
        cnt++;
      }
    }
    return cnt;
  }

  // Bubble sort an array (inefficient and poorly formatted)
  public badSort(array) {
    for (let i = 0; i < array.length; i++) {
      for (let j = i + 1; j < array.length; j++) {
        if (array[i] > array[j]) {
          let tmp = array[i];
          array[i] = array[j];
          array[j] = tmp;
        }
      }
    }
    return array;
  }

  // Check if a number is prime using a naive approach
  public isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i < num; i++) {
      if (num % i === 0) return false;
    }
    return true;
  }

  // Return all prime numbers up to n using the above isPrime (very inefficient)
  public getPrimes(n) {
    let pr = [];
    for (let i = 0; i <= n; i++) {
      if (this.isPrime(i)) {
        pr.push(i);
      }
    }
    return pr;
  }

  // Calculate fibonacci number recursively (inefficiently)
  public fibonacci(n) {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }

  // Calculate nth Fibonacci using loop (redundant duplicate of recursive version)
  public fibLoop(n) {
    if (n <= 1) return n;
    let a = 0, b = 1, c;
    for (let i = 2; i <= n; i++) {
      c = a + b;
      a = b;
      b = c;
    }
    return b;
  }

  // Concatenate two arrays by manually looping through both
  public concatArrays(a, b) {
    let res = [];
    for (let i = 0; i < a.length; i++) {
      res.push(a[i]);
    }
    for (let j = 0; j < b.length; j++) {
      res.push(b[j]);
    }
    return res;
  }

  // Find the maximum value in an array using a loop
  public findMax(arr) {
    let maxVal = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > maxVal) {
        maxVal = arr[i];
      }
    }
    return maxVal;
  }

  // Multiply two numbers by repeatedly adding (inefficient)
  public multiply(a, b) {
    if (a === 0 || b === 0) return 0;
    let prod = 0;
    let times = Math.abs(b);
    for (let i = 0; i < times; i++) {
      prod += Math.abs(a);
    }
    if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
      prod = -prod;
    }
    return prod;
  }

  // Generate a greeting string using basic concatenation
  public greet(name) {
    return "Hello, " + name + "! Welcome to " + "NestJS Service" + ".";
  }

  // Reverse an array by pushing elements into a new array
  public reverseArray(arr) {
    let newArr = [];
    for (let i = arr.length - 1; i >= 0; i--) {
      newArr.push(arr[i]);
    }
    return newArr;
  }

  // Calculate the average of an array without checking for empty arrays
  public average(arr) {
    let tot = 0;
    for (let i = 0; i < arr.length; i++) {
      tot += arr[i];
    }
    return tot / arr.length;
  }

  // A poorly structured function that combines several operations
  public processData(data) {
    // Suppose data is an array of numbers. We will sort, reverse and sum it
    let sorted = this.badSort(data.slice());
    let reversed = this.reverseArray(data.slice());
    let sumSorted = this.sumArr(sorted);
    let sumReversed = this.sumArr(reversed);
    // Return an object with results but with unclear keys
    return {
      a: sorted,
      b: reversed,
      c: sumSorted,
      d: sumReversed,
      e: this.average(data),
      f: this.findMax(data)
    };
  }

  // Another function with mixed responsibilities
  public complexOperation(n, s, arr) {
    // Calculate factorial, reverse a string, and count vowels in string all in one function
    let f = this.fact(n);
    let rs = this.revStr(s);
    let cv = this.cntVowels(s);
    let sa = this.sumArr(arr);
    let av = this.average(arr);
    // Return concatenated string with all results, without clear formatting
    return "Factorial:" + f + "|Reversed String:" + rs + "|Vowels:" + cv + "|Sum:" + sa + "|Avg:" + av;
  }
}
