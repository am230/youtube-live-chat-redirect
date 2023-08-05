import React from 'react';
import Card from '../components/Card';
import Author from '../components/Author';
import ShaderToy from '../components/ShaderToy';
import DitherFilter from '../components/DitherFilter';
import styles from './index.module.css';


const Home = () => {
    return <>
        <DitherFilter>
            <div className={styles.main}>
                <div className={styles.cardleft}>
                    <Card title='ライブのリアクション表示するやつ' description='ライブのリアクションを重ねて表示するためのやつです。' href='/chat' />
                    <Card title='ライブのリアクション表示するやつ' description='ライブのリアクションを重ねて表示するためのやつです。' href='/chat' />
                </div>
                <Author />
            </div>
        </DitherFilter>
        <div className={styles.overlay}>
            <ShaderToy />
        </div>
    </>;
};

export default Home;
