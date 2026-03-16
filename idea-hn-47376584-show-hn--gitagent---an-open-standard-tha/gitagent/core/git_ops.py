import git
from pathlib import Path
from typing import List, Optional

class GitAgentRepo:
    """
    A wrapper around GitPython for GitAgent-specific operations.
    """
    def __init__(self, path: Path):
        self.path = path
        self._repo: Optional[git.Repo] = None

    def _get_repo(self) -> git.Repo:
        """
        Lazily loads the Git repository object.
        Raises an error if the path is not a Git repository.
        """
        if self._repo is None:
            try:
                self._repo = git.Repo(self.path)
            except git.InvalidGitRepositoryError:
                raise ValueError(f"Path '{self.path}' is not a valid Git repository.")
        return self._repo

    def is_git_repo(self) -> bool:
        """
        Checks if the given path is a Git repository.
        """
        try:
            git.Repo(self.path)
            return True
        except git.InvalidGitRepositoryError:
            return False

    def init_repo(self):
        """
        Initializes a new Git repository at the specified path.
        """
        if self.is_git_repo():
            raise ValueError(f"Git repository already exists at {self.path}")
        self._repo = git.Repo.init(self.path)

    def add_and_commit(self, files: List[str], message: str):
        """
        Adds specified files to the staging area and commits them.
        """
        repo = self._get_repo()
        repo.index.add(files)
        repo.index.commit(message)

    def get_current_commit_hash(self) -> str:
        """
        Returns the hash of the current HEAD commit.
        """
        repo = self._get_repo()
        return repo.head.commit.hexsha

    def get_repo_root(self) -> Path:
        """
        Returns the root path of the Git repository.
        """
        repo = self._get_repo()
        return Path(repo.working_dir)
