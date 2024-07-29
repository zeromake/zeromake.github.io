import html from './htm.module.js';
import {useState} from 'preact/hooks';
import {Link} from 'wouter-preact';

export default () => {
    const [count, setCount] = useState(0);
    return html`<div>
      <p>count is ${count}<//>
      <button onClick=${() => setCount(count + 1)}>incr<//>
      <${Link} href="/">go<//>
    <//>`
};
