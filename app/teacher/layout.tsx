import { requirePageAccount } from "@/lib/classroom/auth";
import { ClassroomNav } from "@/app/_components/classroom-ui";
import styles from "./teacher-theme.module.css";
export default async function TeacherLayout({ children }: { children: React.ReactNode }) { await requirePageAccount("teacher"); return <div className={styles.teacherArea}><ClassroomNav teacher />{children}</div>; }
