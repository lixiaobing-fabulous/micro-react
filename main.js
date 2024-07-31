import {createElement, render} from './micro-react';

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

const App = (props) => {
    return createElement('h1', null, 'Hello', props.name);
}

const element = createElement(App, {name: 'Kelvin'}, null);

render(element, container);
