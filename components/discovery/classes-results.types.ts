export type CalendarEntry = {
  sessionId: string;
  venueSlug: string;
  placeSlug: string;
  title: string;
  venueName: string;
  placeName: string;
  startLabel: string;
  endLabel: string;
  startAt: string;
};

export type MapVenueSessionPreview = {
  sessionId: string;
  title: string;
  startLabel: string;
  endLabel: string;
  startAt: string;
  instructorName?: string;
  styleName?: string;
  bookingHref?: string;
  bookingLabel?: string;
};

export type MapVenueSummary = {
  venueSlug: string;
  placeSlug: string;
  name: string;
  address: string;
  neighborhoodName: string;
  geo: { lat: number; lng: number };
  matchingSessionCount: number;
  nextSession?: MapVenueSessionPreview;
  sessionsPreview: MapVenueSessionPreview[];
  studioHref: string;
  placeHref: string;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
};

export type MapRenderMode = 'interactive' | 'unavailable';
export type MapUserLocationState = 'idle' | 'locating' | 'granted' | 'denied' | 'unavailable';
