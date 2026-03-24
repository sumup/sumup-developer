const githubToken = process.env.GITHUB_TOKEN;

export const fetchLatestGithubTag = async (
  owner: string,
  repo: string,
  fallback: string,
): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "sumup-developer-docs",
          ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status}`);
    }

    const tags = (await response.json()) as { name?: string }[];
    const latestTag = tags[0]?.name?.trim();

    if (!latestTag) {
      throw new Error("No tags found");
    }

    return latestTag.replace(/^v/, "");
  } catch {
    return fallback;
  }
};
