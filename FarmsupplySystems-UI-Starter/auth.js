
import { supabase } from "./supabase-config.js";

const authScreen = document.getElementById("authScreen");
const app = document.querySelector(".app");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginSubmit = document.getElementById("loginSubmit");
const authMessage = document.getElementById("authMessage");
const forgotPassword = document.getElementById("forgotPassword");

function showLogin() {
  authScreen.style.display = "grid";
  app.style.display = "none";
}

function showDashboard(user, profile) {
  authScreen.style.display = "none";
  app.style.display = "flex";

  const name =
    profile.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Account";

  const roleLabels = {
    super_admin: "Super Admin",
    organization_admin: "Organization Admin",
    staff: "Staff"
  };

  const roleName = roleLabels[profile.role];

const userDetails = {
  sidebarUserName: name,
  headerUserName: name,
  sidebarUserRole: roleName,
  headerUserRole: roleName,
  sidebarAvatar: name.substring(0, 2).toUpperCase(),
  headerAvatar: name.substring(0, 2).toUpperCase(),
  organizationCardRole: roleName
};

  Object.entries(userDetails).forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value;
    }
  });
}

function showMessage(message, success = false) {
  authMessage.textContent = message;
  authMessage.style.color = success ? "#2d8a50" : "#c0392b";
}

// LOAD AND VALIDATE USER PROFILE
async function loadProfileAndShowDashboard(user) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    await supabase.auth.signOut();
    showLogin();
    showMessage(
      "Unable to load your account profile. Please contact the system administrator."
    );
    return false;
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    showLogin();
    showMessage(
      "Your account is inactive. Please contact the system administrator."
    );
    return false;
  }

  const allowedRoles = [
    "super_admin",
    "organization_admin",
    "staff"
  ];

  if (!allowedRoles.includes(profile.role)) {
    await supabase.auth.signOut();
    showLogin();
    showMessage(
      "Your account has an invalid role. Please contact the system administrator."
    );
    return false;
  }

  showDashboard(user, profile);
  return true;
}

// LOGIN
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  loginSubmit.disabled = true;
  loginSubmit.textContent = "Signing in...";
  showMessage("");

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    await loadProfileAndShowDashboard(data.user);

    loginForm.reset();

  } catch (error) {
    showMessage(error.message);

  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = "Sign in";
  }
});

// CHECK EXISTING SESSION
async function checkSession() {
  showLogin();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    showMessage(error.message);
    return;
  }

  if (data.session) {
    await loadProfileAndShowDashboard(data.session.user);
  } else {
    showLogin();
  }
}

// MONITOR SIGN OUT
supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    showLogin();
    loginForm.reset();
    showMessage("You have been signed out.");
  }
});

// LOGOUT
const signOutButton = document.getElementById("signOutButton");

if (signOutButton) {
  signOutButton.addEventListener("click", async () => {
    signOutButton.disabled = true;

    const { error } = await supabase.auth.signOut();

    signOutButton.disabled = false;

    if (error) {
      showMessage(error.message);
    }
  });
}

// FORGOT PASSWORD
forgotPassword.addEventListener("click", async () => {
  const email = loginEmail.value.trim();

  if (!email) {
    showMessage("Please enter your email address first.");
    loginEmail.focus();
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });

  if (error) {
    showMessage(error.message);
  } else {
    showMessage("Password reset instructions sent to your email.", true);
  }
});

// START AUTHENTICATION
checkSession();
