import React, { useState } from 'react';
import { Form } from 'react-final-form';
import { Response } from "./api/channel_id";
import axios from "axios";

const Home = () => {
    const [url, setUrl] = useState('');
    const [message, setMessage] = useState(<p className='message'></p>);
    const [result, setResult] = useState('');

    const destroyMessage = () => {
        setMessage(<p className='message'></p>);
    };

    const createLink = async () => {
        const res = await axios.post<Response>('/api/channel_id', { url });
        const response = res.data;
        destroyMessage();

        if (!response.ok) {
            console.log(response);
            setMessage(
                <p className='message failed'>
                    <span className="material-symbols-outlined">&#xe000;</span>
                    {response.error}
                </p>
            );
            setTimeout(() => destroyMessage(), 5000);
            return;
        }

        const result = `${window.location.origin}/api/redirect/${response.id}`;
        setResult(result);
        await navigator.clipboard.writeText(result);
        setMessage(
            <p className='message'>
                <span className="material-symbols-outlined">&#xe86c;</span>
                Copied!
            </p>
        );
        setTimeout(() => destroyMessage(), 5000);
    };

    return (
        <div className='main'>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
            <Form
                onSubmit={createLink}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder='url...'
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button onClick={handleSubmit}>Create & Copy</button>
                    </form>
                )}
            />
            {message}
        </div>
    );
};

export default Home;
