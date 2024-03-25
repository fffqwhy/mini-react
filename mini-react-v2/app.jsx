import ReactMini from './core/React.js';

// const App = React.createElement("div", { id: "app", class: "app" }, 'vite-render', "justString");
function App() {
    return <div>
        这是一个div
        <h1>这是一个h1</h1>
        <div>div1
            <div>div11
                <div>div111
                    <div style={{margin:'12px'}}>div112
                        <div>div113
                            <Test value={123} />
                            <Test value={1234} />
                            <Test value={1235} />
                            <div>div114</div>
                        </div>
                    </div>
                </div>
            </div>
            <TestTest />
            <div>div12</div>

        </div>
    </div>
}

export default App;

function Test({ value }) {
    return <div>test:{value}</div>
}
function TestTest() {
    return <Test value={999} />
}