# Grit

Grit is a basic version control system written in Node.js. It allows you to track changes to your files, commit them, and view the history of commits, similar to Git. Grit provides basic functionality like initializing a repository, adding files to a staging area, committing changes, logging commits, and showing the differences between commits.

## Features

Initialize a new repository with .grit folder
-Add files to a staging area
-Commit changes with a message
-View a log of commits
-Show differences between committed files

## Prerequisites

1. Node.js (Ensure you have Node.js installed on your machine)
2. npm (Node Package Manager)

## Setup

Clone or download the repository.Navigate to the project directory:
cd /path/to/Grit

1. Install the dependencies:
   npm install

2. Ensure that the commander, chalk, and diff packages are installed. If not, you can install them manually by running:
   npm install commander chalk diff

3. Make the script executable (optional): If you're on a Unix-like system (Linux or macOS), you can make the script executable:
   chmod +x grit.mjs