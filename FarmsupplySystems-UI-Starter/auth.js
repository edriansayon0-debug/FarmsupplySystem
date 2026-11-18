
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

function showDashboard(user) {
  authScreen.style.display = "none";
  app.style.display = "flex";

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Account";

  const profile = {
    sidebarUserName: name,
    headerUserName: name,
    sidebarUserRole: "Organization Admin",
    headerUserRole: "Organization Admin",
    sidebarAvatar: name.substring(0, 2).toUpperCase(),
    headerAvatar: name.substring(0, 2).toUpperCase()
  };

  Object.entries(profile).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

function showMessage(message, success = false) {
  authMessage.textContent = message;
  authMessage.style.color = success ? "#2d8a50" : "#c0392b";
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

    showDashboard(data.user);
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
    showDashboard(data.session.user);
  } else {
    showLogin();
  }
}

// MONITOR AUTHENTICATION
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session) {
    showDashboard(session.user);
  }

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

    if (error) showMessage(error.message);
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
