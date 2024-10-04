# Grit - A Version Control System Inspired by Git

**Grit** is a simplified version control system written in Node.js, providing essential Git-like features, including adding files, committing changes, and now **branching**, **merging**, and **an undo system**.

## Features

- **File Staging**: Add files to a staging area using `grit add <file>`.
- **Commit**: Create commits with messages using `grit commit "<message>"`.
- **Branching**: Create and switch branches using `grit branch <branch-name>` and `grit checkout <branch-name>`.
- **Merging**: Merge branches using `grit merge <branch-name>`.
- **Undo System**: Undo the last operation (commit or file addition) using a single command, `grit undo`.
- **View Commit Logs**: Use `grit log` to see the history of your commits.
- **File Diffs**: View changes made in the last commit with `grit show <commitHash>`.

## GUI Features

Grit also includes a graphical user interface (GUI) built using Electron, making it easier to interact with the VCS system.

### GUI Features:
- **File Staging and Commits**: Add files and create commits with the click of a button.
- **Branching**: Create and switch between branches from the GUI.
- **Merging**: Merge branches using the simple GUI controls.
- **Undo**: Roll back the last commit or file addition via an **Undo** button.
  
### How to Use the GUI:

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/yourusername/grit.git
   cd grit
   npm install
