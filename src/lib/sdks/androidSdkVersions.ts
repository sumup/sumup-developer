import { readdir } from "node:fs/promises";

const ANDROID_READER_SDK_FALLBACK = "5.0.3";
const ANDROID_TAP_TO_PAY_SDK_FALLBACK = "1.0.4";

let androidReaderSdkVersionPromise: Promise<string> | undefined;
let androidTapToPaySdkVersionPromise: Promise<string> | undefined;

const parseSemver = (version: string): number[] => {
  const [major = "0", minor = "0", patch = "0"] = version.split(".");
  return [Number(major), Number(minor), Number(patch)];
};

const compareSemverDesc = (a: string, b: string): number => {
  const [aMajor, aMinor, aPatch] = parseSemver(a);
  const [bMajor, bMinor, bPatch] = parseSemver(b);

  if (aMajor !== bMajor) {
    return bMajor - aMajor;
  }

  if (aMinor !== bMinor) {
    return bMinor - aMinor;
  }

  return bPatch - aPatch;
};

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

const getLatestTapToPayVersionFromChangelog = async (): Promise<string> => {
  try {
    const changelogDir = new URL("../../content/changelog/", import.meta.url);
    const entries = await readdir(changelogDir, { withFileTypes: true });

    const versions = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.startsWith("android-tap-to-pay-") &&
          entry.name.endsWith(".md"),
      )
      .map((entry) => {
        const matched = entry.name.match(
          /^android-tap-to-pay-(\d+\.\d+\.\d+)\.md$/,
        );
        return matched?.[1];
      })
      .filter((version): version is string => Boolean(version))
      .sort(compareSemverDesc);

    return versions[0] ?? ANDROID_TAP_TO_PAY_SDK_FALLBACK;
  } catch {
    return ANDROID_TAP_TO_PAY_SDK_FALLBACK;
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

export const getAndroidTapToPaySdkVersion = async (): Promise<string> => {
  if (!androidTapToPaySdkVersionPromise) {
    androidTapToPaySdkVersionPromise = getLatestTapToPayVersionFromChangelog();
  }

  return androidTapToPaySdkVersionPromise;
};

