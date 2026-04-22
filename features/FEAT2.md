# Goal

Build de report designer as part of "reporting" microui

# Requirements

- Use existing design tokens
- Use existing components
- Use existing services (reporting microui)
- Upgrade current "reports/dashboards" to take advantage of the new design system but consider that the page has to be the same as the current one.
- Preserve `Card for Reports` as an alternative view instead of "Table View" (i need this two visualization modes to be available as toggles icons in bar at left of "Create New Dashboard" button)

# Iteration 2: Improve "Report Designer/Builder"

- Add to each Report Card and Table row an icon to Edit (use "Report Designer" as a new page navigatable from "Reports Dashboard" page) 
- Allow to save all changes to BFF 
- Reuse "Design Tokens" from `design-tokens.css`


# Iteration 3: Data Sources Management

- Add a new option "Data Sources" to "Reporting" Main menu item.
- Allow to browse all datasources available from reporting microui. Keep same visualization modes as in "Reports Dashboard" (Card for Data Sources and Table View)
- Allow to create a new data source using "New Data Source" page (navigatable from "Data Sources" page)
- Add to each Data Source Card and Table row an icon to Edit (use "New Data Source" as a new page navigatable from "Data Sources" page) 
- Allow to save all changes to BFF 

# Iteration 4: Test Connection

- I need that when user click "Test Connection" once the connection is verified a result page for usign UX/UI "Datasource Connection test result" is shown.
- Use the same design tokens as the current one.

# UX/UI Design (Google Stitch)

- Reports Management: https://stitch.withgoogle.com/projects/17297804719666165369?node-id=4bc270d29697465b94872857e211642a
- Report Designer: https://stitch.withgoogle.com/projects/17297804719666165369?node-id=a3d6e70eb737453f8797c97d8f50aee9
- Reports Data Sources: https://stitch.withgoogle.com/projects/17297804719666165369?node-id=8b48205aa14a4ef5a7f3a776ed341b5a
- New Data Source: https://stitch.withgoogle.com/projects/17297804719666165369?node-id=63b16841613b4b008ed7013578547925
- Datasource Connection test result: https://stitch.withgoogle.com/projects/17297804719666165369?node-id=97fe8c5cb1944c71a2ea2c48d7e55a09