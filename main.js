import {createElement, render} from './micro-react';
import {useState} from "./micro-react/render.js";

const container = document.querySelector('#root');

// const handleChange = (e) => {
//     renderer(e.target.value);
// }
//
// const renderer = (value) => {
//     console.log(1);
//     const element = createElement(
//         'div',
//         null,
//         createElement('input',
//             {
//                 value: value,
//                 oninput: (e) => {
//                     handleChange(e);
//                 }
//             }),
//         createElement('h2', null, value)
//     );
//     render(element, container);
// }
//
// renderer('Hello')

// const App = (props) => {
//     return createElement('h1', null, 'Hello', props.name);
// }

function Counter() {
    const [state, setState] = useState(1);
    return createElement('h1', {
        onclick: e => setState(prevState => prevState + 1),
    }, 'count' + state)
}

const element = createElement(Counter);

render(element, container);
