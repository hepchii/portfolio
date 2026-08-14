# Portfolio Website

A modern, responsive personal portfolio built with plain HTML, CSS, and JavaScript.
It includes a landing page, a dedicated projects page, a styled about section, a
working contact form, and a lightweight Node.js server that stores submissions in SQLite.

## Features

- Responsive home page with hero, about, projects, and contact sections
- Dedicated `projects.html` page with project cards and real screenshot images
- About section with portrait image hover effect
- Smooth scrolling for navigation links
- Mobile-friendly navigation menu
- Contact form with basic client-side validation
- Server-side validation and SQLite storage for form submissions
- Social links in the footer

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- SQLite via Node's built-in `node:sqlite`

## Project Structure

```text
P-Portfolio/
|-- assets/
|-- data/
|-- index.html
|-- projects.html
|-- scripts.js
|-- server.js
|-- style.css
`-- package.json
```

## Getting Started

### Prerequisites

- Node.js 22 or later

### Run Locally

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

## Notes

- The contact form submits to `POST /api/contact`.
- Form entries are stored in `data/contact.sqlite`.
- Open the site through the Node server for contact form submissions to work.
- You can still open `index.html` directly for a static preview, but the form
  will not save without the server running.

## Assets

The project uses local image assets from the `assets/` folder, including:

- `one_MU_F_v4.png`
- `one_about_v1.jpeg`
- `Business Landing Page.png`
- `Dashboard Interface.png`
- `Portfolio Template.png`

## License

No license has been added yet.
