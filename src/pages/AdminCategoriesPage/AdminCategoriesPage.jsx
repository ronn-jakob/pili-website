import { useEffect, useMemo, useState } from 'react';
import AdminCategoryForm from '../../components/sections/admin/AdminCategoryForm/AdminCategoryForm';
import {
  getCategories,
  setCategoryStatus,
} from '../../lib/categories';
import styles from './AdminCategoriesPage.module.css';

const statusFilters = ['All', 'Active', 'Inactive'];

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [updatingId, setUpdatingId] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    setError('');

    try {
      setCategories(await getCategories());
    } catch {
      setError('Could not load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getCategories()
      .then((items) => {
        if (active) {
          setCategories(items);
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not load categories. Please try again.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleCategories = useMemo(() => {
    const search = query.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesFilter =
        activeFilter === 'All'
          ? true
          : category.status === activeFilter.toLowerCase();
      const matchesQuery =
        !search ||
        category.name.toLowerCase().includes(search) ||
        category.slug.toLowerCase().includes(search);

      return matchesFilter && matchesQuery;
    });
  }, [categories, query, activeFilter]);

  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    loadCategories();
  };

  const handleToggleStatus = async (category) => {
    const nextStatus =
      category.status === 'active' ? 'inactive' : 'active';
    setUpdatingId(category.id);

    try {
      await setCategoryStatus(category.id, nextStatus);
      setCategories((current) =>
        current.map((item) =>
          item.id === category.id ? { ...item, status: nextStatus } : item,
        ),
      );
    } catch {
      setError('Could not update this category status.');
    } finally {
      setUpdatingId('');
    }
  };

  const nextSortOrder =
    categories.reduce(
      (highest, category) => Math.max(highest, category.sortOrder),
      0,
    ) + 1;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <span>Admin</span>
            <span aria-hidden="true">/</span>
            <span>Categories</span>
          </p>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>
            Manage the categories operators can choose when creating tours.
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + New category
        </button>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className={styles.visuallyHidden}>Search categories</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16.2 16.2 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search categories…"
          />
        </label>

        <div className={styles.filters} role="group" aria-label="Filter categories">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`${styles.filter}${
                activeFilter === filter ? ` ${styles.filterActive}` : ''
              }`}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <section className={styles.tableCard} aria-labelledby="categories-table-title">
        <div className={styles.tableHeader}>
          <div>
            <h2 id="categories-table-title" className={styles.tableTitle}>
              All categories
            </h2>
            <p className={styles.tableSubtitle}>
              {visibleCategories.length} of {categories.length} categories
            </p>
          </div>
          <button
            type="button"
            className={styles.refresh}
            onClick={loadCategories}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Slug</th>
                <th scope="col">Order</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className={styles.loading}>
                    Loading categories…
                  </td>
                </tr>
              )}

              {!loading &&
                visibleCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <span className={styles.name}>{category.name}</span>
                    </td>
                    <td className={styles.slug}>{category.slug}</td>
                    <td>{category.sortOrder}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          category.status === 'active'
                            ? styles.active
                            : styles.inactive
                        }`}
                      >
                        {category.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.edit}
                          onClick={() => {
                            setEditing(category);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.toggle}
                          onClick={() => handleToggleStatus(category)}
                          disabled={updatingId === category.id}
                        >
                          {updatingId === category.id
                            ? 'Updating…'
                            : category.status === 'active'
                              ? 'Deactivate'
                              : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && visibleCategories.length === 0 && (
                <tr>
                  <td colSpan="5" className={styles.empty}>
                    No categories match this search or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <AdminCategoryForm
          key={editing?.id ?? 'new'}
          category={editing}
          nextSortOrder={nextSortOrder}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default AdminCategoriesPage;
