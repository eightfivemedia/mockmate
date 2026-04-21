/**
 * Single source of truth for student discount eligibility.
 *
 * Use `student_discount_active` from the users table — not the email domain.
 * The domain check only happens at signup and re-verification; after that,
 * the cron job is responsible for flipping student_discount_active to false
 * when the discount expires.
 */

export interface StudentDiscountStatus {
  active: boolean;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  needsReverification: boolean;
}

export function getStudentDiscountStatus(user: {
  student_discount_active?: boolean | null;
  student_tier_expires_at?: string | null;
  student_reverification_sent_at?: string | null;
}): StudentDiscountStatus {
  const active = user.student_discount_active === true;
  const expiresAt = user.student_tier_expires_at ?? null;

  let daysUntilExpiry: number | null = null;
  if (expiresAt) {
    const ms = new Date(expiresAt).getTime() - Date.now();
    daysUntilExpiry = Math.ceil(ms / (1000 * 60 * 60 * 24));
  }

  // Surface the warning in-app if a reverification email was sent
  const needsReverification =
    active &&
    user.student_reverification_sent_at != null &&
    daysUntilExpiry !== null &&
    daysUntilExpiry > 0;

  return { active, expiresAt, daysUntilExpiry, needsReverification };
}

/**
 * Returns the monthly price for a user based on their discount status.
 * Use this wherever the app displays pricing or gates features.
 */
export function getMonthlyPrice(discountStatus: StudentDiscountStatus): number {
  return discountStatus.active ? 9 : 19;
}
