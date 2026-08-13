export const javaInstallExamples = (version: string) => [
  {
    label: "Gradle (Kotlin DSL)",
    language: "kotlin",
    code: `dependencies {\n    implementation("com.sumup:sumup-sdk:${version}")\n}`,
  },
  {
    label: "Gradle (Groovy)",
    language: "groovy",
    code: `dependencies {\n    implementation 'com.sumup:sumup-sdk:${version}'\n}`,
  },
  {
    label: "Maven",
    language: "xml",
    code: `<dependency>\n  <groupId>com.sumup</groupId>\n  <artifactId>sumup-sdk</artifactId>\n  <version>${version}</version>\n</dependency>`,
  },
];
