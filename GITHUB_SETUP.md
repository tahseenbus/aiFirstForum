# 🚀 Uploading AppIdea Blueprint to GitHub

This guide provides different methods to push your local codebase to a GitHub repository and solutions for common terminal-related issues.

---

## 🛠️ Prerequisites
1.  **Git Installed**: Run `git --version` to check.
2.  **GitHub Account**: [Sign up here](https://github.com/) if you haven't already.
3.  **New Repository**: Create a new repository on GitHub (keep it empty, do not initialize with README or License).

---

## 🛰️ Option 1: Standard Git (HTTPS)
*Best for beginners. Uses your GitHub username and Personal Access Token (PAT).*

1.  **Initialize Git** (if not already done):
    ```bash
    git init
    ```
2.  **Add your files**:
    ```bash
    git add .
    ```
3.  **Commit your changes**:
    ```bash
    git commit -m "Initial commit: AppIdea Blueprint v1.0"
    ```
4.  **Rename branch to main**:
    ```bash
    git branch -M main
    ```
5.  **Connect to GitHub**:
    *(Replace `USERNAME` and `REPO_NAME` with your details)*
    ```bash
    git remote add origin https://github.com/USERNAME/REPO_NAME.git
    ```
6.  **Push to GitHub**:
    ```bash
    git push -u origin main
    ```

---

## 🔐 Option 2: SSH (Secure Shell)
*Best for developers. Once set up, you never have to type your password again.*

1.  **Generate SSH Key** (if you don't have one):
    ```bash
    ssh-keygen -t ed25519 -C "your_email@example.com"
    ```
    *Press Enter for all defaults.*
2.  **Add Key to GitHub**:
    - Copy the key: `cat ~/.ssh/id_ed25519.pub` (or use Notepad to open it).
    - Go to GitHub **Settings** -> **SSH and GPG keys** -> **New SSH Key** -> Paste it.
3.  **Connect Remote via SSH**:
    ```bash
    git remote add origin git@github.com:USERNAME/REPO_NAME.git
    ```
4.  **Push**:
    ```bash
    git push -u origin main
    ```

---

## ⚡ Option 3: GitHub CLI (`gh`)
*The fastest method. Handles repository creation and pushing in one command.*

1.  **Install GH CLI**: [Download here](https://cli.github.com/).
2.  **Login**:
    ```bash
    gh auth login
    ```
3.  **Create & Push**:
    ```bash
    gh repo create REPO_NAME --public --source=. --remote=origin --push
    ```

---

## 🔍 Problem Solving & Troubleshooting

### 1. Error: `remote origin already exists`
**Cause**: You already connected this folder to a different repository.
**Solution**:
```bash
git remote remove origin
git remote add origin <NEW_URL>
```

### 2. Error: `Permission denied (publickey)`
**Cause**: Your SSH key isn't recognized by GitHub.
**Solution**:
- Ensure the SSH agent is running: `eval "$(ssh-agent -s)"`
- Add your key: `ssh-add ~/.ssh/id_ed25519`
- Check if GitHub recognizes you: `ssh -T git@github.com`

### 3. Error: `Updates were rejected... non-fast-forward`
**Cause**: GitHub has files (like a README.md) that your local computer doesn't have.
**Solution**:
```bash
git pull origin main --rebase
git push -u origin main
```

### 4. Large Files Issue
**Cause**: Pushing `node_modules` or large binaries.
**Solution**: Ensure your `.gitignore` is active.
- If you accidentally pushed `node_modules`:
  ```bash
  git rm -r --cached node_modules
  git commit -m "Remove node_modules from tracking"
  git push origin main
  ```

### 5. Authentication Failed (HTTPS)
**Cause**: GitHub no longer accepts account passwords for terminal push.
**Solution**: Use a **Personal Access Token (PAT)**.
- Generate one in GitHub **Settings** -> **Developer Settings** -> **Personal Access Tokens**.
- When prompted for a password in the terminal, paste the PAT.

---

## 💡 Pro Tip: Staging specific folders
If you only want to push the frontend or backend separately (not recommended for this repo):
```bash
git add backend/
git commit -m "Update backend logic"
```
