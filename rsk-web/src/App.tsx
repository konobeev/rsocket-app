import React, {FunctionComponent, useCallback, useRef, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {useChat, Weather} from "./UseChat";
import {Subscription} from "rxjs";

let subscription = new Subscription();
const WeatherItem = (weather: Weather): React.ReactElement => {
    return (<li key={weather.id}>
        <span>{weather.id}</span>
        &nbsp;
        <span>{weather.timestamp}</span>
        &nbsp;
        <span>{weather.observation}</span>
    </li>);
}

function App() {
    const {sendMessage} = useChat();
    // const [weather, setWeather] = useState<Weather>();
    const [state, setState] = useState<Weather[]>([]);

    const onClick = useCallback(() => {

        subscription.unsubscribe();
        setState([]);
        subscription = sendMessage("from-ui").subscribe(value => {
            setState(prevState => ([value, ...prevState.slice(0, 10)]))
            // setWeather(value);
        })
    }, [setState]);

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>

                <div>
                    <form onSubmit={e => e.preventDefault()}>
                        <button onClick={onClick}>Send Message</button>
                    </form>
                </div>
                <div className={'parent'}>
                    <ul>
                        {state.map(w => WeatherItem(w))}
                    </ul>
                </div>
            </header>
        </div>
    );
}

export default App;
