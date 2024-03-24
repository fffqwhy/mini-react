import ReactMini from './core/React.js';

// const App = React.createElement("div", { id: "app", class: "app" }, 'vite-render', "justString");
const App = <div>
    这是一个div
    <h1>这是一个h1</h1>
    <div>div1
        <div>div11
            <div>div111
                <div>div112
                    <div>div113
                        <div>div114</div>
                    </div>
                </div>
            </div>
        </div>
        <div>div12</div>

    </div>
</div>

export default App;