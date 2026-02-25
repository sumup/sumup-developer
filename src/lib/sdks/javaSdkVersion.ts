const JAVA_SDK_VERSION_FALLBACK = "0.0.6";

let javaSdkVersionPromise: Promise<string> | undefined;
const githubToken = process.env.GITHUB_TOKEN;

export const getJavaSdkVersion = async (): Promise<string> => {
  if (!javaSdkVersionPromise) {
    javaSdkVersionPromise = (async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/sumup/sumup-java/tags?per_page=1",
          {
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "sumup-developer-docs",
              ...(githubToken
                ? { Authorization: `Bearer ${githubToken}` }
                : {}),
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
        return JAVA_SDK_VERSION_FALLBACK;
      }
    })();
  }

  return javaSdkVersionPromise;
};
