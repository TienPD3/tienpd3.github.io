import { name, mydemo } from './library.js'

function sayHello() {
  mydemo();
 // console.log(`hello ${name}!`)
} 

window.addEventListener('DOMContentLoaded', event => {
  document.querySelector('button').addEventListener('click', sayHello)
})