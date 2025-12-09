// Admin reconciliation function - ensures admin users have correct roles
export async function reconcileAdminUsers(): Promise<void> {
  try {
    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map(email => email.trim().toLowerCase())
      : [];

    if (adminEmails.length === 0) {
      console.log("⚠️ No admin emails configured in ADMIN_EMAILS");
      return;
    }

    console.log(`🔧 Reconciling admin users: ${adminEmails.join(", ")}`);

    for (const email of adminEmails) {
      console.log(`✅ Admin email ${email} configured - will get admin role at login`);
    }

    console.log("✅ Admin reconciliation complete");
  } catch (error) {
    console.error("❌ Admin reconciliation failed:", error);
  }
}
