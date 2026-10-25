import styles from './WhyChoose.module.css';
import Container from '../../../ui/Container/Container';
import discoverImage from '../../../../Images/why-choose-discover.jpg';
import simpleImage from '../../../../Images/why-choose-simple.jpg';
import supportImage from '../../../../Images/why-choose-support.jpg';

const breathtaking = (
  <>
    From breathtaking beaches and majestic mountains
    <br className={styles.desktopBreak} />
    to vibrant cities and hidden gems, Pili helps you explore the beauty and
    diversity of the Philippines, one destination at a time.
  </>
);

const values = [
  {
    id: 'discover',
    variant: 'discover',
    image: discoverImage,
    label: 'Why Choose Pili?',
    before: '',
    accent: 'Discover',
    after: ' the Beauty of the Philippines',
    body: breathtaking,
  },
  {
    id: 'simple',
    variant: 'simple',
    image: simpleImage,
    label: '',
    before: 'Travel Made ',
    accent: 'Simple',
    after: '',
    body: 'Find your next adventure with ease. Explore tour packages, discover exciting destinations, and book your Philippine getaway all in one convenient place.',
  },
  {
    id: 'support',
    variant: 'support',
    image: supportImage,
    label: '',
    before: '',
    accent: 'Support',
    after: ' Local, Experience More',
    body: breathtaking,
  },
];

function WhyChoose() {
  return (
    <section
      id="why-choose"
      className={styles.section}
      aria-labelledby="why-choose-title"
    >
      {values.map((value) => (
        <article
          key={value.id}
          className={`${styles.row} ${styles[value.variant]}`}
        >
          <div className={styles.band} aria-hidden="true">
            <img className={styles.image} src={value.image} alt="" />
            <div className={styles.scrim} />
          </div>

          <Container size="wide" className={styles.content}>
            <div className={styles.text}>
              {value.label ? (
                <h2 id="why-choose-title" className={styles.eyebrow}>
                  {value.label}
                </h2>
              ) : null}

              <h3 className={styles.title}>
                {value.before}
                <span className={styles.accent}>{value.accent}</span>
                {value.after}
              </h3>

              <p className={styles.body}>{value.body}</p>
            </div>
          </Container>
        </article>
      ))}
    </section>
  );
}

export default WhyChoose;
