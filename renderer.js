const { exec } = require('child_process');

// Initialize Repo
document.getElementById('init-btn').addEventListener('click', () => {
    exec('node vcs.js init', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error initializing repo: ${stderr}`);
            document.getElementById('output').textContent = `Error initializing repo: ${stderr}`;
        } else {
            document.getElementById('output').textContent = 'Repo initialized successfully!';
        }
    });
});

// Add File
document.getElementById('add-btn').addEventListener('click', () => {
    const fileInput = document.getElementById('file-input');
    const filePath = fileInput.files[0].path; // Get the file path from input
    exec(`node vcs.js add ${filePath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error adding file: ${stderr}`);
            document.getElementById('output').textContent = `Error adding file: ${stderr}`;
        } else {
            document.getElementById('output').textContent = `Added file: ${filePath}`;
        }
    });
});

// Commit Changes
document.getElementById('commit-btn').addEventListener('click', () => {
    const commitMessage = document.getElementById('commit-msg').value;
    exec(`node vcs.js commit "${commitMessage}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error committing changes: ${stderr}`);
            document.getElementById('output').textContent = `Error committing changes: ${stderr}`;
        } else {
            document.getElementById('output').textContent = 'Changes committed successfully!';
        }
    });
});

// View Log
document.getElementById('log-btn').addEventListener('click', () => {
    exec('node vcs.js log', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error viewing log: ${stderr}`);
            document.getElementById('output').textContent = `Error viewing log: ${stderr}`;
        } else {
            document.getElementById('output').textContent = stdout; // Display log in <pre> element
        }
    });
});

// Show Commit Diff
document.getElementById('show-btn').addEventListener('click', () => {
    const commitHash = document.getElementById('commit-hash').value;
    exec(`node vcs.js show ${commitHash}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error showing commit diff: ${stderr}`);
            document.getElementById('output').textContent = `Error showing commit diff: ${stderr}`;
        } else {
            document.getElementById('output').textContent = stdout; // Display commit diff in <pre> element
        }
    });


// Undo last operation
document.getElementById('undo-btn').addEventListener('click', () => {
    exec(`node vcs.js undo`, (error, stdout, stderr) => {
        if (error) {
            document.getElementById('output').textContent = `Error undoing operation: ${stderr}`;
        } else {
            document.getElementById('output').textContent = stdout;
        }
    });
});

// Create Branch
document.getElementById('create-branch-btn').addEventListener('click', () => {
    const branchName = document.getElementById('branch-name').value;
    exec(`node vcs.js branch ${branchName}`, (error, stdout, stderr) => {
        if (error) {
            document.getElementById('output').textContent = `Error creating branch: ${stderr}`;
        } else {
            document.getElementById('output').textContent = `Branch ${branchName} created successfully.`;
        }
    });
});

// Switch Branch
document.getElementById('switch-branch-btn').addEventListener('click', () => {
    const branchName = document.getElementById('branch-name').value;
    exec(`node vcs.js checkout ${branchName}`, (error, stdout, stderr) => {
        if (error) {
            document.getElementById('output').textContent = `Error switching branch: ${stderr}`;
        } else {
            document.getElementById('output').textContent = `Switched to branch ${branchName}.`;
        }
    });
});

// Merge Branch
document.getElementById('merge-branch-btn').addEventListener('click', () => {
    const mergeBranchName = document.getElementById('merge-branch-name').value;
    exec(`node vcs.js merge ${mergeBranchName}`, (error, stdout, stderr) => {
        if (error) {
            document.getElementById('output').textContent = `Error merging branch: ${stderr}`;
        } else {
            document.getElementById('output').textContent = `Merged branch ${mergeBranchName} successfully.`;
        }
    });
});
});
