
import { supabase } from "./supabase-config.js";

// ==========================================
// ELEMENTS
// ==========================================

const authScreen = document.getElementById("authScreen");
const app = document.querySelector(".app");
const customerScreen = document.getElementById("customerScreen");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginSubmit = document.getElementById("loginSubmit");
const authMessage = document.getElementById("authMessage");
const forgotPassword = document.getElementById("forgotPassword");

const adminLoginTab = document.getElementById("adminLoginTab");
const customerLoginTab = document.getElementById("customerLoginTab");
const loginTitle = document.getElementById("loginTitle");
const loginDescription = document.getElementById("loginDescription");
const loginFooter = document.getElementById("loginFooter");

const customerName = document.getElementById("customerName");
const customerProducts = document.getElementById("customerProducts");
const customerSignOut = document.getElementById("customerSignOut");

let loginMode = "admin";

// ==========================================
// SCREEN MANAGEMENT
// ==========================================

function showLogin() {
  authScreen.style.display = "grid";
  app.style.display = "none";

  if (customerScreen) {
    customerScreen.style.display = "none";
  }
}

function showDashboard(user, profile) {
  authScreen.style.display = "none";
  app.style.display = "flex";

  if (customerScreen) {
    customerScreen.style.display = "none";
  }

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

function showCustomer(profile) {
  authScreen.style.display = "none";
  app.style.display = "none";
  customerScreen.style.display = "block";

  customerName.textContent = profile.full_name || "Customer";

  loadCustomerProducts();
}

function showMessage(message, success = false) {
  authMessage.textContent = message;
  authMessage.style.color = success ? "#2d8a50" : "#c0392b";
}

// ==========================================
// LOGIN MODE
// ==========================================

function setLoginMode(mode) {
  loginMode = mode;

  showMessage("");

  if (mode === "admin") {
    loginTitle.textContent = "Welcome back";
    loginDescription.textContent =
      "Sign in to your administrator account.";

    loginFooter.textContent =
      "Access is limited to authorized S.T.P.B personnel.";

    adminLoginTab.style.background = "#1b4332";
    adminLoginTab.style.color = "#ffffff";

    customerLoginTab.style.background = "#e8eee9";
    customerLoginTab.style.color = "#1b4332";
  } else {
    loginTitle.textContent = "Welcome, Customer";
    loginDescription.textContent =
      "Sign in to browse our farm supplies and equipment.";

    loginFooter.textContent =
      "Customer access for S.T.P.B Farm Supplies & Equipment.";

    customerLoginTab.style.background = "#1b4332";
    customerLoginTab.style.color = "#ffffff";

    adminLoginTab.style.background = "#e8eee9";
    adminLoginTab.style.color = "#1b4332";
  }
}

adminLoginTab.addEventListener("click", () => {
  setLoginMode("admin");
});

customerLoginTab.addEventListener("click", () => {
  setLoginMode("customer");
});

// ==========================================
// VALIDATE ADMINISTRATOR ACCOUNT
// ==========================================

async function loadAdminProfile(user) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!profile) {
    return null;
  }

  if (!profile.is_active) {
    throw new Error(
      "Your administrator account is inactive. Please contact the system administrator."
    );
  }

  const allowedRoles = [
    "super_admin",
    "organization_admin",
    "staff"
  ];

  if (!allowedRoles.includes(profile.role)) {
    throw new Error(
      "Your administrator account has an invalid role."
    );
  }

  return profile;
}

// ==========================================
// VALIDATE CUSTOMER ACCOUNT
// ==========================================

async function loadCustomerProfile(user) {
  const { data: profile, error } = await supabase
    .from("customer_profiles")
    .select("id, full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return profile;
}

// ==========================================
// ROUTE AUTHENTICATED USER
// ==========================================

async function loadUserAndOpenScreen(user) {
  try {
    // Check administrator account first
    const adminProfile = await loadAdminProfile(user);

    if (adminProfile) {
      showDashboard(user, adminProfile);
      return true;
    }

    // If no administrator profile exists, check customer profile
    const customerProfile = await loadCustomerProfile(user);

    if (customerProfile) {
      showCustomer(customerProfile);
      return true;
    }

    await supabase.auth.signOut();

    showLogin();

    showMessage(
      "No authorized administrator or customer profile was found for this account."
    );

    return false;

  } catch (error) {
    await supabase.auth.signOut();

    showLogin();
    showMessage(error.message);

    return false;
  }
}

// ==========================================
// LOGIN
// ==========================================

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

    if (error) {
      throw error;
    }

    const success = await loadUserAndOpenScreen(data.user);

    if (success) {
      loginForm.reset();
    }

  } catch (error) {
    showMessage(error.message);

  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = "Sign in";
  }
});

// ==========================================
// CUSTOMER PRODUCT BROWSING
// ==========================================

async function loadCustomerProducts() {
  customerProducts.textContent = "Loading products...";

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, product_name, description, price, stock_quantity, unit, image_url"
    )
    .eq("organization_id", "4e762e56-2d6c-468d-a50b-6c009e700064")
    .eq("is_active", true)
    .order("product_name");

  if (error) {
    customerProducts.textContent =
      "Unable to load products. Please try again later.";

    console.error("Product loading error:", error);
    return;
  }

  customerProducts.replaceChildren();

  if (!products || products.length === 0) {
    customerProducts.textContent = "No products are currently available.";
    return;
  }

  const grid = document.createElement("div");

  grid.style.display = "grid";
  grid.style.gridTemplateColumns =
    "repeat(auto-fit, minmax(220px, 1fr))";
  grid.style.gap = "18px";

  products.forEach((product) => {
    const card = document.createElement("article");

    card.style.background = "#ffffff";
    card.style.padding = "20px";
    card.style.borderRadius = "12px";
    card.style.border = "1px solid #e5e9e5";

    const name = document.createElement("h3");
    name.textContent = product.product_name;

    const description = document.createElement("p");
    description.textContent =
      product.description || "No description available.";

    const price = document.createElement("strong");
    price.textContent =
      "₱" + Number(product.price).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

    price.style.color = "#1b4332";

    const stock = document.createElement("p");
    stock.textContent =
      "Available stock: " +
      product.stock_quantity +
      " " +
      (product.unit || "piece");

    card.append(name, description, price, stock);

    grid.appendChild(card);
  });

  customerProducts.appendChild(grid);
}

// ==========================================
// CHECK EXISTING SESSION
// ==========================================

async function checkSession() {
  showLogin();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    showMessage(error.message);
    return;
  }

  if (data.session) {
    await loadUserAndOpenScreen(data.session.user);
  } else {
    showLogin();
  }
}

// ==========================================
// LOGOUT
// ==========================================

async function signOutUser(button) {
  button.disabled = true;

  const { error } = await supabase.auth.signOut();

  button.disabled = false;

  if (error) {
    showMessage(error.message);
  }
}

const signOutButton = document.getElementById("signOutButton");

if (signOutButton) {
  signOutButton.addEventListener("click", () => {
    signOutUser(signOutButton);
  });
}

if (customerSignOut) {
  customerSignOut.addEventListener("click", () => {
    signOutUser(customerSignOut);
  });
}

// ==========================================
// MONITOR AUTHENTICATION CHANGES
// ==========================================

supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_OUT") {
    showLogin();
    loginForm.reset();
    showMessage("You have been signed out.");
  }
});

// ==========================================
// FORGOT PASSWORD
// ==========================================

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
    showMessage(
      "Password reset instructions sent to your email.",
      true
    );
  }
});

// ==========================================
// START AUTHENTICATION
// ==========================================

setLoginMode("admin");
checkSession();
