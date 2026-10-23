
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const starterExercises = [
  "Squat",
  "Romanian Deadlift",
  "Hip Thrust",
  "Lunge",
  "Leg Press",
  "Glute Bridge",
  "Push-up",
  "Chest Press",
  "Shoulder Press",
  "Lat Pulldown",
  "Seated Row",
  "Bicep Curl",
  "Tricep Pushdown",
  "Plank",
  "Crunch",
  "Calf Raise",
];

const emptyExercise = (name) => ({
  id: `${Date.now()}-${Math.random()}`,
  name,
  sets: [
    { id: `${Date.now()}-a`, reps: "10", weight: "0", done: false },
    { id: `${Date.now()}-b`, reps: "10", weight: "0", done: false },
    { id: `${Date.now()}-c`, reps: "10", weight: "0", done: false },
  ],
});

export default function App() {
  const [tab, setTab] = useState("Home");
  const [date, setDate] = useState(today);
  const [entries, setEntries] = useState(() => read("sculpt-activity-v1", {}));
  const [goals, setGoals] = useState(() =>
    read("sculpt-goals-v1", {
      steps: 8000,
      calories: 400,
      exerciseMinutes: 30,
    })
  );
  const [habits, setHabits] = useState(() =>
    read("sculpt-habits-v1", [
      { id: 1, name: "Drink enough water" },
      { id: 2, name: "Move my body" },
      { id: 3, name: "Eat nourishing meals" },
      { id: 4, name: "Get enough sleep" },
    ])
  );
  const [habitChecks, setHabitChecks] = useState(() =>
    read("sculpt-habit-checks-v1", {})
  );
  const [workouts, setWorkouts] = useState(() =>
    read("sculpt-workouts-v1", [])
  );
  const [habitInput, setHabitInput] = useState("");
  const [exerciseInput, setExerciseInput] = useState("");
  const [sessionName, setSessionName] = useState("Strength session");
  const [sessionDate, setSessionDate] = useState(today);
  const [sessionExercises, setSessionExercises] = useState([]);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    localStorage.setItem("sculpt-activity-v1", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("sculpt-goals-v1", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("sculpt-habits-v1", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("sculpt-habit-checks-v1", JSON.stringify(habitChecks));
  }, [habitChecks]);

  useEffect(() => {
    localStorage.setItem("sculpt-workouts-v1", JSON.stringify(workouts));
  }, [workouts]);

  const entry = entries[date] || {
    steps: "",
    calories: "",
    exerciseMinutes: "",
    workouts: 0,
    lifts: 0,
    logged: false,
  };

  const updateEntry = (field, value) => {
    setEntries((old) => ({
      ...old,
      [date]: { ...entry, [field]: value },
    }));
  };

  const saveDailyLog = () => {
    setEntries((old) => ({
      ...old,
      [date]: { ...entry, logged: true },
    }));
  };

  const toggleHabit = (id) => {
    setHabitChecks((old) => {
      const current = old[date] || [];
      return {
        ...old,
        [date]: current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      };
    });
  };

  const addHabit = () => {
    const name = habitInput.trim();
    if (!name) return;
    setHabits((old) => [...old, { id: Date.now(), name }]);
    setHabitInput("");
  };

  const addExercise = (name) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    setSessionExercises((old) => [...old, emptyExercise(cleanName)]);
    setExerciseInput("");
  };

  const changeSet = (exerciseId, setId, field, value) => {
    setSessionExercises((old) =>
      old.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.id !== setId ? set : { ...set, [field]: value }
              ),
            }
      )
    );
  };

  const addSet = (exerciseId) => {
    setSessionExercises((old) =>
      old.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  id: `${Date.now()}-${Math.random()}`,
                  reps: "10",
                  weight: "0",
                  done: false,
                },
              ],
            }
      )
    );
  };

  const removeSet = (exerciseId, setId) => {
    setSessionExercises((old) =>
      old.map((exercise) =>
        exercise.id !== exerciseId
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
      )
    );
  };

  const saveWorkout = () => {
    const usableExercises = sessionExercises.filter(
      (exercise) => exercise.sets.length > 0
    );
    if (!usableExercises.length) {
      alert("Add at least one exercise before saving your workout.");
      return;
    }

    const session = {
      id: Date.now(),
      name: sessionName.trim() || "Workout",
      date: sessionDate,
      exercises: usableExercises,
      savedAt: new Date().toISOString(),
    };

    const updatedWorkouts = [session, ...workouts];
    setWorkouts(updatedWorkouts);

    const sameDay = updatedWorkouts.filter((item) => item.date === sessionDate);
    const completedSets = sameDay.reduce(
      (total, item) =>
        total +
        item.exercises.reduce(
          (exerciseTotal, exercise) =>
            exerciseTotal + exercise.sets.filter((set) => set.done).length,
          0
        ),
      0
    );

    setEntries((old) => ({
      ...old,
      [sessionDate]: {
        ...(old[sessionDate] || {
          steps: "",
          calories: "",
          exerciseMinutes: "",
          logged: false,
        }),
        workouts: sameDay.length,
        lifts: completedSets,
      },
    }));

    setDate(sessionDate);
    setSessionExercises([]);
    setSessionName("Strength session");
    alert("Workout saved. Nice work!");
  };

  const deleteWorkout = (id) => {
    if (!window.confirm("Delete this saved workout?")) return;
    const remaining = workouts.filter((workout) => workout.id !== id);
    setWorkouts(remaining);

    const affectedDates = [...new Set(workouts.filter((w) => w.id === id).map((w) => w.date))];
    setEntries((old) => {
      const next = { ...old };
      affectedDates.forEach((day) => {
        const dayWorkouts = remaining.filter((w) => w.date === day);
        const completedSets = dayWorkouts.reduce(
          (total, workout) =>
            total +
            workout.exercises.reduce(
              (sum, exercise) =>
                sum + exercise.sets.filter((set) => set.done).length,
              0
            ),
          0
        );
        next[day] = {
          ...(next[day] || {}),
          workouts: dayWorkouts.length,
          lifts: completedSets,
        };
      });
      return next;
    });
  };

  const progress = (value, goal) =>
    Math.min(100, Math.round((Number(value) / Math.max(1, Number(goal))) * 100));

  const savedDays = Object.values(entries).filter((item) => item.logged).length;
  const completedHabits = (habitChecks[date] || []).length;
  const monthWorkouts = useMemo(
    () =>
      workouts.filter((workout) => {
        const d = new Date(`${workout.date}T12:00:00`);
        return (
          d.getMonth() === month.getMonth() &&
          d.getFullYear() === month.getFullYear()
        );
      }),
    [workouts, month]
  );

  const calendarCells = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();
    return [
      ...Array(firstDay.getDay()).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [month]);

  const readableDate = (value) =>
    new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const nav = ["Home", "Workout", "Habits", "Goals", "Calendar", "Progress"];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("Home")}>
          SCULPT<span>.</span>
        </button>
        <div className="topbar-right">
          <span className="today-label">{readableDate(today())}</span>
          <span className="status-dot" />
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <p className="eyebrow">YOUR SPACE</p>
          <nav>
            {nav.map((item, index) => (
              <button
                key={item}
                className={`nav-link ${tab === item ? "active" : ""}`}
                onClick={() => setTab(item)}
              >
                <span className="nav-number">0{index + 1}</span>
                {item}
                {tab === item && <span className="nav-arrow">↗</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="lime-line" />
            <p>Consistency over perfection.</p>
            <small>BUILD YOUR OWN STRONG.</small>
          </div>
        </aside>

        <main className="main-content">
          {tab === "Home" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">YOUR DAILY CHECK-IN</p>
                  <h1>Show up for <em>you.</em></h1>
                  <p className="subheading">
                    Small actions. Stronger body. Better energy.
                  </p>
                </div>
                <label className="date-field">
                  <span>LOG DATE</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
              </div>

              <section className="hero-panel">
                <div className="hero-copy">
                  <p className="eyebrow">DAILY MOVEMENT</p>
                  <h2>Progress is<br />built <em>daily.</em></h2>
                  <p>Track your movement and celebrate the work you put in.</p>
                  <button className="button button-lime" onClick={() => setTab("Workout")}>
                    LOG A WORKOUT <span>↗</span>
                  </button>
                </div>
                <div className="rings-wrap">
                  <div className="activity-rings">
                    <div className="ring ring-outer" style={{ "--ring-progress": `${progress(entry.steps, goals.steps)}%` }}>
                      <div className="ring ring-middle" style={{ "--ring-progress": `${progress(entry.exerciseMinutes, goals.exerciseMinutes)}%` }}>
                        <div className="ring ring-inner" style={{ "--ring-progress": `${progress(entry.calories, goals.calories)}%` }}>
                          <div className="ring-center"><span>TODAY</span><strong>{Math.round((progress(entry.steps, goals.steps) + progress(entry.exerciseMinutes, goals.exerciseMinutes) + progress(entry.calories, goals.calories)) / 3)}%</strong></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ring-legend">
                    <span><i className="legend-lime" /> Steps</span>
                    <span><i className="legend-white" /> Exercise</span>
                    <span><i className="legend-grey" /> Calories</span>
                  </div>
                </div>
              </section>

              <div className="section-heading">
                <div><p className="eyebrow">YOUR NUMBERS</p><h2>Daily activity</h2></div>
                <span className="muted-text">Edit and save your totals</span>
              </div>

              <section className="stats-grid">
                {[
                  { key: "steps", title: "Steps", unit: "steps", icon: "↗", goal: goals.steps },
                  { key: "calories", title: "Calories burned", unit: "kcal", icon: "✳", goal: goals.calories },
                  { key: "exerciseMinutes", title: "Exercise", unit: "minutes", icon: "◷", goal: goals.exerciseMinutes },
                  { key: "workouts", title: "Workouts", unit: "sessions", icon: "⌁", goal: null },
                ].map((stat) => (
                  <div className="stat-card" key={stat.key}>
                    <div className="stat-top"><span className="stat-icon">{stat.icon}</span><span className="stat-unit">{stat.unit}</span></div>
                    <p>{stat.title}</p>
                    <input
                      className="stat-input"
                      type="number"
                      min="0"
                      value={entry[stat.key] ?? ""}
                      onChange={(e) => updateEntry(stat.key, e.target.value)}
                      disabled={stat.key === "workouts"}
                    />
                    {stat.goal ? <div className="mini-progress"><span style={{ width: `${progress(entry[stat.key] || 0, stat.goal)}%` }} /></div> : <small className="muted-text">Updated from saved workouts</small>}
                    {stat.goal && <small className="muted-text">{Number(entry[stat.key] || 0).toLocaleString()} / {Number(stat.goal).toLocaleString()} goal</small>}
                  </div>
                ))}
              </section>

              <div className="save-row">
                <span className="muted-text">{entry.logged ? "✓ This day's activity has been saved." : "Remember to save your daily activity."}</span>
                <button className="button button-lime" onClick={saveDailyLog}>SAVE DAILY LOG ↗</button>
              </div>

              <section className="lower-grid">
                <div className="panel">
                  <div className="section-heading compact"><div><p className="eyebrow">DAILY PRACTICE</p><h2>Habit check</h2></div><span className="habit-count">{completedHabits}/{habits.length}</span></div>
                  {habits.length === 0 && <p className="muted-text">Add habits in the Habits tab to start your daily checklist.</p>}
                  {habits.slice(0, 5).map((habit) => (
                    <label className="habit-row" key={habit.id}>
                      <input type="checkbox" checked={(habitChecks[date] || []).includes(habit.id)} onChange={() => toggleHabit(habit.id)} />
                      <span>{habit.name}</span>
                    </label>
                  ))}
                  <button className="text-button" onClick={() => setTab("Habits")}>MANAGE HABITS ↗</button>
                </div>
                <div className="panel workout-teaser">
                  <p className="eyebrow">TRAINING LOG</p>
                  <h2>Every rep<br />counts.</h2>
                  <p>Capture sets, reps and weights so you can see your strength progress over time.</p>
                  <button className="button button-outline" onClick={() => setTab("Workout")}>OPEN WORKOUT LOG ↗</button>
                  <div className="teaser-number">{workouts.length.toString().padStart(2, "0")} <span>SESSIONS SAVED</span></div>
                </div>
              </section>
            </>
          )}

          {tab === "Workout" && (
            <>
              <div className="page-heading">
                <div><p className="eyebrow">STRENGTH & MOVEMENT</p><h1>Workout <em>log.</em></h1><p className="subheading">Record the work. Learn from every session.</p></div>
              </div>

              <section className="panel workout-builder">
                <div className="section-heading"><div><p className="eyebrow">NEW SESSION</p><h2>Build your workout</h2></div><span className="live-pill"><i /> IN PROGRESS</span></div>
                <div className="form-grid">
                  <label className="form-field"><span>WORKOUT NAME</span><input value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="e.g. Lower body strength" /></label>
                  <label className="form-field"><span>WORKOUT DATE</span><input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} /></label>
                </div>

                <div className="exercise-picker">
                  <label className="form-field exercise-name-field"><span>ADD AN EXERCISE</span><input value={exerciseInput} onChange={(e) => setExerciseInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addExercise(exerciseInput); }} placeholder="Type any exercise name..." /></label>
                  <button className="button button-lime add-exercise-button" onClick={() => addExercise(exerciseInput)}>+ ADD</button>
                </div>
                <div className="exercise-chips">
                  {starterExercises.map((name) => <button key={name} onClick={() => addExercise(name)}>{name} <span>+</span></button>)}
                </div>

                {sessionExercises.length === 0 ? (
                  <div className="empty-state"><span className="empty-icon">＋</span><h3>Your session starts here.</h3><p>Add an exercise above. You can record the weight and reps for each set.</p></div>
                ) : (
                  <div className="exercise-list">
                    {sessionExercises.map((exercise, index) => (
                      <article className="exercise-card" key={exercise.id}>
                        <div className="exercise-card-heading">
                          <div className="exercise-title"><span className="exercise-index">{String(index + 1).padStart(2, "0")}</span><input aria-label="Exercise name" value={exercise.name} onChange={(e) => setSessionExercises((old) => old.map((item) => item.id === exercise.id ? { ...item, name: e.target.value } : item))} /></div>
                          <button className="remove-button" onClick={() => setSessionExercises((old) => old.filter((item) => item.id !== exercise.id))}>REMOVE ×</button>
                        </div>
                        <div className="set-header"><span>SET</span><span>WEIGHT (KG)</span><span>REPS</span><span>DONE</span><span /></div>
                        {exercise.sets.map((set, setIndex) => (
                          <div className={`set-row ${set.done ? "set-complete" : ""}`} key={set.id}>
                            <span className="set-number">{String(setIndex + 1).padStart(2, "0")}</span>
                            <input aria-label={`Set ${setIndex + 1} weight in kg`} type="number" min="0" step="0.5" value={set.weight} onChange={(e) => changeSet(exercise.id, set.id, "weight", e.target.value)} />
                            <input aria-label={`Set ${setIndex + 1} reps`} type="number" min="0" value={set.reps} onChange={(e) => changeSet(exercise.id, set.id, "reps", e.target.value)} />
                            <label className="done-check"><input type="checkbox" checked={set.done} onChange={(e) => changeSet(exercise.id, set.id, "done", e.target.checked)} /><span>✓</span></label>
                            <button className="remove-set" title="Remove set" onClick={() => removeSet(exercise.id, set.id)}>×</button>
                          </div>
                        ))}
                        <button className="text-button add-set-button" onClick={() => addSet(exercise.id)}>+ ADD SET</button>
                      </article>
                    ))}
                  </div>
                )}

                <div className="workout-save-bar"><div><strong>{sessionExercises.length}</strong> exercises <span>·</span> <strong>{sessionExercises.reduce((sum, ex) => sum + ex.sets.length, 0)}</strong> sets <span>·</span> <strong>{sessionExercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0)}</strong> completed</div><button className="button button-lime" onClick={saveWorkout}>SAVE WORKOUT ↗</button></div>
              </section>

              <section className="history-section">
                <div className="section-heading"><div><p className="eyebrow">YOUR TRAINING JOURNEY</p><h2>Workout history</h2></div><span className="muted-text">{workouts.length} saved sessions</span></div>
                {workouts.length === 0 ? <div className="panel empty-history"><p>No workouts saved yet. Your sessions will appear here after you save them.</p></div> : (
                  <div className="history-list">
                    {[...workouts].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).map((workout) => {
                      const setCount = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
                      const doneCount = workout.exercises.reduce((sum, ex) => sum + ex.sets.filter((s) => s.done).length, 0);
                      return <details className="history-card" key={workout.id}>
                        <summary><span className="history-date">{readableDate(workout.date)}</span><span className="history-main"><strong>{workout.name}</strong><small>{workout.exercises.length} exercises · {setCount} sets · {doneCount} completed</small></span><span className="history-open">＋</span></summary>
                        <div className="history-details">
                          {workout.exercises.map((exercise) => <div className="history-exercise" key={exercise.id}><strong>{exercise.name}</strong><span>{exercise.sets.map((set, i) => `${i + 1}. ${set.weight || 0} kg × ${set.reps || 0}${set.done ? " ✓" : ""}`).join("  ·  ")}</span></div>)}
                          <button className="remove-button history-delete" onClick={() => deleteWorkout(workout.id)}>DELETE WORKOUT ×</button>
                        </div>
                      </details>;
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {tab === "Habits" && (
            <>
              <div className="page-heading"><div><p className="eyebrow">THE LITTLE THINGS ADD UP</p><h1>Daily <em>habits.</em></h1><p className="subheading">Build routines that support the life you want.</p></div></div>
              <section className="panel">
                <div className="section-heading"><div><p className="eyebrow">CHECKLIST</p><h2>{readableDate(date)}</h2></div><label className="date-field"><span>CHECK DATE</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></div>
                <div className="habit-progress-track"><span style={{ width: `${habits.length ? completedHabits / habits.length * 100 : 0}%` }} /></div>
                <p className="muted-text">{completedHabits} of {habits.length} habits complete</p>
                {habits.map((habit) => <div className="habit-manage-row" key={habit.id}><label className="habit-row"><input type="checkbox" checked={(habitChecks[date] || []).includes(habit.id)} onChange={() => toggleHabit(habit.id)} /><span>{habit.name}</span></label><button className="remove-button" onClick={() => setHabits((old) => old.filter((item) => item.id !== habit.id))}>DELETE ×</button></div>)}
                <div className="inline-add"><input value={habitInput} onChange={(e) => setHabitInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addHabit(); }} placeholder="Add a habit..." /><button className="button button-lime" onClick={addHabit}>+ ADD HABIT</button></div>
              </section>
            </>
          )}

          {tab === "Goals" && (
            <>
              <div className="page-heading"><div><p className="eyebrow">YOUR TARGETS, YOUR PACE</p><h1>Set your <em>goals.</em></h1><p className="subheading">Make the targets realistic for your current season.</p></div></div>
              <section className="panel goals-panel"><p className="muted-text">These goals power the activity rings and daily progress bars.</p>
                {[{ key: "steps", title: "Daily steps", unit: "steps", icon: "↗" }, { key: "calories", title: "Calories burned", unit: "kcal", icon: "✳" }, { key: "exerciseMinutes", title: "Exercise time", unit: "minutes", icon: "◷" }].map((goal) => <div className="goal-row" key={goal.key}><div className="goal-icon">{goal.icon}</div><div className="goal-name"><strong>{goal.title}</strong><small>Daily target · {goal.unit}</small></div><input type="number" min="1" value={goals[goal.key]} onChange={(e) => setGoals((old) => ({ ...old, [goal.key]: e.target.value }))} /><span className="goal-unit">{goal.unit}</span></div>)}
              </section>
            </>
          )}

          {tab === "Calendar" && (
            <>
              <div className="page-heading"><div><p className="eyebrow">YOUR CONSISTENCY AT A GLANCE</p><h1>Activity <em>calendar.</em></h1><p className="subheading">Select a date to view or update its log.</p></div></div>
              <section className="panel calendar-panel">
                <div className="calendar-heading"><button className="calendar-arrow" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button><h2>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2><button className="calendar-arrow" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button></div>
                <div className="calendar-grid">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}{calendarCells.map((day, index) => {
                  if (!day) return <span className="calendar-blank" key={`blank-${index}`} />;
                  const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const item = entries[key];
                  const hasWorkout = workouts.some((w) => w.date === key);
                  return <button key={key} className={`calendar-day ${date === key ? "selected" : ""} ${key === today() ? "is-today" : ""}`} onClick={() => setDate(key)}><span>{day}</span>{(item?.logged || hasWorkout) && <i />}</button>;
                })}</div>
                <div className="calendar-legend"><span><i className="legend-lime" /> Saved activity or workout</span><span><i className="legend-outline" /> Today</span></div>
                <div className="selected-day-panel"><div><p className="eyebrow">SELECTED DAY</p><h3>{readableDate(date)}</h3><p className="muted-text">{entries[date]?.logged ? "Activity log saved" : "No saved activity log yet"} · {workouts.filter((w) => w.date === date).length} workout(s)</p></div><button className="button button-lime" onClick={() => setTab("Home")}>OPEN DAILY LOG ↗</button></div>
              </section>
            </>
          )}

          {tab === "Progress" && (
            <>
              <div className="page-heading"><div><p className="eyebrow">ZOOM OUT AND SEE THE WORK</p><h1>Your <em>progress.</em></h1><p className="subheading">Every logged day is a step toward stronger routines.</p></div></div>
              <section className="progress-overview">
                <div className="progress-stat"><span className="eyebrow">DAYS LOGGED</span><strong>{savedDays}</strong><small>daily activity logs</small></div>
                <div className="progress-stat"><span className="eyebrow">WORKOUTS</span><strong>{workouts.length}</strong><small>saved training sessions</small></div>
                <div className="progress-stat"><span className="eyebrow">HABITS TODAY</span><strong>{completedHabits}<small>/{habits.length}</small></strong><small>checked on {readableDate(date)}</small></div>
              </section>
              <section className="panel">
                <div className="section-heading"><div><p className="eyebrow">MONTHLY TOTALS</p><h2>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2></div><div className="month-arrows"><button className="calendar-arrow" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>←</button><button className="calendar-arrow" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>→</button></div></div>
                <div className="monthly-metrics">
                  {[
                    { title: "Steps", value: Object.entries(entries).filter(([key, item]) => key.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`)).reduce((sum, [, item]) => sum + Number(item.steps || 0), 0), unit: "total steps" },
                    { title: "Calories burned", value: Object.entries(entries).filter(([key]) => key.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`)).reduce((sum, [, item]) => sum + Number(item.calories || 0), 0), unit: "total kcal" },
                    { title: "Exercise minutes", value: Object.entries(entries).filter(([key]) => key.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`)).reduce((sum, [, item]) => sum + Number(item.exerciseMinutes || 0), 0), unit: "total minutes" },
                  ].map((metric) => <div className="monthly-metric" key={metric.title}><span>{metric.title}</span><strong>{metric.value.toLocaleString()}</strong><small>{metric.unit}</small></div>)}
                </div>
                <div className="section-heading history-month-heading"><div><p className="eyebrow">TRAINING</p><h2>Workouts this month</h2></div><strong className="lime-number">{monthWorkouts.length}</strong></div>
                {monthWorkouts.length ? monthWorkouts.map((workout) => <div className="simple-history-row" key={workout.id}><span>{readableDate(workout.date)}</span><strong>{workout.name}</strong><span>{workout.exercises.length} exercises</span></div>) : <p className="muted-text">No saved workouts in this month yet.</p>}
              </section>
            </>
          )}

          <footer className="app-footer"><span>SCULPT<span className="footer-dot">.</span></span><p>STRONGER BY DESIGN.</p><small>YOUR JOURNEY. YOUR PACE.</small></footer>
        </main>
      </div>
    </div>
  );
}
