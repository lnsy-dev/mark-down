# Requirements Document

## Introduction

This document specifies requirements for enhancing the slideshow functionality of the mark-down web component. The enhancements focus on providing configurable navigation controls, progressive bullet point animations, and improved footnote display within slides. These features will improve presentation flexibility and user experience while maintaining the component's vanilla JavaScript architecture without CSS-in-JS.

## Glossary

- **Slideshow Component**: The JavaScript module that renders markdown content as a presentation with slide navigation
- **Navigation Controls**: Interactive buttons that allow users to move between slides
- **Bullet Point Animation**: A progressive reveal feature that displays list items one at a time
- **Footnote Display**: The rendering of markdown footnotes within individual slides
- **Attribute**: An HTML attribute on the mark-down element that configures behavior
- **Unicode Symbol**: A standard character from the Unicode character set used for icons

## Requirements

### Requirement 1

**User Story:** As a presentation author, I want to control whether navigation buttons are visible, so that I can create cleaner slides when controls are not needed.

#### Acceptance Criteria

1. WHEN the `show-controls` attribute is present on the mark-down element, THE Slideshow Component SHALL render navigation buttons on the left and right sides of each slide.

2. WHEN the `show-controls` attribute is set to the string value "true", THE Slideshow Component SHALL render navigation buttons on the left and right sides of each slide.

3. WHEN the `show-controls` attribute is absent, THE Slideshow Component SHALL not render navigation buttons on the left or right sides of slides.

4. WHEN the `show-controls` attribute is set to the string value "false", THE Slideshow Component SHALL not render navigation buttons on the left or right sides of slides.

### Requirement 2

**User Story:** As a presentation author, I want to customize the icons used for navigation buttons, so that I can match the visual style of my presentation.

#### Acceptance Criteria

1. WHEN the `back-icon` attribute is set to a Unicode symbol, THE Slideshow Component SHALL display that symbol in the previous slide navigation button.

2. WHEN the `forward-icon` attribute is set to a Unicode symbol, THE Slideshow Component SHALL display that symbol in the next slide navigation button.

3. WHEN the `back-icon` attribute is not set, THE Slideshow Component SHALL display a default Unicode symbol "◀" in the previous slide navigation button.

4. WHEN the `forward-icon` attribute is not set, THE Slideshow Component SHALL display a default Unicode symbol "▶" in the next slide navigation button.

5. THE Slideshow Component SHALL apply the icon attributes only when navigation controls are enabled via the `show-controls` attribute.

### Requirement 3

**User Story:** As a presentation author, I want bullet points to appear one at a time with animation, so that I can reveal content progressively during my presentation.

#### Acceptance Criteria

1. WHEN the `bullet-point-animations` attribute is present on the mark-down element, THE Slideshow Component SHALL initially hide all list items within a slide except the first item.

2. WHEN the `bullet-point-animations` attribute is set to the string value "true", THE Slideshow Component SHALL initially hide all list items within a slide except the first item.

3. WHEN a user navigates forward while `bullet-point-animations` is enabled and hidden list items remain on the current slide, THE Slideshow Component SHALL reveal the next hidden list item instead of advancing to the next slide.

4. WHEN a user navigates forward while `bullet-point-animations` is enabled and all list items are visible on the current slide, THE Slideshow Component SHALL advance to the next slide.

5. WHEN a user navigates backward while `bullet-point-animations` is enabled and the current slide has revealed list items beyond the first, THE Slideshow Component SHALL hide the most recently revealed list item instead of moving to the previous slide.

6. WHEN a user navigates backward while `bullet-point-animations` is enabled and only the first list item is visible on the current slide, THE Slideshow Component SHALL move to the previous slide.

7. WHEN the `bullet-point-animations` attribute is absent or set to "false", THE Slideshow Component SHALL display all list items simultaneously without progressive reveal.

### Requirement 4

**User Story:** As a presentation author, I want footnotes to appear at the bottom of slides, so that I can provide citations and additional context without cluttering the main content.

#### Acceptance Criteria

1. WHEN a slide contains markdown footnote references, THE Slideshow Component SHALL render the corresponding footnote content at the bottom of that slide.

2. THE Slideshow Component SHALL display footnote content in text that is visually smaller than the main slide content.

3. THE Slideshow Component SHALL apply a CSS class to footnote elements that allows authors to customize footnote styling.

4. WHEN a slide does not contain footnote references, THE Slideshow Component SHALL not render a footnote section for that slide.

### Requirement 5

**User Story:** As a presentation author and designer, I want all slideshow components to have semantic CSS classes, so that I can easily customize the appearance with external stylesheets.

#### Acceptance Criteria

1. THE Slideshow Component SHALL apply a unique CSS class to navigation button containers.

2. THE Slideshow Component SHALL apply unique CSS classes to the previous and next navigation buttons.

3. THE Slideshow Component SHALL apply a CSS class to list items that are hidden during bullet point animations.

4. THE Slideshow Component SHALL apply a CSS class to list items that are visible during bullet point animations.

5. THE Slideshow Component SHALL apply a CSS class to the footnote container element.

6. THE Slideshow Component SHALL apply a CSS class to individual footnote elements.

7. THE Slideshow Component SHALL not apply inline styles for visual presentation that could be achieved through CSS classes.

### Requirement 5


**User Story** As a software developer, I would like a demo of these features to confirm our changes. Please generate slideshows of different types as demo-slide-show-show-controls.html and demo-slide-show-custom-controls.html etc. so that I can test this code. Please create a new html file called demo-links.html that links to each demo using the _blank target to open the slide show in a new window