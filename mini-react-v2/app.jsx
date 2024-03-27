import ReactMini from './core/React.js';

// const App = React.createElement("div", { id: "app", class: "app" }, 'vite-render', "justString");
function App() {
    return <div>
        这是一个div
        <h1>这是一个h1</h1>
        <TestTest />
        <Test value={123} />
    </div>
}

export default App;

function Test({ value }) {
    return <div>test:{value}</div>
}
function TestTest() {
    return <Test value={999} />
}