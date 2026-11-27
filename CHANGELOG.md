# Changelog

## 1.12.1

- Small fixes.

## 1.12.0

- Update skills effect.
- Update dragon sprites.
- Update icons.
- Add promo screenshots.

## 1.11.2

- Sequenced interface animations and scene transitions with async/await. Main menu cards now appear one at a time, and the disclaimer prompt fades in after the text while tap-to-continue stays available throughout.

## 1.11.1

- Enlarged the disclaimer text and let paragraphs wrap to the available screen width.
- Softened the confirmation prompt animation. Players can tap anywhere to continue or drag to scroll longer text.

## 1.11.0

- Added full voice acting for the campaign introduction and all 15 mission briefings, with 83 recorded lines per localization. Skobeeva speaks Russian in the Ukrainian version and English in the English version.
- Rewrote campaign dialogue to develop Bondarenko’s partnership with the dragon and explain skill branches, milestone rewards and achievement patches during the relevant briefings.

## 1.10.3

- Added lines for the President to the Mariupol and Donetsk briefings in Ukrainian and English.
- Updated the voiceover scripts and added JSON versions with all 83 lines per localization, grouped by character.

## 1.10.2

- Refined the landmarks in the first eight campaign panoramas, including Odesa's opera house, Kharkiv's Derzhprom and Lviv's Rynok Square.
- Added the Central Park entrance arch, the Roshen fountain and School No. 2 to the Vinnytsia waterfront panorama.

## 1.10.1

- Fix briefing autoplay sound, fires sound stopping
- Increase exp gain

## 1.10.0

- Redrew the player as a compact young dragon in level flight. Its torso tilts 45° while the muzzle points forward and the hind legs trail behind. All six wingbeats share the same face, scales and fire origin.
- The dragon matures each time all four upgrades reach another ten levels. Horns and a copper crest develop through level 40, then the gold markings deepen with each milestone. The menu, upgrade previews and both game modes reflect the player's saved progress.
- All ages use the same display scale and collision bounds. The finished flight animations ship as a PNG atlas with named frames.

## 1.9.0

- Added an achievement hall to the main menu with 32 awards across five categories. Each award shows its unlock condition and progress in English or Ukrainian.
- Added in-game notifications for newly earned awards. Achievement progress is saved between sessions, and existing saves receive credit for milestones they already track.

## 1.8.1

- Added animated contra-rotating propellers to the Tu-95 and glowing jet exhaust to the other three strategic bombers. The Tu-95 uses propellers for both numeric and string atlas frame names.

## 1.8.0

- Redrew the green dragon with shaded scales and more detailed wings, preserving the six flight poses, 8 FPS cadence and frame-3 wing sound.
- Added detailed fighter, bomber and helicopter artwork at twice the original atlas resolution, keeping world sizes and collision bounds unchanged.
- Aligned helicopter rotor overlays with the new artwork and retained the dragon's mouth emission point.
- Extended the beam and its hit band to the visible camera edge, beyond the movement area's side margin.

## 1.7.0

- Added a permanent choice between Attack and Defense after the first victory in Kharkiv. The next two skills unlock after the first victories in Vinnytsia and Dnipro.
- Added the skill tree to Upgrades, the next skill to the stats screen, and first-victory rewards to mission cards.
- Added double fire, piercing fireballs, and an automatic beam for Attack. Added a shield, life steal, and double campaign experience for Defense.
- Illustrated the skill tree and added animated previews for all six skills, with matching effects in battle.
- Aligned fire and beam emission with the dragon's mouth, tucked effects behind its head, and tapered the beam's origin in battle and previews.

## 1.6.1

- Added a card highlight, icon pulse and a sparkling dragon effect when applying an upgrade.
- Made upgrade effects brighter and matched their colors to the icons: red health, lime reload, yellow speed and blue fire size.

## 1.6.0

- Stopped automatically playing briefings when opening completed mission cards.
- Doubled the size of completed-mission flags on the campaign map.
- Added a staggered fade, slide and scale entrance for the three main menu cards.
- Enlarged small labels across menus, mission details, settings, upgrades and the game HUD.
- Centered multiline button labels and wrapped long translations without shrinking below a readable size.
- Improved text contrast and canvas text sharpness on high-density displays.
- Made the disclaimer readable with scrolling on smaller screens.

## 1.5.4

- Moved animation durations, transition delays and timer settings into a shared timing config.
- Centralized resource names, translation and storage keys, events and state identifiers.

## 1.5.3

- Fixed held movement carrying the dragon off screen during the end-of-level transition.
- Halved helicopter aiming delays and increased flight speeds by 20%.

## 1.5.2
- Updated city artwork and added level-specific clouds, sun and moon with independent parallax speeds.

## 1.5.1
- Added saved auto-fire and separate joystick/fire-button opacity settings.
- Moved pause away from screen edges and enlarged health bars and score text.

## 1.5.0

- Replaced all 15 level backgrounds with new location artwork.
- Added three-layer, frame-rate-independent parallax in campaign and endless modes.

## 1.4.0

- Increased dialogue text and next-button sizes.
- Added a persistent FPS counter toggle in settings.
- Unified UI typography, buttons and spacing across game screens.
- Redesigned upgrades and improved dialogue readability.
- Removed unused assets and the obsolete mission card, preserving voiceovers.
- Redesigned the campaign map with mission details, district selection and a separate report.
- Added briefing replay and campaign progress feedback.
- Redesigned the main menu with an animated dragon and responsive mode cards.
- Added settings for sound, language and progress reset with confirmation.
- Made the settings panel compact and added a back arrow.

## 1.3.2

- Expanded the introduction with controls, experience and upgrade guidance.
- Updated voiceover scripts in Ukrainian and English.

## 1.3.1

- Fixed rapid menu transitions and mission card animation cleanup.
- Improved touch controls, background sizing and upgrade handling.
- Fixed enemy attack timer cleanup and health bar positioning.
- Corrected location names.

## 1.3.0

- Added a story introduction and unique mission dialogues in Ukrainian and English.
- Added Russian dialogue for Skobeeva in the Ukrainian version.
- Added text-only playback until new voiceovers are ready.
- Fixed mission selection during the introduction.

## 1.2.0

- Added animated helicopter rotors.
- Added helicopter hovering, rocket attacks and random flight maneuvers.
- Added level-based helicopter speed and attack timing.

## 1.1.3

- Fixed repeated briefings when reopening the same mission.

## 1.1.2

- Redesigned pause menu.
- Fixed audio playback during screen transitions.

## 1.1.1

- Added an in-game guide.
- Improved mobile controls and game balance.
- Fixed gameplay bugs.

## 1.1.0

- Global refactoring.

## 1.0.1

- General fixes.

## 1.0.0

- Initial release.
