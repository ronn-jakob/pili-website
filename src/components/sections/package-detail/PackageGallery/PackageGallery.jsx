import styles from './PackageGallery.module.css';

function PackageGallery({ pkg }) {
  const [first, second, ...rest] = pkg.gallery;

  return (
    <section className={styles.section} aria-labelledby="what-to-expect-title">
      <div className={styles.inner}>
        <h2 id="what-to-expect-title" className={styles.heading}>
          What to Expect?
        </h2>

        <div className={styles.gallery}>
          <div className={styles.top}>
            <img src={first} alt="" className={styles.large} />
            <img src={second} alt="" className={styles.smallLarge} />
          </div>
          <div className={styles.bottom}>
            {rest.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt=""
                className={styles.tile}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PackageGallery;
