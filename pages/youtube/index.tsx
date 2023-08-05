import React, {useEffect, useState} from 'react';
import {Form} from 'react-final-form';
import {Response} from "../api/youtube/get_channel_id";
import axios from "axios";
import Author from '../../components/Author';

const Home = () => {
    const [url, setUrl] = useState('');
    const [message, setMessage] = useState(<p className='message'></p>);
    const [result, setResult] = useState('');

    const destroyMessage = () => {
        setMessage(<p className='message'></p>);
    };

    const createLink = async () => {
        destroyMessage();
        const res = await axios.post<Response>('/api/youtube/get_channel_id', {url});
        const response = res.data;

        if (!response.ok) {
            console.log(response);
            setMessage(<p className='message failed'>
                <span className="material-symbols-outlined">&#xe000;</span>
                {response.error}
            </p>);
            setTimeout(() => destroyMessage(), 5000);
            return;
        }

        const result = `${window.location.origin}/api/youtube/redirect/${response.id}`;
        setResult(result);
        await navigator.clipboard.writeText(result);
        setMessage(<p className='message'>
            <span className="material-symbols-outlined">&#xe86c;</span>
            コピーしました！
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
        <Author />
    </div>);
};

export default Home;
