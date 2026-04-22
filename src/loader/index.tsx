import * as React from "react";
import styles from "./style.module.css";

export function PageLoader({ progress }: { progress: number }) {
  const [show, setShow] = React.useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = React.useState(false);
  const visualRef = React.useRef(0);
  const [visualProgress, setVisualProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    let raf: number;

    const animate = () => {
      const diff = progress - visualRef.current;

      if (diff > 0.1) {
        visualRef.current += diff * 0.08;
        setVisualProgress(visualRef.current);
        raf = requestAnimationFrame(animate);
      } else {
        visualRef.current = progress;
        setVisualProgress(progress);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  React.useEffect(() => {
    if (minTimeElapsed && progress === 100 && visualProgress >= 99.5) {
      const t = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(t);
    }
  }, [minTimeElapsed, progress, visualProgress]);

  if (!show) return null;

  const isHidden = minTimeElapsed && progress === 100 && visualProgress >= 99.5;

  return (
    <div className={`${styles.overlay} ${isHidden ? styles.hidden : styles.visible}`}>
      <div className={styles.content}>
        <h1 className={styles.title}>Marco Cascella</h1>
        <p className={styles.subtitle}>Gallery</p>

        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBarFill}
            style={{ transform: `scaleX(${visualProgress / 100})` }}
          />
        </div>

        <div className={styles.instructions}>
          <div className={styles.instructionRow}>
            <span className={styles.key}>drag</span>
            <span className={styles.action}>pan</span>
          </div>
          <div className={styles.instructionRow}>
            <span className={styles.key}>scroll</span>
            <span className={styles.action}>zoom</span>
          </div>
          <div className={styles.instructionRow}>
            <span className={styles.key}>click</span>
            <span className={styles.action}>view artwork</span>
          </div>
        </div>
      </div>
    </div>
  );
}
