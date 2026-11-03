import styles from './SettingsPhotoRow.module.css';

function SettingsPhotoRow({
  photo,
  initials,
  fileInputRef,
  onFileChange,
  onUploadClick,
  onRemove,
  error,
  uploading = false,
  progress = 0,
}) {
  return (
    <div className={styles.row}>
      <div className={styles.avatar}>
        {photo ? (
          <img src={photo} alt="" className={styles.avatarImage} />
        ) : (
          initials
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.title}>Profile photo</p>
        <p className={styles.description}>
          This shows on your bookings and reviews. JPG, PNG or WebP, up to 5 MB.
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
          onChange={onFileChange}
          tabIndex={-1}
          disabled={uploading}
        />
        <button
          type="button"
          className={styles.upload}
          onClick={onUploadClick}
          disabled={uploading}
        >
          {uploading ? `Uploading ${progress}%` : 'Upload'}
        </button>
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          disabled={!photo || uploading}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default SettingsPhotoRow;
