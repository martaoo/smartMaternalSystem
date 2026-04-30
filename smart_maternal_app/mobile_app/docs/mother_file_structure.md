# Mother-Only File Structure (Mock Data Phase)

This project is now restructured for **mother workflows only** and easier debugging.

## Current Structure

```text
lib/
  main.dart
  core/
    theme/
      app_colors.dart
  services/
    auth_service.dart
  screens/
    auth/
      login_screen.dart
  features/
    mother/
      data/
        mock_mother_repository.dart
      models/
        mother_entities.dart
      screens/
        mother_shell_screen.dart
        mother_dashboard_screen.dart
        mother_appointments_screen.dart
        mother_child_growth_screen.dart
        mother_vaccination_screen.dart
        mother_profile_screen.dart
```

## Why this is easier to debug

- Feature-based grouping keeps all mother files together.
- One mock source (`mock_mother_repository.dart`) makes test data easy to change.
- One shell (`mother_shell_screen.dart`) controls bottom navigation and main routing.
- Clear separation:
  - `models`: data contracts
  - `data`: mock repository and future backend adapter
  - `screens`: UI and interaction flow

## Backend integration later

When backend is ready:

1. Replace mock methods in `mock_mother_repository.dart` with API calls.
2. Keep the same model classes in `mother_entities.dart`.
3. Keep screen logic mostly unchanged.
