import Link from "next/link";
import styles from "./home.module.css";
import { WORKFLOWS } from "@/lib/workflows";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Rover Workflows</h1>
      <p className={styles.subtitle}>
        Pick a workflow to open its dedicated route and form.
      </p>

      <div className={styles.grid}>
        {WORKFLOWS.map((workflow) => (
          <Link key={workflow.id} href={workflow.path} className={styles.card}>
            <p className={styles.cardTitle}>{workflow.label}</p>
            <p className={styles.cardText}>{workflow.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
