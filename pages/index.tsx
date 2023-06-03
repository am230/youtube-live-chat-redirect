import axios from 'axios';
import React from 'react';
import {Form} from 'react-final-form';



const Home = () => {
    const [url, setUrl] = React.useState('');

    const [message, setMessage] = React.useState('');
    const [result, setResult] = React.useState('');

    const createLink = async () => {
        const response = await axios.post<string>('/api/channel_id', {url});
        const channelId = response.data
        const result = `${window.location.origin}/api/redirect/${channelId}`
        setResult(result)
        await navigator.clipboard.writeText(result);
        setMessage('Copied!');
        setTimeout(setMessage, 5000)
    }

    return (
        <div className='main'>
            <Form
                onSubmit={createLink}
                render={({handleSubmit}) => (
                    <form onSubmit={handleSubmit}>
                        <input type="text" placeholder='url...' value={url} onChange={(e) => setUrl(e.target.value)}/>
                        <button onClick={handleSubmit}>Create & Copy</button>
                    </form>
                )}
            />
            <p className='message'>{message}</p>
        </div>
    )
}

export default Home
