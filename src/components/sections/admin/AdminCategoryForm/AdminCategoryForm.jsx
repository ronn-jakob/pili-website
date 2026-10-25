import { useEffect, useRef, useState } from 'react';
import { categoryIdFromName } from '../../../../data/categories';
import {
  createCategory,
  isCategorySlugTaken,
  updateCategory,
} from '../../../../lib/categories';
import styles from './AdminCategoryForm.module.css';

function AdminCategoryForm({ category, nextSortOrder, onClose, onSaved }) {
  const editing = Boolean(category);
  const nameRef = useRef(null);
  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    status: category?.status ?? 'active',
    sortOrder: category?.sortOrder ?? nextSortOrder,
  });
  const [slugEdited, setSlugEdited] = useState(editing);
  const [error, setError] = useState('');
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
      slug: editing || slugEdited ? current.slug : categoryIdFromName(value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const name = form.name.trim();
    const slug = form.slug.trim();
    const sortOrder = Number(form.sortOrder);

    if (!name) {
      setError('Enter a category name.');
      return;
    }

    if (!slug) {
      setError('Enter a category slug.');
      return;
    }

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      setError('Sort order must be zero or greater.');
      return;
    }

    setSaving(true);

    try {
      if (await isCategorySlugTaken(slug, category?.id)) {
        setError('That slug is already used by another category.');
        return;
      }

      const values = {
        name,
        slug,
        status: form.status,
        sortOrder,
      };

      if (editing) {
        await updateCategory(category.id, values);
      } else {
        await createCategory(values);
      }

      onSaved();
    } catch {
      setError('Could not save this category. Please try again.');
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
        aria-labelledby="category-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Category management</p>
            <h2 id="category-form-title" className={styles.title}>
              {editing ? 'Edit category' : 'New category'}
            </h2>
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close category form"
            disabled={saving}
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>Category name</span>
            <input
              ref={nameRef}
              className={styles.input}
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="e.g. Beaches & Islands"
              required
            />
          </label>

          <div className={styles.twoCols}>
            <label className={styles.field}>
              <span className={styles.label}>Slug</span>
              <input
                className={styles.input}
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  updateField('slug', categoryIdFromName(event.target.value));
                }}
                placeholder="beaches-islands"
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>Sort order</span>
              <input
                type="number"
                min="0"
                className={styles.input}
                value={form.sortOrder}
                onChange={(event) =>
                  updateField('sortOrder', event.target.value)
                }
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Status</span>
            <select
              className={`${styles.input} ${styles.select}`}
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

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
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminCategoryForm;
