import styles from './StorySection.module.css';
import banaueImage from '../../../../Images/destinations/banaue.png';

function StorySection() {
  return (
    <section className={styles.section} aria-labelledby="story-title">
      <div className={styles.imageWrap} aria-hidden="true">
        <img src={banaueImage} alt="" className={styles.image} />
      </div>

      <div className={styles.card}>
        <p className={styles.eyebrow}>Beyond the postcard</p>

        <h2
          id="story-title"
          className={styles.title}
          aria-label="Discover the beauty of the Philippines."
        >
          Discover the <span className={styles.accent}>beauty</span>
          <br />
          of the Philippines.
        </h2>

        <p className={styles.body}>
          Take the mountain road. Stay for one more morning. Our local guides
          know the small details that turn a beautiful view into a story you
          will keep.
        </p>

        <a href="/destinations/local-way" className={styles.cta}>
          Meet the local way →
        </a>
      </div>
    </section>
  );
}

export default StorySection;
