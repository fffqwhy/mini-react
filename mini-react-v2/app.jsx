import ReactMini from './core/React.js';
import './app.css';
import TodoList from './demo/todolist.jsx'
// const App = React.createElement("div", { id: "app", class: "app" }, 'vite-render', "justString");
function App() {
    const [fooVisible, setVisible] = ReactMini.useState(true);
    return (
        <div>
            {/* <TodoList/> */}
            <button onClick={() => setVisible((visible) => !visible)}>删除foo</button>
            {fooVisible ? <ShowFoo key={1} />:1}
            <ShowBar/>
            <ShowBar />
            {/* <ShowBar value={2} /> */}
        </div>
    )
}

export default App;

function ShowBar() {
    const [count, setCount] = ReactMini.useState(1);
    const [count1, setCount1] = ReactMini.useState(23);
    ReactMini.useEffect(() => {
        console.log("effectxx")
    }, [])

    ReactMini.useEffect(() => {
        console.log("effect", { count }, { count1 })
    }, [count, count1])
    return <div>
        <h2>
            ShowBar
        </h2>
        <p>{count}</p>
        <button onClick={() => {
            setCount((o) => {
                return o + 1;
            })
        }}>count</button>
        <p>{count1} </p>
        <button
            className='button'
            onClick={() => {
                setCount1(1234)
            }}>count1</button>
    </div>
}


function ShowFoo() {
    const [count, setCount] = ReactMini.useState(1);
    ReactMini.useEffect(() => {
        console.log("f00 effectxx");
        return (() => {
            console.log("清空副作用 no apply");
        })
    }, [])

    ReactMini.useEffect(() => {
        console.log("foo effect", { count });
        return (() => {
            console.log("清空副作用");
        })
    }, [count])
    return <div>
        {count === 3
            ? <div>count is{count}</div>
            : <div>count is{count}
                <div>第二个div</div>
            </div>
        }
        <button onClick={() => {
            setCount((o) => {
                return o + 1;
            })
        }}
            className='button'
        > foo count</button>
    </div>
}