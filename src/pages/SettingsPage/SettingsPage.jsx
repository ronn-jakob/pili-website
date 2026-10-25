import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SettingsActions from '../../components/sections/settings/SettingsActions/SettingsActions';
import SettingsPhotoRow from '../../components/sections/settings/SettingsPhotoRow/SettingsPhotoRow';
import SettingsProfileForm from '../../components/sections/settings/SettingsProfileForm/SettingsProfileForm';
import SettingsSecurity from '../../components/sections/settings/SettingsSecurity/SettingsSecurity';
import SettingsSidebar from '../../components/sections/settings/SettingsSidebar/SettingsSidebar';
import { bookings } from '../../data/bookings';
import { profile, profileNav } from '../../data/profile';
import styles from './SettingsPage.module.css';

function SettingsPage() {
  const [savedProfile, setSavedProfile] = useState(profile);
  const [draft, setDraft] = useState(profile);
  const [activeSection, setActiveSection] = useState('personal-info');
  const [status, setStatus] = useState('');
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  const initials =
    `${savedProfile.firstName.trim().charAt(0)}${savedProfile.lastName
      .trim()
      .charAt(0)}`.toUpperCase() || 'MR';

  const stats = useMemo(
    () => [
      { label: 'Trips booked', value: bookings.length },
      { label: 'Wishlist', value: 7 },
    ],
    [],
  );

  const handleChange = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setStatus('');
  };

  const handleNavigate = (item) => {
    setActiveSection(item.id);
    document
      .getElementById(item.id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoError('Choose a JPG or PNG image.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({ ...current, photo: reader.result }));
      setPhotoError('');
      setStatus('');
    };
    reader.onerror = () => setPhotoError('Could not read that image.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemovePhoto = () => {
    setDraft((current) => ({ ...current, photo: null }));
    setPhotoError('');
    setStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSavedProfile(draft);
    setStatus('Changes saved.');
  };

  const handleCancel = () => {
    setDraft(savedProfile);
    setStatus('');
    setPhotoError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span>Account</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Profile</span>
        </nav>

        <h1 className={styles.title}>My Profile</h1>

        <div className={styles.layout}>
          <SettingsSidebar
            profile={savedProfile}
            photo={draft.photo}
            initials={initials}
            nav={profileNav}
            activeSection={activeSection}
            onNavigate={handleNavigate}
            stats={stats}
          />

          <form className={styles.card} onSubmit={handleSave} noValidate>
            <SettingsPhotoRow
              photo={draft.photo}
              initials={initials}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
              onUploadClick={handleUpload}
              onRemove={handleRemovePhoto}
              error={photoError}
            />

            <SettingsProfileForm draft={draft} onChange={handleChange} />
            <SettingsSecurity />
            <SettingsActions onCancel={handleCancel} status={status} />
          </form>
        </div>
      </div>
    </main>
  );
}

export default SettingsPage;
