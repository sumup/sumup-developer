import { type CollectionEntry, getCollection } from "astro:content";
import { ImageResponse } from "workers-og";

export async function getStaticPaths() {
  const docsEntries = await getCollection("docs");

  return docsEntries.map((entry) => ({
    params: { route: entry.id },
    props: entry.data,
  }));
}

interface Props {
  params: { route: string };
  props: CollectionEntry<"docs">["data"];
}

export async function GET({ props }: Props) {
  const html = {
    type: "div",
    key: "container",
    props: {
      style: {
        display: "flex",
      },
      children: [
        {
          type: "h1",
          key: "title",
          props: {
            style: {
              fontWeight: "bold",
              fontSize: "48px",
            },
            children: props.title,
          },
        },
        {
          type: "p",
          key: "description",
          props: {
            children: props.description,
          },
        },
      ],
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 600,
  });
}
