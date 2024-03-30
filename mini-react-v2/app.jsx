import ReactMini from './core/React.js';

// const App = React.createElement("div", { id: "app", class: "app" }, 'vite-render', "justString");
let count1 = 10
function App() {
    function count() {
        console.log("123");
        count1++;
        ReactMini.update();
    }
    // return <Test value={count1} onClick={count}/>
    return (<ShowBar/> )
}

export default App;

function Test({ value, onClick }) {
    return <div onClick={onClick}>test:{value}</div>
}
let showBar = false;
function ShowBar() {
    const foo = <div>
        foo
        <div>foo2</div>
    </div>;
    const bar = <p>bar</p>;
    function handleShowBar(){
        showBar = !showBar;
        ReactMini.update();
    }
    return <div>
        {showBar ? bar : foo}
        <button onClick={handleShowBar}>showbar</button>
    </div>
}