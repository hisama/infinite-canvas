import styles from "./style.module.css";

export function Frame() {
  return (
    <header className={`frame ${styles.frame}`}>
      <h1 className={styles.frame__title}>Marco Cascella</h1>
      <a className={styles.frame__back} href="https://tympanus.net/codrops/?p=106679">
        Home
      </a>
      <a className={styles.frame__archive} href="https://tympanus.net/codrops/hub/">
        Bio
      </a>
      <a className={styles.frame__github} href="https://github.com/edoardolunardi/infinite-canvas">
        Contacts
      </a>
      <div className={styles.frame__credits}>
        <span></span>
        <a href="#"></a>
      </div>
      <nav className={styles.frame__tags}>
      </nav>
    </header>
  );
}
