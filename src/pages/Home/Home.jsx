import Hero from '../../components/sections/home/Hero/Hero';
import Destinations from '../../components/sections/home/Destinations/Destinations';
import PopularPlaces from '../../components/sections/home/PopularPlaces/PopularPlaces';
import WhyChoose from '../../components/sections/home/WhyChoose/WhyChoose';

function Home() {
  return (
    <main>
      <Hero />
      <Destinations />
      <PopularPlaces />
      <WhyChoose />
    </main>
  );
}

export default Home;
