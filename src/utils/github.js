export const GITHUB_PROFILE = 'https://github.com/xbl1e';

const repositoryEndpoint = 'https://api.github.com/users/xbl1e/repos?type=owner&sort=updated&per_page=100';
let repositoriesRequest;

export function getGitHubRepos() {
  repositoriesRequest ??= fetchRepositories().catch(error => {
    repositoriesRequest = undefined;
    throw error;
  });

  return repositoriesRequest;
}

async function fetchRepositories() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(repositoryEndpoint, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`GitHub repositories returned ${response.status}`);
    }

    const repositories = await response.json();

    if (!Array.isArray(repositories)) {
      throw new Error('GitHub did not return a repository list');
    }

    return repositories;
  } finally {
    clearTimeout(timeout);
  }
}
