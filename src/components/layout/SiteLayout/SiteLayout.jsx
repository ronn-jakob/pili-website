import { Outlet } from 'react-router-dom';
import Header from '../../sections/shared/Header/Header';
import Footer from '../../sections/shared/Footer/Footer';

function SiteLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default SiteLayout;
