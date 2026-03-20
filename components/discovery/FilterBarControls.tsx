'use client';

import { Button, Select, SelectItem, type Selection } from '@heroui/react';

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

const selectionToList = (selection: Selection): string[] => {
  if (selection === 'all') return [];
  return Array.from(selection).map((item) => String(item));
};

const listToSelection = (value: string | string[] | undefined): Set<string> => {
  if (!value) return new Set();
  if (Array.isArray(value)) return new Set(value);
  return new Set([value]);
};

const timeOptions: TimeBucket[] = ['early', 'morning', 'midday', 'evening'];

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
        <Select
          label={labels.date}
          aria-label={labels.date}
          selectedKeys={listToSelection(dayFilter)}
          onSelectionChange={(selection) => setDayFilter(selectionToList(selection)[0] ?? '')}
          className="filter-select"
        >
          <SelectItem key="today">{labels.today}</SelectItem>
          <SelectItem key="tomorrow">{labels.tomorrow}</SelectItem>
          <SelectItem key="weekend">{labels.weekend}</SelectItem>
          <SelectItem key="week">{labels.nextWeek}</SelectItem>
          <SelectItem key="mon">{labels.mon}</SelectItem>
          <SelectItem key="tue">{labels.tue}</SelectItem>
          <SelectItem key="wed">{labels.wed}</SelectItem>
          <SelectItem key="thu">{labels.thu}</SelectItem>
          <SelectItem key="fri">{labels.fri}</SelectItem>
          <SelectItem key="sat">{labels.sat}</SelectItem>
          <SelectItem key="sun">{labels.sun}</SelectItem>
        </Select>

        <Select
          label={labels.time}
          aria-label={labels.time}
          selectionMode="multiple"
          selectedKeys={timeBuckets}
          onSelectionChange={(selection) => setTimeBuckets(new Set(selectionToList(selection)))}
          className="filter-select"
        >
          {timeOptions.map((option) => (
            <SelectItem key={option}>{labels[option]}</SelectItem>
          ))}
        </Select>

        <Select
          label={labels.category}
          aria-label={labels.category}
          selectedKeys={listToSelection(category)}
          onSelectionChange={(selection) => setCategory(selectionToList(selection)[0] ?? '')}
          className="filter-select"
        >
          {categories.map((item) => (
            <SelectItem key={item.slug}>{item.name}</SelectItem>
          ))}
        </Select>

        <Select
          label={labels.style}
          aria-label={labels.style}
          selectedKeys={listToSelection(style)}
          onSelectionChange={(selection) => setStyle(selectionToList(selection)[0] ?? '')}
          className="filter-select"
        >
          {styles.map((item) => (
            <SelectItem key={item.slug}>{item.name}</SelectItem>
          ))}
        </Select>

        <Select
          label={labels.neighborhood}
          aria-label={labels.neighborhood}
          selectedKeys={listToSelection(neighborhood)}
          onSelectionChange={(selection) => setNeighborhood(selectionToList(selection)[0] ?? '')}
          className="filter-select"
        >
          {neighborhoods.map((item) => (
            <SelectItem key={item.slug}>{item.name}</SelectItem>
          ))}
        </Select>

        <Select
          label={labels.language}
          aria-label={labels.language}
          selectedKeys={listToSelection(language)}
          onSelectionChange={(selection) => setLanguage(selectionToList(selection)[0] ?? '')}
          className="filter-select"
        >
          <SelectItem key="Italian">Italian</SelectItem>
          <SelectItem key="English">English</SelectItem>
        </Select>

        <Select
          label={labels.level}
          aria-label={labels.level}
          selectedKeys={listToSelection(level)}
          onSelectionChange={(selection) => setLevel(selectionToList(selection)[0] ?? '')}
          className="filter-select"
        >
          <SelectItem key="beginner">{locale === 'it' ? 'Principianti' : 'Beginner'}</SelectItem>
          <SelectItem key="open">{locale === 'it' ? 'Aperti a tutti' : 'Open'}</SelectItem>
          <SelectItem key="intermediate">{locale === 'it' ? 'Intermedio' : 'Intermediate'}</SelectItem>
          <SelectItem key="advanced">{locale === 'it' ? 'Avanzato' : 'Advanced'}</SelectItem>
        </Select>

        <Select
          label={labels.format}
          aria-label={labels.format}
          selectedKeys={listToSelection(format)}
          onSelectionChange={(selection) => setFormat(selectionToList(selection)[0] ?? '')}
          className="filter-select"
        >
          <SelectItem key="in_person">{labels.inPerson}</SelectItem>
          <SelectItem key="hybrid">Hybrid</SelectItem>
          <SelectItem key="online">Online</SelectItem>
        </Select>

        <Select
          label={labels.availability}
          aria-label={labels.availability}
          selectionMode="multiple"
          selectedKeys={availability}
          onSelectionChange={(selection) => setAvailability(new Set(selectionToList(selection)))}
          className="filter-select"
        >
          <SelectItem key="open_now">{labels.openNow}</SelectItem>
          <SelectItem key="drop_in">{labels.dropIn}</SelectItem>
        </Select>
      </div>

      <div className="filter-panel-actions filter-panel-actions-bottom">
        <Button variant="ghost" radius="full" className="button button-ghost" onPress={resetFilters}>
          {labels.reset}
        </Button>
        <Button color="primary" radius="full" className="button button-primary" onPress={applyFilters}>
          {labels.apply}
        </Button>
      </div>
    </>
  );
}
