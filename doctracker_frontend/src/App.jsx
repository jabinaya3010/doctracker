
import { useEffect,useMemo, useState } from "react";
import "./App.css";



function getStatus(date) {
  if (!date) return "No Expiry";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(date + "T00:00:00");
  const days = Math.ceil((expiry - today) / 86400000);

  if (days < 0) return "Expired";
  if (days <= 30) return "Expiring Soon";
  return "Active";
}

function Login({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");

    if (register && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    // Demo only: connect this form to the Spring Boot
    // authentication API before using real accounts.
    onLogin(name.trim() || email.split("@")[0]);
  }

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <div className="brand">
          <span className="brand-icon">▤</span>
          <span>Docu<span className="accent">Track</span></span>
        </div>
        <p className="brand-caption">Personal Document Reminder System</p>

        <div className="intro-copy">
          <span className="eyebrow">YOUR DOCUMENTS, ORGANIZED</span>
          <h1>Your important documents, always on track.</h1>
          <p>Keep your records organized and never miss an important renewal date.</p>
        </div>

        <div className="feature-list">
          <div><span className="feature-icon pink">♧</span><span><b>Timely reminders</b><small>Know before documents expire</small></span></div>
          <div><span className="feature-icon mint">▱</span><span><b>Organized records</b><small>All documents in one place</small></span></div>
          <div><span className="feature-icon lilac">✓</span><span><b>Peace of mind</b><small>Stay ready for renewals</small></span></div>
        </div>
        <div className="decor-circle circle-one" />
        <div className="decor-circle circle-two" />
      </section>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={submit}>
          <div className="mobile-brand">Docu<span className="accent">Track</span></div>
          <span className="welcome-icon">{register ? "✿" : "✦"}</span>
          <h2>{register ? "Create Account" : "Welcome Back"}</h2>
          <p className="muted">{register ? "Start organizing your documents" : "Login to your DocuTrack account"}</p>

          {register && (
            <label>
              Full Name
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" required />
            </label>
          )}

          <label>
            Email Address
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>

          <label>
            Password
            <div className="password-wrap">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required />
              <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
          </label>

          {!register && (
            <div className="form-options">
              <label className="remember"><input type="checkbox" /> Remember me</label>
              <button type="button" className="text-button" onClick={() => setError("Password recovery will be available after backend integration.")}>Forgot password?</button>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}
          <button className="primary-button" type="submit">{register ? "Create Account →" : "Login →"}</button>

          <p className="switch-auth">
            {register ? "Already have an account?" : "Don't have an account?"}
            <button type="button" className="text-button" onClick={() => { setRegister(!register); setError(""); }}>
              {register ? "Login here" : "Register here"}
            </button>
          </p>
          <p className="demo-note">Frontend demo · Authentication not connected yet</p>
        </form>
      </section>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState("Dashboard");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "Identity", issueDate: "", expiryDate: ""
  });
    const API_URL = "https://doctracker-3.onrender.com/api/documents";

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      setDocuments(data);

    } catch (error) {
      console.error("Error loading documents:", error);
      alert("Unable to load documents. Check your backend.");
    }
  }

  const counts = useMemo(() => {
    const statuses = documents.map(d => getStatus(d.expiryDate));
    return {
      total: documents.length,
      active: statuses.filter(s => s === "Active").length,
      soon: statuses.filter(s => s === "Expiring Soon").length,
      expired: statuses.filter(s => s === "Expired").length,
    };
  }, [documents]);

  const filtered = documents.filter(d => {
    const matchesSearch = `${d.name} ${d.category}`.toLowerCase().includes(search.toLowerCase());
    const status = getStatus(d.expiryDate);
    const matchesFilter = filter === "All" || d.category === filter || status === filter;
    const matchesPage = page !== "Reminders" || status === "Expiring Soon" || status === "Expired";
    return matchesSearch && matchesFilter && matchesPage;
  });

  function openAdd() {
    setEditingId(null);
    setForm({ name: "", category: "Identity", issueDate: "", expiryDate: "" });
    setShowForm(true);
  }

  function editDocument(doc) {
    setEditingId(doc.id);
    setForm({ name: doc.name, category: doc.category, issueDate: doc.issueDate, expiryDate: doc.expiryDate });
    setShowForm(true);
  }

  
    async function saveDocument(e) {
  e.preventDefault();

  if (!form.name.trim()) {
    alert("Please enter a document name.");
    return;
  }

  if (
    form.issueDate &&
    form.expiryDate &&
    form.expiryDate < form.issueDate
  ) {
    alert("Expiry date cannot be before the issue date.");
    return;
  }

  const documentData = {
    name: form.name.trim(),
    category: form.category,
    issueDate: form.issueDate || null,
    expiryDate: form.expiryDate || null,
    notes: ""
  };

  try {
    const url = editingId
      ? `${API_URL}/${editingId}`
      : API_URL;

    const response = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(documentData)
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Unable to save document");
    }

    await fetchDocuments();

    setShowForm(false);
    setEditingId(null);

    setForm({
      name: "",
      category: "Identity",
      issueDate: "",
      expiryDate: ""
    });

    alert(editingId
      ? "Document updated successfully!"
      : "Document added successfully!"
    );

  } catch (error) {
    console.error("Save error:", error);
    alert("Document was not saved: " + error.message);
  }
}
  

  
    async function deleteDocument(id) {
  if (!window.confirm("Delete this document?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Unable to delete document");
    }

    await fetchDocuments();
    alert("Document deleted successfully!");

  } catch (error) {
    console.error("Delete error:", error);
    alert(error.message);
  }
}
  

  const categories = ["Identity", "Education", "Insurance", "Financial"];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand sidebar-brand"><span className="brand-icon">▤</span><span>Docu<span className="accent">Track</span></span></div>
        <p className="brand-caption">Personal Document Reminder</p>

        <nav>
          {["Dashboard", "My Documents", "Reminders", "Categories"].map((item, i) => (
            <button key={item} className={`nav-item ${page === item ? "selected" : ""}`} onClick={() => { setPage(item); setFilter("All"); }}>
              <span>{["⌂", "▤", "♧", "▦"][i]}</span>{item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini"><span className="avatar">{user.charAt(0).toUpperCase()}</span><span><b>{user}</b><small>Personal account</small></span></div>
          <button className="nav-item logout" onClick={onLogout}>↪ Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">Docu<span className="accent">Track</span></div>
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="⌕  Search documents..." />
          <span className="top-avatar">{user.charAt(0).toUpperCase()}</span>
          <span className="top-user">{user}</span>
        </header>

        <section className="page-heading">
          <div><h1>Hello, {user}! <span>✿</span></h1><p className="muted">Here's an overview of your documents.</p></div>
          <button className="primary-button add-button" onClick={openAdd}>＋ Add Document</button>
        </section>

        <section className="stats-grid">
          {[
            ["▤", counts.total, "Total Documents", "stat-mint"],
            ["✓", counts.active, "Active Documents", "stat-green"],
            ["◷", counts.soon, "Expiring Soon", "stat-peach"],
            ["!", counts.expired, "Expired Documents", "stat-lilac"],
          ].map(([icon, value, label, style]) => (
            <button key={label} className={`stat-card ${style}`} onClick={() => { setPage("My Documents"); setFilter(label === "Total Documents" ? "All" : label === "Active Documents" ? "Active" : label === "Expiring Soon" ? "Expiring Soon" : "Expired"); }}>
              <span className="stat-icon">{icon}</span><span><b>{value}</b><small>{label}</small></span>
            </button>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-heading"><h2>Document Categories</h2><span className="muted">Browse by type</span></div>
            <div className="category-grid">
              {categories.map((category, i) => (
                <button key={category} className={`category-card category-${i}`} onClick={() => { setPage("Categories"); setFilter(category); }}>
                  <span>{["▣", "⌂", "✓", "▤"][i]}</span><b>{documents.filter(d => d.category === category).length}</b><small>{category}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="panel reminders-panel">
            <div className="panel-heading"><h2>{page === "Reminders" ? "Expiry Reminders" : "Upcoming Reminders"}</h2><button className="text-button" onClick={() => { setPage("Reminders"); setFilter("All"); }}>View All</button></div>
            {documents.filter(d => ["Expiring Soon", "Expired"].includes(getStatus(d.expiryDate))).length === 0 && <p className="muted">No urgent reminders. You're all caught up!</p>}
            {documents.filter(d => ["Expiring Soon", "Expired"].includes(getStatus(d.expiryDate))).slice(0, 4).map(d => (
              <div className="reminder-row" key={d.id}>
                <span className="reminder-icon">♧</span>
                <div><b>{d.name}</b><small>{d.expiryDate || "No expiry date"}</small></div>
                <span className={`status status-${getStatus(d.expiryDate).replace(" ", "-").toLowerCase()}`}>{getStatus(d.expiryDate)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel documents-panel">
          <div className="panel-heading">
            <h2>{page === "Reminders" ? "Documents Needing Attention" : page === "Categories" ? `${filter} Documents` : page === "My Documents" ? "My Documents" : "Recent Documents"}</h2>
            <span className="muted">{filtered.length} record(s)</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Document Name</th><th>Category</th><th>Issue Date</th><th>Expiry Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td><b>{d.name}</b></td><td><span className="category-tag">{d.category}</span></td>
                    <td>{d.issueDate || "—"}</td><td>{d.expiryDate || "—"}</td>
                    <td><span className={`status status-${getStatus(d.expiryDate).replace(" ", "-").toLowerCase()}`}>{getStatus(d.expiryDate)}</span></td>
                    <td><div className="action-buttons"><button onClick={() => editDocument(d)} title="Edit">✎</button><button onClick={() => deleteDocument(d.id)} title="Delete">×</button></div></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan="6" className="empty-state">No documents found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <p className="footer-note">DocuTrack · Your documents, organized with care.</p>
      </main>

      {showForm && (
        <div className="modal-backdrop">
          <form className="document-form" onSubmit={saveDocument}>
            <div className="panel-heading"><h2>{editingId ? "Edit Document" : "Add Document"}</h2><button type="button" className="close-button" onClick={() => setShowForm(false)}>×</button></div>
            <label>Document Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Passport" /></label>
            <label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Issue Date<input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} /></label>
            <label>Expiry Date <span className="muted">(leave empty if no expiry)</span><input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></label>
            <button className="primary-button" type="submit">{editingId ? "Save Changes" : "Add Document"}</button>
          </form>
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [user, setUser] = useState(
    () => localStorage.getItem("docutrackUser") || ""
  );

  function handleLogin(username) {
    localStorage.setItem("docutrackUser", username);
    setUser(username);
  }

  function handleLogout() {
    localStorage.removeItem("docutrackUser");
    setUser("");
  }

  return user
    ? <Dashboard user={user} onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}

