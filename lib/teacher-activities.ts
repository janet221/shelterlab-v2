export type TeacherActivity = {
  id: string; shelter_id: string; title: string; summary: string; description: string;
  activity_type: string; status: string; event_start_at?: string; event_end_at?: string;
  application_deadline?: string; capacity?: number; contact_email?: string; contact_phone?: string;
  teacher_group_visit: boolean;
  shelters: { name: string; address: string; contact_email: string } | null;
};

export function filterTeacherActivities(activities: TeacherActivity[], options: { county: string; crossCounty: boolean; query: string }) {
  const county = options.county.replace(/台/g, "臺");
  const term = options.query.trim().toLocaleLowerCase();
  return activities.filter((activity) => {
    if (activity.status !== "published" || activity.teacher_group_visit !== true) return false;
    const shelter = activity.shelters;
    const matchesCounty = options.crossCounty || !county || Boolean(shelter?.address?.replace(/台/g, "臺").startsWith(county));
    const searchable = `${activity.title} ${activity.summary} ${shelter?.name ?? ""} ${shelter?.address ?? ""}`.toLocaleLowerCase();
    return matchesCounty && (!term || searchable.includes(term));
  });
}
