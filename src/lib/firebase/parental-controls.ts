import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import {
  ChildProfile,
  ContentPolicy,
  ScreenTimeRules,
  ActivityReport,
  ParentalControls,
} from "@/types";

// Parental Controls Management
export async function createParentalControls(
  db: any,
  parentId: string,
  familyId: string
): Promise<string> {
  const controlsRef = doc(collection(db, "parentalControls"));
  const controls: ParentalControls = {
    id: controlsRef.id,
    parentId,
    familyId,
    children: [],
    enabled: true,
    notificationsEnabled: true,
    weeklyReportsEnabled: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(controlsRef, controls);
  return controlsRef.id;
}

export async function getParentalControls(
  db: any,
  parentId: string
): Promise<ParentalControls | null> {
  const q = query(
    collection(db, "parentalControls"),
    where("parentId", "==", parentId),
    limit(1)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as ParentalControls;
}

export async function updateParentalControls(
  db: any,
  controlsId: string,
  updates: Partial<ParentalControls>
): Promise<void> {
  const controlsRef = doc(db, "parentalControls", controlsId);
  await updateDoc(controlsRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

// Child Profile Management
export async function addChildProfile(
  db: any,
  parentId: string,
  childData: Omit<ChildProfile, "id" | "createdAt">
): Promise<string> {
  const childRef = doc(collection(db, "childProfiles"));
  const child: ChildProfile = {
    ...childData,
    id: childRef.id,
    parentId,
    createdAt: Timestamp.now(),
  };

  await setDoc(childRef, child);

  // Update parental controls with new child
  const controls = await getParentalControls(db, parentId);
  if (controls) {
    await updateDoc(doc(db, "parentalControls", controls.id), {
      children: [...controls.children, child],
      updatedAt: Timestamp.now(),
    });
  }

  return childRef.id;
}

export async function getChildProfiles(db: any, parentId: string): Promise<ChildProfile[]> {
  const q = query(
    collection(db, "childProfiles"),
    where("parentId", "==", parentId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ChildProfile);
}

export async function getChildProfile(db: any, childId: string): Promise<ChildProfile | null> {
  const docRef = doc(db, "childProfiles", childId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as ChildProfile) : null;
}

export async function updateChildProfile(
  db: any,
  childId: string,
  updates: Partial<ChildProfile>
): Promise<void> {
  const childRef = doc(db, "childProfiles", childId);
  await updateDoc(childRef, updates);
}

// Content Policy Management
export async function saveContentPolicy(
  db: any,
  childId: string,
  policy: Omit<ContentPolicy, "childId" | "updatedAt">
): Promise<void> {
  const policyRef = doc(db, "contentPolicies", childId);
  await setDoc(policyRef, {
    ...policy,
    childId,
    updatedAt: Timestamp.now(),
  });
}

export async function getContentPolicy(
  db: any,
  childId: string
): Promise<ContentPolicy | null> {
  const docRef = doc(db, "contentPolicies", childId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as ContentPolicy) : null;
}

// Screen Time Rules Management
export async function saveScreenTimeRules(
  db: any,
  childId: string,
  rules: Omit<ScreenTimeRules, "childId" | "updatedAt">
): Promise<void> {
  const rulesRef = doc(db, "screenTimeRules", childId);
  await setDoc(rulesRef, {
    ...rules,
    childId,
    updatedAt: Timestamp.now(),
  });
}

export async function getScreenTimeRules(
  db: any,
  childId: string
): Promise<ScreenTimeRules | null> {
  const docRef = doc(db, "screenTimeRules", childId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as ScreenTimeRules) : null;
}

// Activity Tracking
export async function logActivity(
  db: any,
  childId: string,
  activityData: {
    type: "content_view" | "interaction" | "achievement" | "alert";
    data: any;
  }
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reportId = `${childId}_${today.getTime()}`;

  const reportRef = doc(db, "activityReports", reportId);
  const existingReport = await getDoc(reportRef);

  if (existingReport.exists()) {
    const report = existingReport.data() as ActivityReport;
    const updates: Partial<ActivityReport> = {};

    switch (activityData.type) {
      case "content_view":
        updates.contentViewed = [...report.contentViewed, activityData.data];
        updates.screenTimeMinutes = report.screenTimeMinutes + activityData.data.duration;
        break;
      case "interaction":
        updates.interactions = [...report.interactions, activityData.data];
        break;
      case "achievement":
        updates.achievements = [...report.achievements, activityData.data];
        break;
      case "alert":
        updates.alerts = [...report.alerts, activityData.data];
        break;
    }

    await updateDoc(reportRef, updates);
  } else {
    // Create new report
    const newReport: ActivityReport = {
      id: reportId,
      childId,
      date: Timestamp.fromDate(today),
      screenTimeMinutes: activityData.type === "content_view" ? activityData.data.duration : 0,
      contentViewed: activityData.type === "content_view" ? [activityData.data] : [],
      interactions: activityData.type === "interaction" ? [activityData.data] : [],
      achievements: activityData.type === "achievement" ? [activityData.data] : [],
      alerts: activityData.type === "alert" ? [activityData.data] : [],
    };
    await setDoc(reportRef, newReport);
  }
}

export async function getActivityReport(
  db: any,
  childId: string,
  date: Date
): Promise<ActivityReport | null> {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const reportId = `${childId}_${targetDate.getTime()}`;

  const docRef = doc(db, "activityReports", reportId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as ActivityReport) : null;
}

export async function getActivityReports(
  db: any,
  childId: string,
  startDate: Date,
  endDate: Date
): Promise<ActivityReport[]> {
  const q = query(
    collection(db, "activityReports"),
    where("childId", "==", childId),
    where("date", ">=", Timestamp.fromDate(startDate)),
    where("date", "<=", Timestamp.fromDate(endDate)),
    orderBy("date", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as ActivityReport);
}

// Screen Time Tracking
export async function trackScreenTime(
  db: any,
  childId: string,
  minutes: number
): Promise<void> {
  await logActivity(db, childId, {
    type: "content_view",
    data: {
      category: "general",
      title: "Screen Time",
      duration: minutes,
      educational: false,
      timestamp: Timestamp.now(),
    },
  });
}

export async function getTodayScreenTime(db: any, childId: string): Promise<number> {
  const today = new Date();
  const report = await getActivityReport(db, childId, today);
  return report?.screenTimeMinutes || 0;
}

// Alert Generation
export async function checkAndGenerateAlerts(
  db: any,
  childId: string
): Promise<void> {
  const rules = await getScreenTimeRules(db, childId);
  if (!rules) return;

  const screenTime = await getTodayScreenTime(db, childId);

  // Check screen time limit
  if (screenTime >= rules.dailyLimitMinutes * 0.9) {
    await logActivity(db, childId, {
      type: "alert",
      data: {
        type: "screen_time",
        message: `Approaching daily screen time limit (${screenTime}/${rules.dailyLimitMinutes} minutes)`,
        severity: screenTime >= rules.dailyLimitMinutes ? "high" : "medium",
        timestamp: Timestamp.now(),
      },
    });
  }

  // Check bedtime mode
  if (rules.bedtimeMode.enabled) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    if (currentTime >= rules.bedtimeMode.start || currentTime <= rules.bedtimeMode.end) {
      await logActivity(db, childId, {
        type: "alert",
        data: {
          type: "screen_time",
          message: "Bedtime mode is active - device usage should be restricted",
          severity: "medium",
          timestamp: Timestamp.now(),
        },
      });
    }
  }
}

// Educational Content Recommendations
export async function getEducationalRecommendations(
  db: any,
  childId: string
): Promise<any[]> {
  const policy = await getContentPolicy(db, childId);
  if (!policy) return [];

  const child = await getChildProfile(db, childId);
  if (!child) return [];

  // This would integrate with an educational content API
  // For now, return sample recommendations based on age and allowed categories
  const recommendations: Array<{
    title: string;
    category: string;
    ageRating: string;
    description: string;
  }> = [];

  if (policy.allowedCategories.includes("educational")) {
    recommendations.push({
      title: "Khan Academy Kids",
      category: "educational",
      ageRating: "kid",
      description: "Interactive learning games for math, reading, and creativity",
    });
  }

  if (policy.allowedCategories.includes("creative")) {
    recommendations.push({
      title: "Scratch Jr",
      category: "creative",
      ageRating: "kid",
      description: "Learn coding through creative storytelling",
    });
  }

  return recommendations;
}
