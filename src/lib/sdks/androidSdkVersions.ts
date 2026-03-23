const ANDROID_READER_SDK_FALLBACK = "7.0.0";
const ANDROID_TAP_TO_PAY_SDK_VERSION = "1.0.6";
const githubToken = process.env.GITHUB_TOKEN;

let androidReaderSdkVersionPromise: Promise<string> | undefined;

const fetchLatestGithubTag = async (
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

export const getAndroidReaderSdkVersion = async (): Promise<string> => {
  if (!androidReaderSdkVersionPromise) {
    androidReaderSdkVersionPromise = fetchLatestGithubTag(
      "sumup",
      "sumup-android-sdk",
      ANDROID_READER_SDK_FALLBACK,
    );
  }

  return androidReaderSdkVersionPromise;
};

export const getAndroidTapToPaySdkVersion = async (): Promise<string> =>
  ANDROID_TAP_TO_PAY_SDK_VERSION;
