import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FilterBar } from '@/components/discovery/FilterBar';
import type { DiscoveryFilters } from '@/lib/catalog/types';
import { routerPushMock } from '../mocks/next-navigation';

vi.mock('next/dynamic', () => ({
  default: () =>
    function DynamicStub() {
      return null;
    }
}));

describe('FilterBar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.history.pushState({}, '', '/it/palermo/activities?category=stem&page=2');
  });

  it('exposes a reset action in the collapsed header and clears query params', async () => {
    const user = userEvent.setup();

    render(
      <FilterBar
        locale="it"
        citySlug="palermo"
        filters={{} as DiscoveryFilters}
        categories={[]}
        neighborhoods={[]}
        styles={[]}
        activeFilters={['STEM']}
      />
    );

    const resetButton = screen.getByRole('button', { name: 'Azzera' });
    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);

    expect(routerPushMock).toHaveBeenCalledWith('/it/palermo/activities', { scroll: false });
  });
});
