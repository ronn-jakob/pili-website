import { operatorKpis } from '../../../../data/operatorDashboard';
import styles from './OperatorKpis.module.css';

function OperatorKpis({ kpis = operatorKpis }) {
  return (
    <section className={styles.grid} aria-label="Operator statistics">
      {kpis.map((kpi) => (
        <article key={kpi.id} className={`${styles.card} ${styles[kpi.tone]}`}>
          <p className={styles.label}>{kpi.label}</p>
          <p className={styles.value}>{kpi.value}</p>
          <p className={styles.delta}>{kpi.delta}</p>
        </article>
      ))}
    </section>
  );
}

export default OperatorKpis;
