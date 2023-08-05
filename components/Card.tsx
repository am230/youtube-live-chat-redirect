import styles from './Card.module.css'

const Card = ({ title, description, href }) => {
    return <div className={styles.card}>
        <h2>{title}</h2>
        <p>{description}</p>
        <a href={href}>詳しく見る</a>
    </div>;
}

export default Card;