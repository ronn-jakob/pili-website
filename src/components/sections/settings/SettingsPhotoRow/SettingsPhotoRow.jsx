import styles from './SettingsPhotoRow.module.css';

function SettingsPhotoRow({
  photo,
  initials,
  fileInputRef,
  onFileChange,
  onUploadClick,
  onRemove,
  error,
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
          This shows on your bookings and reviews. JPG or PNG, up to 5 MB.
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
          accept="image/jpeg,image/png"
          className={styles.fileInput}
          onChange={onFileChange}
          tabIndex={-1}
        />
        <button type="button" className={styles.upload} onClick={onUploadClick}>
          Upload
        </button>
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          disabled={!photo}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default SettingsPhotoRow;
