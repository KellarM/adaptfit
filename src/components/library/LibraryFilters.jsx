import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  SOURCE_OPTIONS,
  TYPE_OPTIONS,
} from "@/lib/library";

export const EMPTY_FILTERS = {
  muscle: "",
  q: "",
  type: "",
  difficulty: "",
  equipment: "",
  source: "",
};

const SELECTS = [
  { key: "type", all: "All types", options: TYPE_OPTIONS },
  { key: "difficulty", all: "Any difficulty", options: DIFFICULTY_OPTIONS },
  { key: "equipment", all: "Any equipment", options: EQUIPMENT_OPTIONS },
  { key: "source", all: "Any source", options: SOURCE_OPTIONS },
];

export default function LibraryFilters({ filters, onChange, count }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const active = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-2.5">
      <label className="block">
        <span className="text-[10.5px] text-muted-foreground">Focus on a muscle</span>
        <input
          value={filters.muscle}
          onChange={(e) => set({ muscle: e.target.value })}
          placeholder="Type a muscle, e.g. Abs"
          className="field mt-1"
        />
      </label>

      <input
        value={filters.q}
        onChange={(e) => set({ q: e.target.value })}
        placeholder="Search by name"
        className="field"
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {SELECTS.map(({ key, all, options }) => (
          <select
            key={key}
            value={filters[key]}
            onChange={(e) => set({ [key]: e.target.value })}
            className="field text-[12px]"
          >
            <option value="">{all}</option>
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="tnum text-[11px] text-muted-foreground">
          {count} {count === 1 ? "movement" : "movements"}
        </p>
        {active ? (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-[11px] text-primary transition hover:opacity-80"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}