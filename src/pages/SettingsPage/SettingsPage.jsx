import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SettingsActions from '../../components/sections/settings/SettingsActions/SettingsActions';
import SettingsOperatorApplication from '../../components/sections/settings/SettingsOperatorApplication/SettingsOperatorApplication';
import SettingsPhotoRow from '../../components/sections/settings/SettingsPhotoRow/SettingsPhotoRow';
import SettingsProfileForm from '../../components/sections/settings/SettingsProfileForm/SettingsProfileForm';
import SettingsSecurity from '../../components/sections/settings/SettingsSecurity/SettingsSecurity';
import SettingsSidebar from '../../components/sections/settings/SettingsSidebar/SettingsSidebar';
import useTravelerAuth from '../../context/useTravelerAuth';
import { bookings } from '../../data/bookings';
import { profileNav } from '../../data/profile';
import { uploadAvatarImage } from '../../lib/cloudinary';
import { travelerToForm, updateTravelerProfile } from '../../lib/travelerProfile';
import styles from './SettingsPage.module.css';

function SettingsPage() {
  const { traveler } = useTravelerAuth();
  const [savedProfile, setSavedProfile] = useState(() =>
    travelerToForm(traveler ?? {}),
  );
  const [draft, setDraft] = useState(() => travelerToForm(traveler ?? {}));
  const [activeSection, setActiveSection] = useState('personal-info');
  const [status, setStatus] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoProgress, setPhotoProgress] = useState(0);
  const fileInputRef = useRef(null);

  const initials =
    `${savedProfile.firstName.trim().charAt(0)}${savedProfile.lastName
      .trim()
      .charAt(0)}`.toUpperCase() || 'PT';

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
    setSaveError('');
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

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a JPG, PNG or WebP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    setPhotoError('');
    setStatus('');
    setSaveError('');
    setPhotoUploading(true);
    setPhotoProgress(0);

    try {
      const result = await uploadAvatarImage(file, setPhotoProgress);
      setDraft((current) => ({ ...current, photo: result.url }));
    } catch (uploadError) {
      setPhotoError(
        uploadError?.message || 'Could not upload that image.',
      );
    } finally {
      setPhotoUploading(false);
      setPhotoProgress(0);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setDraft((current) => ({ ...current, photo: null }));
    setPhotoError('');
    setStatus('');
    setSaveError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!traveler || saving) {
      return;
    }

    setSaving(true);
    setStatus('');
    setSaveError('');

    try {
      await updateTravelerProfile(traveler.uid, draft, traveler);
      setSavedProfile(draft);
      setStatus('Changes saved.');
    } catch {
      setSaveError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(savedProfile);
    setStatus('');
    setSaveError('');
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

          <div className={styles.mainColumn}>
            <form className={styles.card} onSubmit={handleSave} noValidate>
              <SettingsPhotoRow
                photo={draft.photo}
                initials={initials}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                onUploadClick={handleUpload}
                onRemove={handleRemovePhoto}
                error={photoError}
                uploading={photoUploading}
                progress={photoProgress}
              />

              <SettingsProfileForm draft={draft} onChange={handleChange} />
              <SettingsSecurity />
              <SettingsActions
                onCancel={handleCancel}
                status={status}
                error={saveError}
                saving={saving}
              />
            </form>

            <SettingsOperatorApplication />
          </div>
        </div>
      </div>
    </main>
  );
}

export default SettingsPage;
