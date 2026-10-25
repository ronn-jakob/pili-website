import styles from './SettingsSidebar.module.css';

function SettingsSidebar({
  profile,
  photo,
  initials,
  nav,
  activeSection,
  onNavigate,
  stats,
}) {
  return (
    <aside className={styles.column}>
      <div className={styles.card}>
        <div className={styles.identity}>
          <div className={styles.avatar}>
            {photo ? (
              <img src={photo} alt="" className={styles.avatarImage} />
            ) : (
              initials
            )}
          </div>
          <h2 className={styles.name}>
            {profile.firstName} {profile.lastName}
          </h2>
          <p className={styles.email}>{profile.email}</p>
          <span className={styles.verified}>Verified</span>
        </div>

        <nav className={styles.nav} aria-label="Profile sections">
          {nav.map((item) =>
            item.available ? (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem}${
                  activeSection === item.id ? ` ${styles.navItemActive}` : ''
                }`}
                aria-current={
                  activeSection === item.id ? 'location' : undefined
                }
                onClick={() => onNavigate(item)}
              >
                {item.label}
              </button>
            ) : (
              <span
                key={item.id}
                className={styles.navItemDisabled}
                aria-disabled="true"
              >
                {item.label}
              </span>
            ),
          )}
        </nav>
      </div>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statValue}>{stat.value}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default SettingsSidebar;
