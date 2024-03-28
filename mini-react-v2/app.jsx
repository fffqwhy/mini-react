import ReactMini from './core/React.js';

// const App = React.createElement("div", { id: "app", class: "app" }, 'vite-render', "justString");
let count1 = 10
function App() {
    function count() {
        console.log("123");
        count1++;
        ReactMini.update();
    }
    return (<div>
        <Test value={count1} onClick={count}/>
        <button onClick={count}>click:{count1}</button>
    </div>)
}

export default App;

function Test({ value, onClick }) {
    return <div onClick={onClick}>test:{value}</div>
}
function TestTest() {
    return <Test value={999} />
}