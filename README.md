# Med Minder Pro 

A clean, simple, front-end web application designed to help users track their medication schedules and improve adherence. Built purely with HTML, CSS, and JavaScript, utilizing Browser Local Storage for data persistence.

## Problem Solved

Remembering to take multiple medications at specific times can be challenging, especially for individuals managing chronic conditions or caregivers tracking schedules for others. Forgetting doses can impact treatment effectiveness and cause stress. This application provides a straightforward digital tool to organize medication schedules and track daily adherence, reducing the cognitive load and risk of missed doses.

## Features

*   **Add Medications:** Easily add new medications including name, dosage, and specific times (HH:MM format, multiple times allowed).
*   **Manage List:** View all added medications with their details.
*   **Delete Medications:** Remove medications that are no longer needed.
*   **Today's Schedule:** Automatically generates a sorted list of doses scheduled for the current day.
*   **Track Adherence:** Mark doses as 'Taken' with a simple checkbox. Visual feedback provided for completed doses.
*   **Data Persistence:** Medications and the 'taken' status for the *current day* are saved in the browser's Local Storage, so your data isn't lost when you close the tab or browser.
*   **Daily Reset:** The 'taken' status automatically resets each day.
*   **Responsive Design:** User interface adapts for usability on desktop, tablet, and mobile devices.
*   **Important Disclaimer:** Clearly reminds users this is a helper tool and not a substitute for professional medical advice.

## Technologies Used

*   **HTML5:** For structuring the content.
*   **CSS3:** For styling the user interface (including Flexbox for layout and custom properties for theming).
    *   *Font Awesome* for icons.
    *   *Google Fonts* ('Poppins') for typography.
*   *** JavaScript:*** For all application logic, DOM manipulation, date/time handling, and interactions.
*   **Browser Local Storage:** For client-side data persistence.

## Potential Future Improvements

*   Allow editing of existing medication details.
*   Implement notifications/alerts for upcoming doses (would likely require Service Workers).
*   Add categorization for medications (e.g., Morning, Evening, As Needed).
*   Include optional notes field for each medication.
