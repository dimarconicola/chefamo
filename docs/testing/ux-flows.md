# UX Flows

## Scope

This document defines the core user flows that should remain stable across major releases of `chefamo`.

## Core flows

### F01. Anonymous discovery

Goal:

- a user can understand the product and browse Palermo without signing in

Entry points:

- `/it`
- `/it/palermo`
- `/it/palermo/activities`

Expected behavior:

- filters work
- map and calendar views work
- place and organizer pages open cleanly

### F02. Activity card trust

Goal:

- every visible activity card is actionable and trustworthy

Expected behavior:

- shows real time data
- links to place and organizer context
- CTA is valid

### F03. Sign-in surface

Goal:

- sign-in stays understandable and never crashes

Expected behavior:

- magic link or OAuth when auth is available
- graceful fallback when auth is unavailable

### F04. Favorites

Goal:

- users can save places, organizers, and programs separately from dated plan items

### F05. Saved plan

Goal:

- saved plan contains only dated occurrence slots

### F06. Suggest program

Goal:

- places and organizers can submit public source material without admin access

### F07. Claim place

Goal:

- a place can submit a lightweight ownership claim

### F08. Digest signup

Goal:

- users can subscribe to digest updates without breaking the public experience
