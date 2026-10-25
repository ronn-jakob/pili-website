import { useEffect, useRef, useState } from 'react';
import {
  createDestination,
  isDestinationSlugTaken,
  updateDestination,
} from '../../../../lib/destinations';
import {
  getRegionForProvince,
  philippineRegions,
  regionForProvince,
} from '../../../../data/philippineLocations';
import { uploadDestinationImage } from '../../../../lib/cloudinary';
import styles from './AdminDestinationForm.module.css';

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function AdminDestinationForm({
  destination,
  nextSortOrder,
  onClose,
  onSaved,
}) {
  const editing = Boolean(destination);
  const nameRef = useRef(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: destination?.name ?? '',
    slug: destination?.slug ?? '',
    region: destination?.region ?? '',
    province: destination?.province ?? '',
    description: destination?.description ?? '',
    image: destination?.image ?? '',
    imagePublicId: destination?.imagePublicId ?? '',
    imageProvider:
      destination?.imageProvider ?? (destination?.image ? 'url' : ''),
    status: destination?.status ?? 'active',
    featured: destination?.featured ?? false,
    sortOrder: destination?.sortOrder ?? nextSortOrder,
  });
  const [slugEdited, setSlugEdited] = useState(editing);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    nameRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleNameChange = (value) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: editing || slugEdited ? current.slug : slugify(value),
    }));
  };

  const handleProvinceChange = (province) => {
    setForm((current) => ({
      ...current,
      province,
      region: getRegionForProvince(province),
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploaded = await uploadDestinationImage(file, setUploadProgress);
      setForm((current) => ({
        ...current,
        image: uploaded.url,
        imagePublicId: uploaded.publicId,
        imageProvider: 'cloudinary',
      }));
    } catch (uploadError) {
      setImageError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Could not upload that image.',
      );
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setForm((current) => ({
      ...current,
      image: '',
      imagePublicId: '',
      imageProvider: '',
    }));
    setImageError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUrlChange = (value) => {
    setForm((current) => ({
      ...current,
      image: value,
      imagePublicId: '',
      imageProvider: value.trim() ? 'url' : '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const name = form.name.trim();
    const slug = form.slug.trim();
    const province = form.province.trim();
    const region = getRegionForProvince(province) || form.region.trim();
    const sortOrder = Number(form.sortOrder);

    if (!name || !slug) {
      setError('Name and slug are required.');
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError('Slug may only contain lowercase letters, numbers and hyphens.');
      return;
    }

    if (!province || !region) {
      setError('Select a province. The region fills automatically.');
      return;
    }

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      setError('Sort order must be zero or greater.');
      return;
    }

    setSaving(true);

    try {
      if (await isDestinationSlugTaken(slug, destination?.id)) {
        setError('That slug is already used by another destination.');
        return;
      }

      const values = {
        ...form,
        name,
        slug,
        region,
        province,
        description: form.description.trim(),
        image: form.image.trim(),
        sortOrder,
      };

      if (editing) {
        await updateDestination(destination.id, values);
      } else {
        await createDestination(values);
      }

      onSaved();
    } catch (submitError) {
      setError(
        submitError?.code === 'permission-denied'
          ? 'You do not have permission to save destinations.'
          : 'Could not save this destination. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="destination-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Destination management</p>
            <h2 id="destination-form-title" className={styles.title}>
              {editing ? 'Edit destination' : 'New destination'}
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close destination form"
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.twoCols}>
            <label className={styles.field}>
              <span className={styles.label}>Destination name</span>
              <input
                ref={nameRef}
                className={styles.input}
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="e.g. Baguio"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Slug</span>
              <input
                className={styles.input}
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  updateField('slug', slugify(event.target.value));
                }}
                placeholder="e.g. baguio"
                readOnly={editing}
              />
              <span className={styles.helper}>
                {editing
                  ? 'The slug is fixed after creation.'
                  : 'Used in public destination links.'}
              </span>
            </label>
          </div>

          <div className={styles.twoCols}>
            <label className={styles.field}>
              <span className={styles.label}>Region</span>
              <input
                className={styles.input}
                value={form.region}
                placeholder="Auto-filled from province"
                readOnly
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Province</span>
              <select
                className={styles.input}
                value={form.province}
                onChange={(event) =>
                  handleProvinceChange(event.target.value)
                }
              >
                <option value="">Select province</option>
                {philippineRegions.map((region) => (
                  <optgroup key={region.name} label={region.name}>
                    {region.provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </optgroup>
                ))}
                {form.province && !regionForProvince[form.province] && (
                  <option value={form.province}>
                    {form.province} (current)
                  </option>
                )}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Description</span>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Describe what travelers can expect in this destination."
              rows="3"
            />
          </label>

          <div className={styles.imageField}>
            <span className={styles.label}>Destination image</span>
            <div className={styles.imageRow}>
              <div className={styles.imagePreview}>
                {form.image ? (
                  <img
                    src={form.image}
                    alt={`${form.name || 'Destination'} preview`}
                  />
                ) : (
                  <span>No image</span>
                )}
              </div>

              <div className={styles.imageControls}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={styles.fileInput}
                  onChange={handleImageUpload}
                  disabled={uploading}
                />

                <div className={styles.imageButtons}>
                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading
                      ? `Uploading ${uploadProgress}%`
                      : form.image
                        ? 'Replace image'
                        : 'Upload image'}
                  </button>
                  {form.image && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={handleRemoveImage}
                      disabled={uploading}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <p className={styles.imageHelper}>
                  JPG, PNG or WebP · max 5 MB · resized before upload
                </p>

                {uploading && (
                  <div
                    className={styles.progress}
                    role="progressbar"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={uploadProgress}
                  >
                    <span style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}

                {imageError && (
                  <p className={styles.imageError} role="alert">
                    {imageError}
                  </p>
                )}
              </div>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Or image URL</span>
              <input
                className={styles.input}
                value={form.image}
                onChange={(event) =>
                  handleImageUrlChange(event.target.value)
                }
                placeholder="https://…"
              />
            </label>
          </div>

          <div className={styles.threeCols}>
            <label className={styles.field}>
              <span className={styles.label}>Sort order</span>
              <input
                type="number"
                min="0"
                className={styles.input}
                value={form.sortOrder}
                onChange={(event) => updateField('sortOrder', event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Status</span>
              <select
                className={styles.input}
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  updateField('featured', event.target.checked)
                }
              />
              <span>Featured destination</span>
            </label>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.save} disabled={saving}>
              {saving ? 'Saving…' : 'Save destination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDestinationForm;
