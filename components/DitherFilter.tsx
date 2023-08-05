import styles from './DitherFilter.module.css';

const DitherFilter = ({ children }) => {
    return <>
        <div className={styles.dither}>
            <div className={styles.source}>
                {children}
            </div>
            <div className={`${styles.add} ${styles.bayer}`}></div>
        </div>
        <svg className={styles.filter}>
            <filter id="discrete" colorInterpolationFilters="sRGB">
                <feComponentTransfer>
                    <feFuncR type="discrete" tableValues="0 1"></feFuncR>
                    <feFuncG type="discrete" tableValues="0 1"></feFuncG>
                    <feFuncB type="discrete" tableValues="0 1"></feFuncB>
                </feComponentTransfer>
            </filter>
            <filter id="gamma" colorInterpolationFilters="sRGB">
                <feComponentTransfer>
                    <feFuncR type="gamma" exponent="1.6"></feFuncR>
                    <feFuncG type="gamma" exponent="1.6"></feFuncG>
                    <feFuncB type="gamma" exponent="1.6"></feFuncB>
                </feComponentTransfer>
            </filter>
        </svg>
    </>;
}

export default DitherFilter;