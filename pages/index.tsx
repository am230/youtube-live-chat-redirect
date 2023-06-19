import React, {useEffect, useState} from 'react';
import {Form} from 'react-final-form';
import {Response} from "./api/channel_id";
import axios from "axios";

const Home = () => {
    const [url, setUrl] = useState('');
    const [message, setMessage] = useState(<p className='message'></p>);
    const [result, setResult] = useState('');

    const destroyMessage = () => {
        setMessage(<p className='message'></p>);
    };

    const createLink = async () => {
        const res = await axios.post<Response>('/api/channel_id', {url});
        const response = res.data;
        destroyMessage();

        if (!response.ok) {
            console.log(response);
            setMessage(<p className='message failed'>
                <span className="material-symbols-outlined">&#xe000;</span>
                {response.error}
            </p>);
            setTimeout(() => destroyMessage(), 5000);
            return;
        }

        const result = `${window.location.origin}/api/redirect/${response.id}`;
        setResult(result);
        await navigator.clipboard.writeText(result);
        setMessage(<p className='message'>
            <span className="material-symbols-outlined">&#xe86c;</span>
            Copied!
        </p>);
        setTimeout(() => destroyMessage(), 5000);
    };
    const [tip, setTip] = useState<JSX.Element>()
    useEffect(() => {
        setTip(<>
            <div className="tip">
                <h4>
                    {window.location.origin}/api/redirect/... の後に@のidを付けても動きます（一応）
                </h4>
                <h5>
                    例：{window.location.origin}/api/redirect/@am2.30
                </h5>
            </div>
        </>)
    }, [])
    return (<div className='main'>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
        <Form
            onSubmit={createLink}
            render={({handleSubmit}) => (<form onSubmit={handleSubmit}>
                1.
                <input
                    type="text"
                    placeholder='@id...'
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                2.
                <button onClick={handleSubmit}>作ってコピー</button>
            </form>)}
        />
        {message}
        {tip}
        <div className="bottom">
            <a href="https://github.com/am230/youtube-live-chat-redirect">YTChat Redirect</a>
            by <a href="https://twitter.com/AM4_02">二時半</a>
        </div>
    </div>);
};

export default Home;
