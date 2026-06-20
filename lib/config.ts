import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ---- Types ----
export type SurveyConfig = {
  title: string;
  subtitle: string;
  welcomeTitle: string;
  welcomeText: string;
  times: string[];        // ordered list of time-slot labels
  days: string[];         // ordered list of active day names
  open: boolean;          // whether the survey accepts responses
};

export const DEFAULT_CONFIG: SurveyConfig = {
  title: 'Practice Schedule Survey',
  subtitle: 'Help us find the best times for team practice this summer',
  welcomeTitle: 'Welcome',
  welcomeText: "Let's get your name first, then we'll find the best practice times for you.",
  times: ['7:00 AM', '10:00 AM', '2:00 PM', '5:00 PM', '7:00 PM'],
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  open: true,
};

const CONFIG_REF = () => doc(db, 'config', 'survey');

// Read the survey config, falling back to defaults if none saved yet.
export async function getSurveyConfig(): Promise<SurveyConfig> {
  try {
    const snap = await getDoc(CONFIG_REF());
    if (!snap.exists()) return DEFAULT_CONFIG;
    const data = snap.data() as Partial<SurveyConfig>;
    // Merge so any missing field gets a sensible default.
    return { ...DEFAULT_CONFIG, ...data };
  } catch {
    return DEFAULT_CONFIG;
  }
}

// Save the survey config (admin only, enforced by Firestore rules).
export async function saveSurveyConfig(config: SurveyConfig): Promise<void> {
  await setDoc(CONFIG_REF(), config, { merge: true });
}

// Check whether a given uid is an approved admin.
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'admins', uid));
    return snap.exists();
  } catch {
    return false;
  }
}
