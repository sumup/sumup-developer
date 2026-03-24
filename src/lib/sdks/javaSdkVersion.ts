import { fetchLatestGithubTag } from "./fetchLatestGithubTag";

const JAVA_SDK_VERSION_FALLBACK = "0.0.6";

let javaSdkVersionPromise: Promise<string> | undefined;

export const getJavaSdkVersion = async (): Promise<string> => {
  if (!javaSdkVersionPromise) {
    javaSdkVersionPromise = fetchLatestGithubTag(
      "sumup",
      "sumup-java",
      JAVA_SDK_VERSION_FALLBACK,
    );
  }

  return javaSdkVersionPromise;
};
