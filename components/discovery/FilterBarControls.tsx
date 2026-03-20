'use client';

import type { Locale, TimeBucket } from '@/lib/catalog/types';

interface FilterBarControlsProps {
  locale: Locale;
  labels: {
    apply: string;
    reset: string;
    date: string;
    time: string;
    category: string;
    style: string;
    neighborhood: string;
    language: string;
    level: string;
    format: string;
    availability: string;
    today: string;
    tomorrow: string;
    weekend: string;
    nextWeek: string;
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
    early: string;
    morning: string;
    midday: string;
    evening: string;
    inPerson: string;
    openNow: string;
    dropIn: string;
    any: string;
  };
  categories: Array<{ slug: string; name: string }>;
  neighborhoods: Array<{ slug: string; name: string }>;
  styles: Array<{ slug: string; name: string }>;
  dayFilter: string;
  setDayFilter: (value: string) => void;
  timeBuckets: Set<string>;
  setTimeBuckets: (value: Set<string>) => void;
  category: string;
  setCategory: (value: string) => void;
  style: string;
  setStyle: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  neighborhood: string;
  setNeighborhood: (value: string) => void;
  format: string;
  setFormat: (value: string) => void;
  availability: Set<string>;
  setAvailability: (value: Set<string>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

const timeOptions: TimeBucket[] = ['early', 'morning', 'midday', 'evening'];

const toggleSetValue = (source: Set<string>, value: string) => {
  const next = new Set(source);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
};

export function FilterBarControls({
  locale,
  labels,
  categories,
  neighborhoods,
  styles,
  dayFilter,
  setDayFilter,
  timeBuckets,
  setTimeBuckets,
  category,
  setCategory,
  style,
  setStyle,
  level,
  setLevel,
  language,
  setLanguage,
  neighborhood,
  setNeighborhood,
  format,
  setFormat,
  availability,
  setAvailability,
  applyFilters,
  resetFilters
}: FilterBarControlsProps) {
  return (
    <>
      <div className="filter-grid filter-grid-expanded filter-grid-ui">
        <label>
          <span>{labels.date}</span>
          <select value={dayFilter} onChange={(event) => setDayFilter(event.currentTarget.value)}>
            <option value="">{labels.any}</option>
            <option value="today">{labels.today}</option>
            <option value="tomorrow">{labels.tomorrow}</option>
            <option value="weekend">{labels.weekend}</option>
            <option value="week">{labels.nextWeek}</option>
            <option value="mon">{labels.mon}</option>
            <option value="tue">{labels.tue}</option>
            <option value="wed">{labels.wed}</option>
            <option value="thu">{labels.thu}</option>
            <option value="fri">{labels.fri}</option>
            <option value="sat">{labels.sat}</option>
            <option value="sun">{labels.sun}</option>
          </select>
        </label>

        <fieldset className="filter-multi-group">
          <legend>{labels.time}</legend>
          <div className="chip-row">
            {timeOptions.map((option) => (
              <label key={option} className="chip-option">
                <input
                  type="checkbox"
                  checked={timeBuckets.has(option)}
                  onChange={() => setTimeBuckets(toggleSetValue(timeBuckets, option))}
                />
                <span>{labels[option]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          <span>{labels.category}</span>
          <select value={category} onChange={(event) => setCategory(event.currentTarget.value)}>
            <option value="">{labels.any}</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{labels.style}</span>
          <select value={style} onChange={(event) => setStyle(event.currentTarget.value)}>
            <option value="">{labels.any}</option>
            {styles.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{labels.neighborhood}</span>
          <select value={neighborhood} onChange={(event) => setNeighborhood(event.currentTarget.value)}>
            <option value="">{labels.any}</option>
            {neighborhoods.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>{labels.language}</span>
          <select value={language} onChange={(event) => setLanguage(event.currentTarget.value)}>
            <option value="">{labels.any}</option>
            <option value="Italian">Italian</option>
            <option value="English">English</option>
          </select>
        </label>

        <label>
          <span>{labels.level}</span>
          <select value={level} onChange={(event) => setLevel(event.currentTarget.value)}>
            <option value="">{labels.any}</option>
            <option value="beginner">{locale === 'it' ? 'Principianti' : 'Beginner'}</option>
            <option value="open">{locale === 'it' ? 'Aperti a tutti' : 'Open'}</option>
            <option value="intermediate">{locale === 'it' ? 'Intermedio' : 'Intermediate'}</option>
            <option value="advanced">{locale === 'it' ? 'Avanzato' : 'Advanced'}</option>
          </select>
        </label>

        <label>
          <span>{labels.format}</span>
          <select value={format} onChange={(event) => setFormat(event.currentTarget.value)}>
            <option value="">{labels.any}</option>
            <option value="in_person">{labels.inPerson}</option>
            <option value="hybrid">Hybrid</option>
            <option value="online">Online</option>
          </select>
        </label>

        <fieldset className="filter-multi-group">
          <legend>{labels.availability}</legend>
          <div className="chip-row">
            <label className="chip-option">
              <input
                type="checkbox"
                checked={availability.has('open_now')}
                onChange={() => setAvailability(toggleSetValue(availability, 'open_now'))}
              />
              <span>{labels.openNow}</span>
            </label>
            <label className="chip-option">
              <input
                type="checkbox"
                checked={availability.has('drop_in')}
                onChange={() => setAvailability(toggleSetValue(availability, 'drop_in'))}
              />
              <span>{labels.dropIn}</span>
            </label>
          </div>
        </fieldset>
      </div>

      <div className="filter-panel-actions filter-panel-actions-bottom">
        <button type="button" className="button button-ghost" onClick={resetFilters}>
          {labels.reset}
        </button>
        <button type="button" className="button button-primary" onClick={applyFilters}>
          {labels.apply}
        </button>
      </div>
    </>
  );
}
