# Geodesic Spherifier

A work-in-progress <!-- TODO: When no longer a work in progress, update this! --> library, CLI and web app created for assisting in the construction of a modular origami geodesic polyhedron.

## Contents
- [TL;DR](#tl-dr)
- [About this project](#about-this-project)
  - [What is a geodesic polyhedron?](#what-is-a-geodesic-polyhedron)
  - [Why all this for an origami project?](#why-all-this-for-an-origami-project)
- [How to use](#how-to-use)
  - [The CLI](#the-cli)
  - [The web app](#the-web-app)
  - [The library](#the-library)
- [Technical considerations](#technical-considerations)
  - [The library](#the-library)
  - [The CLI](#the-cli-1)
  <!-- - [The web app](#the-web-app) -->
  - [Testing](#testing)
  <!-- - [Other checks](#other-checks) -->
    <!-- - Spellcheck -->
    <!-- - Typecheck -->
    <!-- - ESLint -->
- [The to do list](#to-do)

## TL;DR

I made this to help me understand how to construct a modular origami geodesic sphere. There's a library, CLI and web app. See [below](#how-to-use) for details on how to [run the CLI](#the-cli), [run the web app](#the-web-app) and [use the library](#the-library).

<!-- Photo examples of icosahedron, geodesic sphere, and maybe a subdivided, but not spherified version -->

## About this project

### What is a geodesic polyhedron?

A [geodesic polyhedron](https://en.wikipedia.org/wiki/Geodesic_polyhedron) is made by starting with a polyhedron, usually an [icosahedron](https://en.wikipedia.org/wiki/Icosahedron), splitting its faces into smaller triangles, then positioning the vertices such that the polyhedron approximates a sphere. Real-world examples include [Spaceship Earth](https://en.wikipedia.org/wiki/Spaceship_Earth_(Epcot)), [The Montreal Biosphere](https://en.wikipedia.org/wiki/Montreal_Biosphere) and [Science World](https://en.wikipedia.org/wiki/Science_World_(Vancouver))

### Why all this for an origami project?

<!-- Blurb about how I found the basic unit in my book, and thought of a geodesic sphere, then learned about it, then figured out how to make units of different lengths, but same width -->

My original goal was to figure out how to make a modular origami geodesic polyhedron. Working out some of the math on paper led to working on a small program, which turned into this nifty little project.

## How to use

_Note: Using the CLI or library requires Node.js version <!-- TODO: Test and fill in version here!  --> \_\_\_\_ or higher._

### The CLI

You can run the CLI via npm or an executable script:

```bash
npm run geodesic # via npm
./geodesic # via executable
```

Options:

- Base shape
  - Default base shape is icosahedron
  - You can optionally specify a maximum of one:
    - `-i`/`--icosahedron` (20 equilateral triangle faces)
    - `-o`/`--octahedron` (8 equilateral triangle faces)
    - `-t`/`--tetrahedron` (4 equilateral triangle faces)
- Frequency
  - Default frequency is `1`
  - You can optionally specify a positive integer frequency
    - `-f <value>` or `--frequency <value>`
- Size
  - You are required to specify a maximum of one of the following with a positive number value
    - `-r`/`--radius` (Distance from centre to every vertex)
    - `-m`/`--minLength` (Smallest edge length)
    - `-M`/`--maxLength` (Largest edge length)
- Full output
  - By default, a summary of how many edges of each length is printed
  - You can optionally include `-F`/`--fullOutput` to print a complete list of edges
- Help
  - Including `-h`/`--help` will print only usage information

### The web app

### The library

## Technical considerations

### The library

### The CLI
<!-- Requirements (node, docker) -->
<!--  -->

<!-- ### The web app -->

### Testing
<!-- Requirements (node & nvm *or* VSCode dev-container extension...) -->

## To do

- Replace `PLACEHOLDER` with actual command in CLI usage
- Create more shapes
  - Platonic solids
    - Dodecahedron
    - Cube
  - Archimedean solids
- Ability to customize whether non-triangular faces should be
  - Plain (a pentagon is a pentagon)
  - Triangular (a pentagon is comprised of five triangles intersecting in the centre)
  - Pyramid (a pentagon is a five-sided pyramid, convex, with all ten edge lengths equal)
- Coloring schemes in web app
  - Highlight one length at a time
  - Highlight original triangle edges
- Rounding precision selection from CLI
- Paper selection/calculation in CLI
- Add colors to CLI output
  - Red/yellow for errors
  - Colors for normal output
