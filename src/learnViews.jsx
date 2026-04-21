const LEARN_HUB_SUBJECTS = [
  { id: "am", subject: "Additional Mathematics", form: "Form 4", icon: "A+", tone: "mint" },
  { id: "bm", subject: "Bahasa Melayu", form: "Form 4", icon: "BM", tone: "blue" },
  { id: "bio", subject: "Biology", form: "Form 4", icon: "BIO", tone: "violet" },
  { id: "chem", subject: "Chemistry", form: "Form 4", icon: "CH", tone: "pink" },
  { id: "eko", subject: "Ekonomi", form: "Form 4", icon: "EK", tone: "orange" },
  { id: "eng", subject: "English", form: "Form 4", icon: "BI", tone: "rose" },
  { id: "math", subject: "Mathematics", form: "Form 4", icon: "M", tone: "green" },
  { id: "islam", subject: "Pendidikan Islam", form: "Form 4", icon: "PI", tone: "magenta" },
  { id: "biz", subject: "Perniagaan", form: "Form 4", icon: "PG", tone: "gold" },
  { id: "phy", subject: "Physics", form: "Form 4", icon: "PH", tone: "sky" },
  { id: "akaun", subject: "Prinsip Perakaunan", form: "Form 4", icon: "AC", tone: "indigo" },
  { id: "sc", subject: "Sains Komputer", form: "Form 4", icon: "SC", tone: "slate" },
  { id: "science", subject: "Science", form: "Form 4", icon: "SCI", tone: "yellow" },
  { id: "history", subject: "Sejarah", form: "Form 4", icon: "SJ", tone: "brown" },
];

const QUICK_NOTES_GROUPS = [
  {
    id: "am",
    subject: "Additional Mathematics",
    subtitle: "All notes for Additional Mathematics Form 4",
    icon: "A+",
    rows: [
      "Chapter 1: Functions",
      "Chapter 2: Quadratic Functions",
      "Chapter 3: Equation Systems",
      "Chapter 4: Indices, Surds and Logarithms",
      "Chapter 5: Progressions",
      "Chapter 6: Linear Law",
      "Chapter 7: Coordinate Geometry",
      "Chapter 8: Vectors",
      "Chapter 9: Solution of Triangles",
      "Chapter 10: Index Numbers",
    ],
  },
  {
    id: "bm",
    subject: "Bahasa Melayu",
    subtitle: "All notes for Bahasa Melayu Form 4",
    icon: "BM",
    rows: ["Chapter 3: Kemahiran Menulis", "Chapter 5: Aspek Tatabahasa"],
  },
];

const VIDEO_GROUPS = [
  {
    id: "am",
    subject: "Additional Mathematics",
    subtitle: "All videos for Additional Mathematics Form 4",
    icon: "A+",
    rows: [
      "Chapter 1: Functions",
      "Chapter 2: Quadratic Functions",
      "Chapter 3: Equation Systems",
      "Chapter 4: Indices, Surds and Logarithms",
      "Chapter 5: Progressions",
      "Chapter 6: Linear Law",
      "Chapter 7: Coordinate Geometry",
      "Chapter 8: Vectors",
      "Chapter 9: Solution of Triangles",
      "Chapter 10: Index Numbers",
    ],
  },
  {
    id: "bm",
    subject: "Bahasa Melayu",
    subtitle: "All videos for Bahasa Melayu Form 4",
    icon: "BM",
    rows: [
      "Chapter 1: Kemahiran Mendengar dan Bertutur",
      "Chapter 2: Kemahiran Membaca",
      "Chapter 3: Kemahiran Menulis",
    ],
  },
];

const EXPERIMENT_GROUPS = [
  {
    id: "am",
    subject: "Additional Mathematics",
    subtitle: "All experiments for Additional Mathematics Form 4",
    icon: "A+",
    rows: [
      "Chapter 1: Functions",
      "Chapter 2: Quadratic Functions",
      "Chapter 3: Equation Systems",
      "Chapter 6: Linear Law",
      "Chapter 8: Vectors",
      "Chapter 9: Solution of Triangles",
    ],
  },
  {
    id: "bio",
    subject: "Biology",
    subtitle: "All experiments for Biology Form 4",
    icon: "BIO",
    rows: [
      "Chapter 3: Movement of Substances Across Plasma Membrane",
      "Chapter 12: Coordination and Response in Humans",
    ],
  },
  {
    id: "chem",
    subject: "Chemistry",
    subtitle: "All experiments for Chemistry Form 4",
    icon: "CH",
    rows: [
      "Chapter 2: Matter and Atomic Structure",
      "Chapter 3: Mole Concept, Chemical Formulae and Equations",
      "Chapter 5: Chemical Bond",
    ],
  },
];

const TEXTBOOK_ROWS = [
  { no: 1, subject: "Asas Kelestarian", links: ["KSSM"] },
  { no: 2, subject: "Bahasa Arab", links: ["KSSM"] },
  { no: 3, subject: "Bahasa Cina", links: ["KSSM"] },
  { no: 4, subject: "Bahasa Iban", links: ["KSSM"] },
  { no: 5, subject: "Bahasa Kadazandusun", links: ["KSSM"] },
  { no: 6, subject: "Bahasa Melayu", links: ["KSSM (Part 1)", "KSSM (Part 2)"] },
  { no: 7, subject: "Bahasa Semai", links: ["KSSM"] },
  { no: 8, subject: "Bahasa Tamil", links: ["KSSM"] },
  { no: 9, subject: "Biologi", links: ["KSSM (EN)", "KSSM (BM)"] },
  { no: 10, subject: "Ekonomi", links: ["KSSM"] },
  { no: 11, subject: "Fizik", links: ["KSSM (BM)", "KSSM (EN)"] },
];

function Breadcrumb({ items }) {
  return (
    <div className="pandai-learn-breadcrumb">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className={index === 0 ? "is-green" : ""}>
          {item}
        </span>
      ))}
    </div>
  );
}

function PageTitle({ title, breadcrumb }) {
  return (
    <header className="pandai-learn-page-head">
      <h1>{title}</h1>
      <Breadcrumb items={breadcrumb} />
    </header>
  );
}

function FilterCheckbox({ label, checked = false, indent = false }) {
  return (
    <label className={`pandai-learn-filter-row ${indent ? "is-indent" : ""}`}>
      <span className={`pandai-learn-check ${checked ? "is-checked" : ""}`}>{checked ? "v" : ""}</span>
      <span>{label}</span>
    </label>
  );
}

function LearnHubView({ onOpenView }) {
  return (
    <section className="pandai-learn-clone">
      <PageTitle title="Learning Hub" breadcrumb={["Learn", "Learning Hub"]} />

      <article className="pandai-learn-hub-shell">
        <aside className="pandai-learn-filter">
          <div className="pandai-learn-search">
            <input type="text" placeholder="Search grade or subject" />
            <span>o</span>
          </div>

          <div className="pandai-learn-filter-block">
            <div className="pandai-learn-filter-head">
              <h3>Grades</h3>
              <span>^</span>
            </div>
            <FilterCheckbox label="Primary school" />
            <FilterCheckbox label="Year 1" indent />
            <FilterCheckbox label="Year 2" indent />
            <FilterCheckbox label="Year 3" indent />
            <FilterCheckbox label="Year 4" indent />
            <FilterCheckbox label="Year 5" indent />
            <FilterCheckbox label="Year 6" indent />
            <FilterCheckbox label="Secondary school" checked />
            <FilterCheckbox label="Form 1" indent />
            <FilterCheckbox label="Form 2" indent />
            <FilterCheckbox label="Form 3" indent />
            <FilterCheckbox label="Form 4" checked indent />
            <FilterCheckbox label="Form 5" indent />
          </div>

          <div className="pandai-learn-filter-block">
            <div className="pandai-learn-filter-head">
              <h3>Subjects</h3>
              <span>^</span>
            </div>
            <FilterCheckbox label="All subject" checked />
            <FilterCheckbox label="Additional Mathematics" checked />
            <FilterCheckbox label="Asas Sains Komputer" />
            <FilterCheckbox label="Bahasa Melayu" checked />
            <FilterCheckbox label="Biology" checked />
          </div>
        </aside>

        <div className="pandai-learn-hub-grid">
          {LEARN_HUB_SUBJECTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pandai-hub-subject-card tone-${item.tone}`}
              onClick={() =>
                onOpenView("quickNotes", {
                  subject: item.subject,
                  topic: "Functions",
                })
              }
            >
              <span className="pandai-hub-subject-card__icon">{item.icon}</span>
              <span className="pandai-hub-subject-card__copy">
                <strong>{item.subject}</strong>
                <small>{item.form}</small>
              </span>
            </button>
          ))}
        </div>
      </article>
    </section>
  );
}

function SubjectChapterSection({ subject, subtitle, icon, rows }) {
  return (
    <article className="pandai-learn-subject-block">
      <header className="pandai-learn-subject-head">
        <span className="pandai-learn-subject-icon">{icon}</span>
        <div>
          <h2>{subject}</h2>
          <p>{subtitle}</p>
        </div>
      </header>

      <div className="pandai-learn-chapter-list">
        {rows.map((row, index) => (
          <button key={`${subject}-${index}`} type="button" className="pandai-learn-chapter-row">
            <span className="pandai-learn-chapter-row__icon">{index + 1}</span>
            <span>{row}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function QuickNotesView() {
  return (
    <section className="pandai-learn-clone">
      <PageTitle
        title="Quick Notes"
        breadcrumb={["Learn", "Quick Notes", "Form 4", "All notes for Form 4"]}
      />

      {QUICK_NOTES_GROUPS.map((group) => (
        <SubjectChapterSection
          key={group.id}
          subject={group.subject}
          subtitle={group.subtitle}
          icon={group.icon}
          rows={group.rows}
        />
      ))}
    </section>
  );
}

function VideosView() {
  return (
    <section className="pandai-learn-clone">
      <PageTitle
        title="Videos"
        breadcrumb={["Learn", "Videos", "Form 4", "All videos for Form 4"]}
      />

      {VIDEO_GROUPS.map((group) => (
        <SubjectChapterSection
          key={group.id}
          subject={group.subject}
          subtitle={group.subtitle}
          icon={group.icon}
          rows={group.rows}
        />
      ))}
    </section>
  );
}

function ExperimentsView() {
  return (
    <section className="pandai-learn-clone">
      <PageTitle
        title="Experiments"
        breadcrumb={["Learn", "Experiments", "Form 4", "All experiments for Form 4"]}
      />

      {EXPERIMENT_GROUPS.map((group) => (
        <SubjectChapterSection
          key={group.id}
          subject={group.subject}
          subtitle={group.subtitle}
          icon={group.icon}
          rows={group.rows}
        />
      ))}
    </section>
  );
}

function TextbooksView() {
  return (
    <section className="pandai-learn-clone">
      <PageTitle title="Textbooks" breadcrumb={["Learn", "Textbooks", "All books for Form 4"]} />

      <article className="pandai-textbook-alert">
        <p>
          List of all digital textbooks provided free of charge by the <strong>Ministry of Education Malaysia</strong> through the
          <strong> Google Drive</strong> platform.
        </p>
        <p>
          Please log in to your Google Classroom account <strong>@moe-dl.edu.my</strong> (get from your school teacher) first before
          downloading a book.
        </p>
      </article>

      <article className="pandai-textbook-table">
        <div className="pandai-textbook-row is-head">
          <span>#</span>
          <span>Subject</span>
          <span>Download</span>
        </div>
        {TEXTBOOK_ROWS.map((row) => (
          <div key={row.no} className="pandai-textbook-row">
            <span>{row.no}</span>
            <span>{row.subject}</span>
            <span className="pandai-textbook-downloads">
              {row.links.map((item) => (
                <button key={`${row.no}-${item}`} type="button" className="pandai-textbook-pill">
                  {item}
                </button>
              ))}
            </span>
          </div>
        ))}
      </article>
    </section>
  );
}

function BookmarksView({ onGoPractice }) {
  return (
    <section className="pandai-learn-clone">
      <PageTitle title="Bookmarks" breadcrumb={["Learn", "Bookmarks"]} />

      <article className="pandai-bookmark-empty">
        <div className="pandai-bookmark-empty__icon" aria-hidden="true">
          []
        </div>
        <h2>It seems you don't have any bookmark set yet</h2>
        <p>You can bookmark any question after you submit your answer</p>
        <button type="button" className="pandai-start-btn" onClick={onGoPractice}>
          Let's practise now
        </button>
      </article>
    </section>
  );
}

export function LearnPageView({ pageContext, onOpenView, onGoPractice }) {
  const view = pageContext.learnView || "hub";

  switch (view) {
    case "quickNotes":
      return <QuickNotesView />;
    case "videos":
      return <VideosView />;
    case "experiments":
      return <ExperimentsView />;
    case "textbooks":
      return <TextbooksView />;
    case "bookmarks":
      return <BookmarksView onGoPractice={onGoPractice} />;
    case "hub":
    default:
      return <LearnHubView onOpenView={onOpenView} />;
  }
}
